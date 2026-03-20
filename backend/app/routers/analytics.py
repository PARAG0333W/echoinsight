"""
EchoInsight AI — Analytics Router
Dashboard-level aggregate analytics.
"""

from fastapi import APIRouter, Query, Depends
from typing import Optional
from app.database import get_supabase_admin
from app.utils.logger import logger
from app.dependencies import get_user_id

router = APIRouter()


@router.get("/analytics/overview")
async def get_overview_stats(user_id: str = Depends(get_user_id)):
    """Get high-level dashboard statistics for the current user."""
    supabase = get_supabase_admin()

    # Total conversations for THIS user
    all_convos = (
        supabase.table("conversations")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    total = all_convos.count or 0

    # Analyzed conversations
    analyzed = (
        supabase.table("conversations")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("status", "analyzed")
        .execute()
    )
    analyzed_count = analyzed.count or 0

    # Average score (only from user's analyses)
    avg_score = None
    if analyzed_count > 0:
        # Join with conversations to ensure user_id scoping
        user_scores = (
            supabase.table("analysis_results")
            .select("overall_score, conversations!inner(user_id)")
            .eq("conversations.user_id", user_id)
            .execute()
        )
        if user_scores.data:
            total_score = sum(r["overall_score"] for r in user_scores.data)
            avg_score = round(total_score / len(user_scores.data), 1)

    # High risk count
    high_risks = (
        supabase.table("risks")
        .select("id", count="exact, conversations!inner(user_id)")
        .eq("conversations.user_id", user_id)
        .in_("severity", ["high", "critical"])
        .eq("is_resolved", False)
        .execute()
    )

    # Total mistakes
    total_mistakes = (
        supabase.table("mistakes")
        .select("id", count="exact, analysis_results!inner(conversations!inner(user_id))")
        .eq("analysis_results.conversations.user_id", user_id)
        .execute()
    )

    return {
        "success": True,
        "data": {
            "total_conversations": total,
            "analyzed_count": analyzed_count,
            "average_score": avg_score,
            "high_risk_count": high_risks.count or 0,
            "total_mistakes": total_mistakes.count or 0,
        },
    }


@router.get("/analytics/agents")
async def get_agent_performance(user_id: str = Depends(get_user_id)):
    """Get performance metrics for agents involved in USER'S conversations."""
    supabase = get_supabase_admin()

    # Since we don't have a strict user-agent relationship in the DB, 
    # we'll look at agents who have handled conversations for this user.
    user_convos = (
        supabase.table("conversations")
        .select("agent_id, agents(full_name, department)")
        .eq("user_id", user_id)
        .not_.is_("agent_id", "null")
        .execute()
    )
    
    unique_agents = {}
    for c in (user_convos.data or []):
        aid = c["agent_id"]
        if aid not in unique_agents:
            agent = c.get("agents") or {}
            unique_agents[aid] = {
                "id": aid,
                "full_name": agent.get("full_name") or "Unknown Agent",
                "department": agent.get("department")
            }

    agent_stats = []
    for aid, agent in unique_agents.items():
        convos = (
            supabase.table("conversations")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("agent_id", aid)
            .eq("status", "analyzed")
            .execute()
        )

        avg_score = None
        if convos.data:
            conv_ids = [c["id"] for c in convos.data]
            analyses = (
                supabase.table("analysis_results")
                .select("overall_score")
                .in_("conversation_id", conv_ids)
                .execute()
            )
            if analyses.data:
                total = sum(a["overall_score"] for a in analyses.data)
                avg_score = round(total / len(analyses.data), 1)

        agent_stats.append({
            "agent_id": aid,
            "agent_name": agent["full_name"],
            "department": agent.get("department"),
            "total_conversations": convos.count or 0,
            "avg_score": avg_score,
        })

    return {"success": True, "data": agent_stats}


@router.get("/analytics/score-distribution")
async def get_score_distribution(user_id: str = Depends(get_user_id)):
    """Get distribution of overall scores across USER'S conversations."""
    supabase = get_supabase_admin()

    results = (
        supabase.table("analysis_results")
        .select("overall_score, conversations!inner(user_id)")
        .eq("conversations.user_id", user_id)
        .execute()
    )

    buckets = {"0-20": 0, "20-40": 0, "40-60": 0, "60-80": 0, "80-100": 0}
    for r in (results.data or []):
        score = r["overall_score"]
        if score < 20: buckets["0-20"] += 1
        elif score < 40: buckets["20-40"] += 1
        elif score < 60: buckets["40-60"] += 1
        elif score < 80: buckets["60-80"] += 1
        else: buckets["80-100"] += 1

    return {
        "success": True,
        "data": [{"range": k, "count": v} for k, v in buckets.items()],
    }


@router.get("/analytics/mistake-categories")
async def get_mistake_categories(user_id: str = Depends(get_user_id)):
    """Get mistake distribution for user's data."""
    supabase = get_supabase_admin()

    mistakes = (
        supabase.table("mistakes")
        .select("category, severity, analysis_results!inner(conversations!inner(user_id))")
        .eq("analysis_results.conversations.user_id", user_id)
        .execute()
    )

    categories = {}
    for m in (mistakes.data or []):
        cat = m["category"]
        if cat not in categories:
            categories[cat] = {"category": cat, "count": 0, "high_severity": 0}
        categories[cat]["count"] += 1
        if m["severity"] in ("high", "critical"):
            categories[cat]["high_severity"] += 1

    return {"success": True, "data": list(categories.values())}


@router.get("/analytics/risk-summary")
async def get_risk_summary(user_id: str = Depends(get_user_id)):
    """Get risk distribution for user's data."""
    supabase = get_supabase_admin()

    risks = (
        supabase.table("risks")
        .select("risk_type, severity, is_resolved, conversations!inner(user_id)")
        .eq("conversations.user_id", user_id)
        .execute()
    )

    summary = {}
    for r in (risks.data or []):
        key = f"{r['risk_type']}_{r['severity']}"
        if key not in summary:
            summary[key] = {
                "risk_type": r["risk_type"],
                "severity": r["severity"],
                "total": 0,
                "resolved": 0,
                "unresolved": 0,
            }
        summary[key]["total"] += 1
        if r["is_resolved"]:
            summary[key]["resolved"] += 1
        else:
            summary[key]["unresolved"] += 1

    return {"success": True, "data": list(summary.values())}
