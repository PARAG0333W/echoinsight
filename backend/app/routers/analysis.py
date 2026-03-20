"""
EchoInsight AI — Analysis Router
Endpoints for fetching analysis results, scores, mistakes, and risks.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase_admin
from app.utils.logger import logger
from app.dependencies import get_user_id

router = APIRouter()


@router.get("/conversations/{conversation_id}/results")
async def get_analysis_results(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get the full analysis results, ensuring user ownership."""
    supabase = get_supabase_admin()

    # Verify conversation ownership
    conv = supabase.table("conversations").select("id").eq("id", conversation_id).eq("user_id", user_id).execute()
    if not conv.data:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch analysis
    ar = (
        supabase.table("analysis_results")
        .select("*")
        .eq("conversation_id", conversation_id)
        .single()
        .execute()
    )
    if not ar.data:
        raise HTTPException(status_code=404, detail="No analysis results found")

    analysis = ar.data
    analysis_id = analysis["id"]

    # Fetch related data
    scores = supabase.table("scores").select("*").eq("analysis_id", analysis_id).execute()
    mistakes = (
        supabase.table("mistakes")
        .select("*, suggested_responses(*)")
        .eq("analysis_id", analysis_id)
        .execute()
    )
    risks = supabase.table("risks").select("*").eq("analysis_id", analysis_id).execute()

    return {
        "success": True,
        "data": {
            **analysis,
            "scores": scores.data or [],
            "mistakes": mistakes.data or [],
            "risks": risks.data or [],
        },
    }


@router.get("/conversations/{conversation_id}/scores")
async def get_scores(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get score breakdown, ensuring user ownership."""
    supabase = get_supabase_admin()

    # Verify ownership
    ar = (
        supabase.table("analysis_results")
        .select("id, conversations!inner(user_id)")
        .eq("conversation_id", conversation_id)
        .eq("conversations.user_id", user_id)
        .execute()
    )
    if not ar.data:
        raise HTTPException(status_code=404, detail="No analysis found or access denied")

    analysis_id = ar.data[0]["id"]
    scores = supabase.table("scores").select("*").eq("analysis_id", analysis_id).execute()

    return {"success": True, "data": scores.data or []}


@router.get("/conversations/{conversation_id}/mistakes")
async def get_mistakes(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get detected mistakes, ensuring user ownership."""
    supabase = get_supabase_admin()

    ar = (
        supabase.table("analysis_results")
        .select("id, conversations!inner(user_id)")
        .eq("conversation_id", conversation_id)
        .eq("conversations.user_id", user_id)
        .execute()
    )
    if not ar.data:
        raise HTTPException(status_code=404, detail="No analysis found or access denied")

    analysis_id = ar.data[0]["id"]
    mistakes = (
        supabase.table("mistakes")
        .select("*, suggested_responses(*)")
        .eq("analysis_id", analysis_id)
        .execute()
    )

    return {"success": True, "data": mistakes.data or []}


@router.get("/conversations/{conversation_id}/improvements")
async def get_improvements(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Get all suggested response improvements for a conversation, ensuring user ownership."""
    supabase = get_supabase_admin()

    ar = (
        supabase.table("analysis_results")
        .select("id, conversations!inner(user_id)")
        .eq("conversation_id", conversation_id)
        .eq("conversations.user_id", user_id)
        .execute()
    )
    if not ar.data:
        raise HTTPException(status_code=404, detail="No analysis found or access denied")

    analysis_id = ar.data[0]["id"]

    # Get mistakes with their suggestions
    mistakes = (
        supabase.table("mistakes")
        .select("id, category, severity, title, original_text, turn_index, suggested_responses(*)")
        .eq("analysis_id", analysis_id)
        .execute()
    )

    improvements = []
    for mistake in (mistakes.data or []):
        suggestions = mistake.pop("suggested_responses", [])
        for sug in suggestions:
            improvements.append({
                "mistake": mistake,
                "suggestion": sug,
            })

    return {"success": True, "data": improvements}


@router.get("/conversations/{conversation_id}/risks")
async def get_risks(conversation_id: str):
    """Get risk flags for a conversation."""
    supabase = get_supabase_admin()

    ar = supabase.table("analysis_results").select("id").eq("conversation_id", conversation_id).execute()
    if not ar.data:
        raise HTTPException(status_code=404, detail="No analysis found")

    analysis_id = ar.data[0]["id"]
    risks = supabase.table("risks").select("*").eq("analysis_id", analysis_id).execute()

    return {"success": True, "data": risks.data or []}
