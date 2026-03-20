"""
EchoInsight AI — Reports Router
Generates consolidated conversation reports.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.services.report_service import ReportService
from app.utils.logger import logger
from app.dependencies import get_user_id
from app.database import get_supabase_admin

router = APIRouter()


@router.get("/conversations/{conversation_id}/report")
async def get_conversation_report(
    conversation_id: str,
    user_id: str = Depends(get_user_id)
):
    """Generate or fetch a full report for a conversation, ensuring user ownership."""
    supabase = get_supabase_admin()
    
    # Verify ownership
    check = supabase.table("conversations").select("id").eq("id", conversation_id).eq("user_id", user_id).execute()
    if not check.data:
        raise HTTPException(status_code=403, detail="Access denied")

    report_service = ReportService()
    try:
        report = report_service.generate_report(conversation_id)
        return {"success": True, "data": report}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
