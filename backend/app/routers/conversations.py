"""
EchoInsight AI — Conversations Router
CRUD operations for conversations.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from app.database import get_supabase_admin
from app.services.pipeline import PipelineOrchestrator
from app.utils.logger import logger
from app.dependencies import get_user_id

router = APIRouter()


@router.get("/conversations")
async def list_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None),
    user_id: str = Depends(get_user_id),
):
    """List conversations for the current user."""
    supabase = get_supabase_admin()
    offset = (page - 1) * limit

    query = (
        supabase.table("conversations")
        .select("*, agents(full_name, department), analysis_results(overall_score)", count="exact")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if status:
        query = query.eq("status", status)
    if agent_id:
        query = query.eq("agent_id", agent_id)

    result = query.execute()

    conversations = []
    for conv in (result.data or []):
        agent = conv.pop("agents", None) or {}
        analysis = conv.pop("analysis_results", None) or []
        # Use agent_name from conversation table if available, else from join
        conv["agent_name"] = conv.get("agent_name") or agent.get("full_name")
        conv["agent_department"] = agent.get("department")
        # Flatten overall_score from analysis_results (one-to-one relationship)
        if analysis and isinstance(analysis, list) and len(analysis) > 0:
            conv["overall_score"] = analysis[0].get("overall_score")
        elif isinstance(analysis, dict):
            conv["overall_score"] = analysis.get("overall_score")
        else:
            conv["overall_score"] = None
        conversations.append(conv)

    return {
        "success": True,
        "data": conversations,
        "meta": {
            "page": page,
            "limit": limit,
            "total": result.count or 0,
        },
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get a specific conversation, ensuring it belongs to the user."""
    supabase = get_supabase_admin()

    try:
        result = (
            supabase.table("conversations")
            .select("*, agents(full_name, department)")
            .eq("id", conversation_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied")

    conv = result.data
    agent = conv.pop("agents", None) or {}
    conv["agent_name"] = conv.get("agent_name") or agent.get("full_name")
    conv["agent_department"] = agent.get("department")

    return {"success": True, "data": conv}


@router.get("/conversations/{conversation_id}/transcript")
async def get_transcript(conversation_id: str):
    """Get the parsed transcript (messages) of a conversation."""
    supabase = get_supabase_admin()

    result = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("turn_index")
        .execute()
    )

    return {"success": True, "data": result.data or []}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Delete a conversation belonging to the user."""
    supabase = get_supabase_admin()

    try:
        # Check ownership first
        check = supabase.table("conversations").select("id").eq("id", conversation_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Conversation not found or access denied")

        # Get storage path before deleting
        conv = (
            supabase.table("conversations")
            .select("storage_path")
            .eq("id", conversation_id)
            .single()
            .execute()
        )

        # Delete from storage
        if conv.data and conv.data.get("storage_path"):
            try:
                from app.config import get_settings
                settings = get_settings()
                supabase.storage.from_(settings.STORAGE_BUCKET).remove([conv.data["storage_path"]])
            except Exception as e:
                logger.warning(f"Could not delete file from storage: {e}")

        # Delete from DB (cascades handle related records)
        supabase.table("conversations").delete().eq("id", conversation_id).execute()

        return {"success": True, "message": "Conversation deleted successfully"}
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations/{conversation_id}/reanalyze")
async def reanalyze_conversation(conversation_id: str):
    """Re-run the analysis pipeline on an existing conversation."""
    try:
        orchestrator = PipelineOrchestrator()
        result = orchestrator.process(conversation_id)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Re-analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
