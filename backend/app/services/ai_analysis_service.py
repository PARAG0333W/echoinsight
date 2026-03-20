"""
EchoInsight AI — AI Analysis Service
Orchestrates the full AI analysis pipeline using Google Gemini.
"""

import json
import re
import time
from google import genai
from app.config import get_settings
from app.database import get_supabase_admin
from app.prompts.analysis import ANALYSIS_PROMPT
from app.utils.logger import logger
from app.utils.helpers import generate_uuid, get_utc_now

settings = get_settings()


class AIAnalysisService:
    """Run the full AI analysis pipeline on a parsed conversation."""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.supabase = get_supabase_admin()

    def analyze(self, conversation_id: str, turns: list[dict]) -> dict:
        """
        Run comprehensive analysis on conversation turns.

        1. Format conversation for the LLM
        2. Send to Gemini
        3. Parse response
        4. Store results in DB (analysis_results, scores, mistakes, suggested_responses, risks)
        5. Return the full analysis result
        """
        start_time = time.time()

        # ── Format conversation ───────────────────────────
        conversation_text = self._format_conversation(turns)

        # ── Call Gemini with Structured Output ────────────
        prompt = ANALYSIS_PROMPT.format(conversation=conversation_text)

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                }
            )
            response_text = response.text.strip()
            logger.info(f"Gemini response received ({len(response_text)} chars)")
            print(f"DEBUG: AI Response: {response_text}") # As requested by user for validation
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise RuntimeError(f"AI analysis failed: {e}")

        # ── Parse JSON response ───────────────────────────
        analysis = self._parse_llm_response(response_text)

        processing_time_ms = int((time.time() - start_time) * 1000)
        analysis["processing_time_ms"] = processing_time_ms

        # ── Store in database ─────────────────────────────
        stored = self._store_results(conversation_id, analysis, response_text)

        return stored

    def _format_conversation(self, turns: list[dict]) -> str:
        """Format turns into readable conversation text."""
        lines = []
        for turn in turns:
            speaker = turn.get("speaker", "unknown").capitalize()
            name = turn.get("speaker_name")
            label = f"{speaker}" + (f" ({name})" if name else "")
            content = turn.get("content", "")
            lines.append(f"[Turn {turn.get('turn_index', 0)}] {label}: {content}")
        return "\n".join(lines)

    def _parse_llm_response(self, text: str) -> dict:
        """Parse and validate the LLM JSON response without hardcoded defaults."""
        data = {}
        
        # Cleanup potential markdown-style JSON
        if text.strip().startswith("```"):
            clean_text = re.sub(r"^```(?:json)?\n?", "", text.strip())
            clean_text = re.sub(r"\n?```$", "", clean_text)
        else:
            clean_text = text.strip()
        
        try:
            data = json.loads(clean_text)
            if isinstance(data, str):
                data = json.loads(data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.debug(f"Raw response: {text[:500]}")
            # Do NOT return a 50/50 default. Return empty or raise to show real failure.
            return {}

        if not isinstance(data, dict):
            logger.error(f"Expected dict from LLM, got {type(data)}")
            return {}
                    
        return data

    def _store_results(self, conversation_id: str, analysis: dict, raw_response: str) -> dict:
        """Persist results. Map the user's requested JSON to our relational tables."""
        now = get_utc_now()
        
        # ── 1. Determine analysis_id (reuse if exists) ─────
        try:
            existing = (
                self.supabase.table("analysis_results")
                .select("id")
                .eq("conversation_id", conversation_id)
                .maybe_single()
                .execute()
            )
            # Supabase-py 2.x returns a Response object with .data
            # In some versions, errors are in .error, in others they raise
            if hasattr(existing, "error") and existing.error:
                logger.error(f"Error checking for existing analysis: {existing.error}")
                analysis_id = generate_uuid()
            elif existing.data:
                analysis_id = existing.data["id"]
                logger.info(f"Reusing existing analysis_id: {analysis_id}")
            else:
                analysis_id = generate_uuid()
        except Exception as e:
            logger.warning(f"Failed to check existing analysis_results: {e}")
            analysis_id = generate_uuid()

        scores_to_avg = [
            analysis.get("communication_score"),
            analysis.get("tone_score"),
            analysis.get("empathy_score"),
            analysis.get("professionalism_score"),
            analysis.get("solution_score")
        ]
        valid_scores = [s for s in scores_to_avg if s is not None]
        overall = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0

        # ── 2. analysis_results (UPSERT) ──────────────────
        analysis_record = {
            "id": analysis_id,
            "conversation_id": conversation_id,
            "overall_score": overall,
            "overall_sentiment": analysis.get("sentiment", "neutral"),
            "summary": f"Analyzed at {now}",
            "key_topics": analysis.get("suggested_phrases", []),
            "llm_model_used": settings.GEMINI_MODEL,
            "llm_raw_response": analysis, 
            "processing_time_ms": analysis.get("processing_time_ms"),
            "analyzed_at": now,
        }

        # Ensure sentiment is valid enum value
        if analysis_record["overall_sentiment"] not in ("positive", "neutral", "negative"):
            analysis_record["overall_sentiment"] = "neutral"

        try:
            # Upsert updated result
            res = self.supabase.table("analysis_results").upsert(analysis_record, on_conflict="conversation_id").execute()
            if hasattr(res, "error") and res.error:
                raise RuntimeError(f"DB Error (analysis_results): {res.error}")
        except Exception as e:
            logger.error(f"Failed to upsert analysis result: {e}")
            raise

        # ── 3. Clean up children before re-insert ─────────
        # Note: ON DELETE CASCADE handles this if we delete analysis_results, 
        # but since we are UPSERTing (updating), we manually clean up children.
        try:
            self.supabase.table("scores").delete().eq("analysis_id", analysis_id).execute()
            self.supabase.table("mistakes").delete().eq("analysis_id", analysis_id).execute()
            self.supabase.table("risks").delete().eq("analysis_id", analysis_id).execute()
        except Exception as e:
            logger.warning(f"Minor failure during child cleanup: {e}")

        # ── 4. scores ─────────────────────────────────────
        score_mappings = [
            ("clarity", analysis.get("communication_score")),
            ("professionalism", analysis.get("professionalism_score")),
            ("empathy", analysis.get("empathy_score")),
            ("resolution", analysis.get("solution_score")),
            ("greeting", analysis.get("tone_score"))
        ]
        scores_data = []
        for cat, val in score_mappings:
            if val is not None:
                scores_data.append({
                    "id": generate_uuid(),
                    "analysis_id": analysis_id,
                    "category": cat,
                    "score": val,
                    "weight": 0.2,
                    "created_at": now,
                })
        
        if scores_data:
            res = self.supabase.table("scores").insert(scores_data).execute()
            if hasattr(res, "error") and res.error:
                logger.error(f"Failed to store scores: {res.error}")

        # ── 3. mistakes + improved responses ──────────────
        improved_dict = {
            imp.get("original", ""): imp.get("improved", "") 
            for imp in analysis.get("improved_responses", [])
        }
        
        for idx, mistake in enumerate(analysis.get("mistakes", [])):
            mistake_id = generate_uuid()
            mistake_record = {
                "id": mistake_id,
                "analysis_id": analysis_id,
                "category": "accuracy",
                "severity": "medium",
                "title": f"Mistake {idx+1}",
                "description": mistake.get("mistake", "Unknown mistake"),
                "turn_index": mistake.get("turn_index"),
                "created_at": now,
            }
            try:
                self.supabase.table("mistakes").insert(mistake_record).execute()
            except Exception as e:
                logger.error(f"Failed to store mistake: {e}")
                continue
                
        # ── 4. risks (from risk_level) ────────────────────
        rl = analysis.get("risk_level", "low").lower()
        if rl in ("high", "critical"):
            try:
                self.supabase.table("risks").insert({
                    "id": generate_uuid(),
                    "analysis_id": analysis_id,
                    "risk_type": "escalation",
                    "severity": rl,
                    "title": f"{rl.capitalize()} Risk Detected",
                    "description": "Risk level flagged by AI",
                    "is_resolved": False,
                    "created_at": now,
                }).execute()
            except Exception:
                pass

        # Return the exact JSON structure the user requested (plus metadata)
        return {
            "id": analysis_id,
            "conversation_id": conversation_id,
            "overall_score": overall,
            "communication_score": analysis.get("communication_score"),
            "tone_score": analysis.get("tone_score"),
            "empathy_score": analysis.get("empathy_score"),
            "professionalism_score": analysis.get("professionalism_score"),
            "solution_score": analysis.get("solution_score"),
            "sentiment": analysis.get("sentiment"),
            "mistakes": analysis.get("mistakes", []),
            "improved_responses": analysis.get("improved_responses", []),
            "suggested_phrases": analysis.get("suggested_phrases", []),
            "risk_level": analysis.get("risk_level"),
            "processing_time_ms": analysis.get("processing_time_ms"),
            "analyzed_at": now,
        }
