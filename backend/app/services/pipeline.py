"""
EchoInsight AI — Pipeline Orchestrator
Runs the full processing pipeline for an uploaded conversation.
"""

from app.services.upload_service import UploadService
from app.services.transcription_service import TranscriptionService
from app.services.text_extraction_service import TextExtractionService
from app.services.conversation_parser import ConversationParser
from app.services.ai_analysis_service import AIAnalysisService
from app.database import get_supabase_admin
from app.utils.logger import logger
from app.utils.helpers import get_file_extension, generate_uuid, get_utc_now


class PipelineOrchestrator:
    """
    Orchestrates the full processing pipeline:
    Upload → Transcribe/Extract → Parse → Analyze → Store
    """

    def __init__(self):
        self.upload_service = UploadService()
        self.transcription_service = TranscriptionService()
        self.text_extraction_service = TextExtractionService()
        self.parser = ConversationParser()
        self.analysis_service = AIAnalysisService()
        self.supabase = get_supabase_admin()

    def process(self, conversation_id: str) -> dict:
        """
        Run the full pipeline for a given conversation ID.
        Returns the final analysis result.
        """
        logger.info(f"Starting pipeline for conversation: {conversation_id}")

        try:
            # ── 1. Fetch conversation record ──────────────
            conv_result = (
                self.supabase.table("conversations")
                .select("*")
                .eq("id", conversation_id)
                .single()
                .execute()
            )
            conversation = conv_result.data
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # ── 1.1 Concurrency Check ─────────────────────
            current_status = conversation.get("status")
            if current_status in ("processing", "analyzing", "transcribing", "parsing"):
                logger.warning(f"Pipeline already running for {conversation_id} (status: {current_status}). Skipping.")
                return {"status": "already_running", "current_status": current_status}

            file_type = conversation["file_type"]
            storage_path = conversation["storage_path"]
            file_ext = get_file_extension(conversation["file_name"])

            # ── 2. Download the file ──────────────────────
            self._update_status(conversation_id, "processing")
            file_bytes = self.upload_service.download_file(storage_path)
            logger.info(f"Downloaded file: {len(file_bytes)} bytes")

            # ── 3. Transcribe or Extract ──────────────────
            raw_text = ""
            if file_type == "audio":
                transcript = self.transcription_service.transcribe(file_bytes, file_ext)
                raw_text = transcript["text"]

                # Update duration
                if transcript.get("duration"):
                    self.supabase.table("conversations").update({
                        "duration_seconds": int(transcript["duration"]),
                        "language": transcript.get("language", "en"),
                    }).eq("id", conversation_id).execute()

                self._update_status(conversation_id, "transcribed")

            elif file_type == "document":
                raw_text = self.text_extraction_service.extract_text(file_bytes, conversation["file_name"])
                self._update_status(conversation_id, "text_extracted")

            if not raw_text.strip():
                raise ValueError("No text could be extracted from the file")

            # ── 4. Parse conversation ─────────────────────
            parsed = self.parser.parse(raw_text)
            turns = parsed.get("turns", [])

            # Store messages in DB
            self._store_messages(conversation_id, turns, raw_text, parsed)
            self._update_status(conversation_id, "parsed")

            # ── 5. AI Analysis ────────────────────────────
            self._update_status(conversation_id, "analyzing")
            result = self.analysis_service.analyze(conversation_id, turns)

            # ── 6. Mark complete ──────────────────────────
            self._update_status(conversation_id, "analyzed")
            logger.info(f"Pipeline complete for {conversation_id} — score: {result.get('overall_score')}")

            return result

        except Exception as e:
            logger.error(f"Pipeline failed for {conversation_id}: {e}")
            self._update_status(conversation_id, "failed", str(e))
            raise

    def _update_status(self, conversation_id: str, status: str, error: str | None = None):
        """Update conversation status."""
        self.upload_service.update_conversation_status(conversation_id, status, error)

    def _store_messages(self, conversation_id: str, turns: list[dict], raw_text: str, parsed: dict):
        """Store structured messages and transcript in DB."""
        now = get_utc_now()

        # Individual messages are stored below, skipping 'transcripts' table which does not exist in schema.

        # Store individual messages
        messages = []
        for turn in turns:
            messages.append({
                "id": generate_uuid(),
                "conversation_id": conversation_id,
                "turn_index": turn.get("turn_index", 0),
                "speaker": turn.get("speaker", "agent"),
                "speaker_name": turn.get("speaker_name"),
                "content": turn.get("content", ""),
                "created_at": now,
            })

        if messages:
            try:
                # Delete old messages first
                self.supabase.table("messages").delete().eq("conversation_id", conversation_id).execute()
                self.supabase.table("messages").insert(messages).execute()
                logger.info(f"Stored {len(messages)} messages")
            except Exception as e:
                logger.error(f"Failed to store messages: {e}")
