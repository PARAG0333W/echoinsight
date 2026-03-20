"""
EchoInsight AI — Upload Router
Handles file upload and triggers the processing pipeline.
"""

import threading
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
from app.services.upload_service import UploadService
from app.services.pipeline import PipelineOrchestrator
from app.utils.logger import logger
from app.dependencies import get_user_id

router = APIRouter()


@router.post("/conversations/upload")
async def upload_conversation(
    file: UploadFile = File(..., description="Audio or document file"),
    agent_id: str = Form("", description="Agent UUID (optional)"),
    agent_name: str = Form("", description="Agent name (optional)"),
    user_id: str = Depends(get_user_id),
):
    """
    Upload an audio or document file for analysis.

    Supported formats:
    - Audio: .wav, .mp3, .flac, .m4a, .ogg, .webm
    - Document: .txt, .pdf, .docx, .csv
    """
    upload_service = UploadService()

    # Convert empty string to None if Swagger sends "" for optional UUID
    if agent_id == "":
        agent_id = None

    # Normalize agent_name
    agent_name_val = agent_name.strip() if agent_name and agent_name.strip() else None

    # Upload file and create DB record
    conversation = await upload_service.upload_file(file, user_id, agent_id, agent_name=agent_name_val)
    conversation_id = conversation["id"]

    # Start processing pipeline in background thread
    def run_pipeline():
        try:
            orchestrator = PipelineOrchestrator()
            orchestrator.process(conversation_id)
        except Exception as e:
            logger.error(f"Background pipeline error: {e}")

    thread = threading.Thread(target=run_pipeline, daemon=True)
    thread.start()

    return {
        "success": True,
        "data": {
            "conversation_id": conversation_id,
            "file_name": conversation.get("file_name"),
            "file_type": conversation.get("file_type"),
            "status": "uploaded",
            "message": "File uploaded successfully. Processing has started in the background.",
        },
    }


@router.post("/conversations/upload-and-wait")
async def upload_and_wait(
    file: UploadFile = File(..., description="Audio or document file"),
    agent_id: str = Form("", description="Optional Agent UUID"),
    user_id: str = Form("00000000-0000-0000-0000-000000000000"),
):
    """
    Upload a file and wait for the full analysis to complete.
    Returns the analysis result directly (synchronous).
    """
    upload_service = UploadService()

    # Convert empty string to None if Swagger sends "" for optional UUID
    if agent_id == "":
        agent_id = None

    conversation = await upload_service.upload_file(file, user_id, agent_id)
    conversation_id = conversation["id"]

    # Run pipeline synchronously
    try:
        orchestrator = PipelineOrchestrator()
        result = orchestrator.process(conversation_id)
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        logger.error(f"Sync pipeline error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
