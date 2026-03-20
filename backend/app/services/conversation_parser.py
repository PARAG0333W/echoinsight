"""
EchoInsight AI — Conversation Parser
Parses raw transcript text into structured dialogue turns.
"""

import re
import json
from google import genai
from app.config import get_settings
from app.utils.logger import logger

settings = get_settings()

PARSER_PROMPT = """You are a conversation parser. Given a raw transcript of a customer-agent phone call or chat, 
extract the structured dialogue.

Rules:
1. Identify each speaker turn. Label speakers as "agent" or "customer".
2. If a speaker name is given (e.g., "John:", "Agent:", "Customer:"), extract it.
3. If no names are present, infer based on context (the one greeting/helping is typically the agent).
4. Return ONLY valid JSON — no markdown fences, no explanation.
5. If the text is already structured (e.g., "Agent: ... Customer: ..."), preserve that structure.

Return this exact JSON structure:
{
  "turns": [
    {
      "turn_index": 0,
      "speaker": "agent",
      "speaker_name": "agent name or null",
      "content": "the message text"
    }
  ],
  "detected_language": "en",
  "agent_name": "detected agent name or null",
  "customer_name": "detected customer name or null"
}

RAW TRANSCRIPT:
"""


class ConversationParser:
    """Parse raw text into structured conversation turns."""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def parse(self, raw_text: str) -> dict:
        """
        Parse raw text into structured dialogue.

        First tries rule-based parsing, falls back to LLM-based parsing.
        """
        # Attempt rule-based parsing first
        rule_result = self._rule_based_parse(raw_text)
        if rule_result and len(rule_result.get("turns", [])) >= 2:
            logger.info(f"Rule-based parsing succeeded: {len(rule_result['turns'])} turns")
            return rule_result

        # Fall back to LLM
        logger.info("Falling back to LLM-based conversation parsing")
        return self._llm_parse(raw_text)

    def _rule_based_parse(self, text: str) -> dict | None:
        """
        Robustly parse conversation using patterns like 'Speaker: msg'.
        Captures multi-line messages and leading intro text.
        """
        # Improved patterns supporting leading whitespace and more separators
        patterns = [
            r"^\s*(?P<label>agent|customer|representative|rep|caller|user|human|assistant|system)(?:\s*\(.*?\))?\s*[:\-=>]\s*(?P<content>.*)",
            r"^\s*\[(?P<label>agent|customer|representative|rep|caller|user|human|assistant|system)\]\s*(?P<content>.*)",
        ]

        turns = []
        current_speaker = None
        current_text = []
        turn_index = 0
        intro_text = []

        for line_raw in text.split("\n"):
            line = line_raw.strip()
            if not line:
                continue

            matched = False
            for pattern in patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    # Save previous turn if it exists
                    if current_speaker:
                        turns.append({
                            "turn_index": turn_index,
                            "speaker": self._normalize_speaker(current_speaker),
                            "speaker_name": None,
                            "content": " ".join(current_text).strip(),
                        })
                        turn_index += 1
                        current_text = []
                    
                    current_speaker = match.group("label")
                    content = match.group("content").strip()
                    if content:
                        current_text.append(content)
                    
                    # If we had intro text, prepend it to the first REAL turn
                    if intro_text and turn_index == 0:
                        current_text = intro_text + current_text
                        intro_text = []
                        
                    matched = True
                    break

            if not matched:
                if current_speaker:
                    current_text.append(line)
                else:
                    intro_text.append(line)

        # Save the very last turn
        if current_speaker:
            turns.append({
                "turn_index": turn_index,
                "speaker": self._normalize_speaker(current_speaker),
                "speaker_name": None,
                "content": " ".join(current_text).strip(),
            })

        if not turns:
            return None

        logger.info(f"Rule-based parsing succeeded: {len(turns)} turns captured")
        return {
            "turns": turns,
            "detected_language": "en",
            "agent_name": None,
            "customer_name": None,
        }

    def _normalize_speaker(self, speaker: str) -> str:
        """Normalize speaker label to 'agent' or 'customer'."""
        s = speaker.lower().strip()
        if s in ("agent", "representative", "rep"):
            return "agent"
        return "customer"

    def _llm_parse(self, raw_text: str) -> dict:
        """Use Gemini to parse unstructured conversation text."""
        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=PARSER_PROMPT + raw_text,
            )

            response_text = response.text.strip()

            # Strip markdown code fences if present
            if response_text.startswith("```"):
                response_text = re.sub(r"^```(?:json)?\n?", "", response_text)
                response_text = re.sub(r"\n?```$", "", response_text)

            parsed = json.loads(response_text)

            # Validate structure
            if "turns" not in parsed or not isinstance(parsed["turns"], list):
                raise ValueError("Invalid parsed structure: missing 'turns' array")

            logger.info(f"LLM parsing succeeded: {len(parsed['turns'])} turns")
            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"LLM JSON parse error: {e}")
            # Return a single-turn fallback
            return {
                "turns": [
                    {
                        "turn_index": 0,
                        "speaker": "agent",
                        "speaker_name": None,
                        "content": raw_text.strip(),
                    }
                ],
                "detected_language": "en",
                "agent_name": None,
                "customer_name": None,
            }
        except Exception as e:
            logger.error(f"LLM parsing failed: {e}")
            raise RuntimeError(f"Conversation parsing failed: {e}")
