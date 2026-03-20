"""
EchoInsight AI — Report Service
Generates consolidated reports for conversations.
"""

from app.database import get_supabase_admin
from app.utils.logger import logger
from app.utils.helpers import get_utc_now


class ReportService:
    """Generate detailed reports for analyzed conversations."""

    def __init__(self):
        self.supabase = get_supabase_admin()

    def generate_report(self, conversation_id: str) -> dict:
        """
        Generate a full report for an analyzed conversation.
        Pulls data from all related tables and assembles a report.
        """
        # Fetch conversation
        conv = (
            self.supabase.table("conversations")
            .select("*, agents(full_name, department)")
            .eq("id", conversation_id)
            .single()
            .execute()
        )
        conversation = conv.data
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        if conversation.get("status") != "analyzed":
            raise ValueError("Conversation has not been analyzed yet")

        # Fetch analysis
        ar = (
            self.supabase.table("analysis_results")
            .select("*")
            .eq("conversation_id", conversation_id)
            .single()
            .execute()
        )
        analysis = ar.data
        if not analysis:
            raise ValueError("No analysis results found")

        analysis_id = analysis["id"]

        # Fetch scores
        scores_result = (
            self.supabase.table("scores")
            .select("category, score, weight, justification")
            .eq("analysis_id", analysis_id)
            .execute()
        )
        scores = scores_result.data or []

        # Fetch mistakes with suggestions
        mistakes_result = (
            self.supabase.table("mistakes")
            .select("*, suggested_responses(*)")
            .eq("analysis_id", analysis_id)
            .execute()
        )
        mistakes = mistakes_result.data or []

        # Fetch risks
        risks_result = (
            self.supabase.table("risks")
            .select("*")
            .eq("analysis_id", analysis_id)
            .execute()
        )
        risks = risks_result.data or []

        # Fetch messages
        messages_result = (
            self.supabase.table("messages")
            .select("turn_index, speaker, speaker_name, content")
            .eq("conversation_id", conversation_id)
            .order("turn_index")
            .execute()
        )
        messages = messages_result.data or []

        # Build report
        agent_info = conversation.get("agents") or {}
        report = {
            "conversation_id": conversation_id,
            "agent_name": agent_info.get("full_name"),
            "agent_department": agent_info.get("department"),
            "file_name": conversation.get("file_name"),
            "file_type": conversation.get("file_type"),
            "call_date": conversation.get("call_date"),
            "duration_seconds": conversation.get("duration_seconds"),
            "overall_score": analysis.get("overall_score"),
            "overall_sentiment": analysis.get("overall_sentiment"),
            "summary": analysis.get("summary"),
            "key_topics": analysis.get("key_topics", []),
            "positive_highlights": analysis.get("positive_highlights", []),
            "areas_of_concern": analysis.get("areas_of_concern", []),
            "scores": scores,
            "transcript": messages,
            "mistakes": [
                {
                    "category": m.get("category"),
                    "severity": m.get("severity"),
                    "title": m.get("title"),
                    "description": m.get("description"),
                    "original_text": m.get("original_text"),
                    "turn_index": m.get("turn_index"),
                    "impact": m.get("impact"),
                    "suggestions": m.get("suggested_responses", []),
                }
                for m in mistakes
            ],
            "risks": [
                {
                    "risk_type": r.get("risk_type"),
                    "severity": r.get("severity"),
                    "title": r.get("title"),
                    "description": r.get("description"),
                    "evidence": r.get("evidence"),
                    "recommended_action": r.get("recommended_action"),
                    "is_resolved": r.get("is_resolved", False),
                }
                for r in risks
            ],
            "processing_time_ms": analysis.get("processing_time_ms"),
            "analyzed_at": analysis.get("analyzed_at"),
            "llm_raw_response": analysis.get("llm_raw_response", {}),
            "improved_responses": (
                analysis.get("llm_raw_response") or {}
            ).get("improved_responses", []),
            "generated_at": get_utc_now(),
        }

        logger.info(f"Report generated for conversation {conversation_id}")
        return report
