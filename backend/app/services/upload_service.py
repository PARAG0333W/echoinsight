"""
EchoInsight AI — Upload Service
Handles file validation and Supabase Storage upload.
"""

import os
import uuid
from fastapi import UploadFile, HTTPException
from app.database import get_supabase_admin
from app.config import get_settings
from app.utils.logger import logger
from app.utils.helpers import (
    classify_file_type,
    get_file_extension,
    generate_uuid,
    get_utc_now,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
)

settings = get_settings()


class UploadService:
    """Validates and uploads files to Supabase Storage, creates DB records."""

    def __init__(self):
        self.supabase = get_supabase_admin()
        self.bucket = settings.STORAGE_BUCKET

    def validate_file(self, file: UploadFile) -> None:
        """Validate file extension and size."""
        ext = get_file_extension(file.filename or "")
        all_allowed = set().union(*ALLOWED_EXTENSIONS.values())

        if ext not in all_allowed:
            raise HTTPException(
                status_code=400,
                detail=f"File type '.{ext}' not supported. Allowed: {sorted(all_allowed)}",
            )

        if file.size and file.size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {MAX_FILE_SIZE_BYTES // (1024*1024)} MB",
            )

    async def upload_file(self, file: UploadFile, user_id: str, agent_id: str | None = None, agent_name: str | None = None) -> dict:
        """
        Upload file to Supabase Storage and create conversation record.
        Returns the new conversation record.
        """
        self.validate_file(file)

        file_ext = get_file_extension(file.filename or "")
        file_type = classify_file_type(file.filename or "")
        conversation_id = generate_uuid()
        storage_path = f"{user_id}/{conversation_id}.{file_ext}"

        # Read file content
        content = await file.read()

        # Upload to Supabase Storage
        try:
            self.supabase.storage.from_(self.bucket).upload(
                path=storage_path,
                file=content,
                file_options={"content-type": file.content_type or "application/octet-stream"},
            )
            logger.info(f"File uploaded to storage: {storage_path}")
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to upload file to storage: {e}")

        # Create conversation record in DB
        conversation_data = {
            "id": conversation_id,
            "user_id": None if not user_id else user_id,
            "agent_id": None if not agent_id else agent_id,
            "file_name": file.filename,
            "file_type": file_type,
            "file_size_bytes": len(content),
            "mime_type": file.content_type,
            "storage_path": storage_path,
            "status": "uploaded",
            "created_at": get_utc_now(),
            "updated_at": get_utc_now(),
        }
        if agent_name:
            conversation_data["agent_name"] = agent_name

        try:
            result = (
                self.supabase.table("conversations")
                .insert(conversation_data)
                .execute()
            )
            logger.info(f"Conversation record created: {conversation_id}")
            return result.data[0] if result.data else conversation_data
        except Exception as e:
            error_msg = str(e)
            logger.error(f"DB insert failed: {error_msg}")
            
            # Specific hint for missing columns (PostgREST error PGRST204)
            if "PGRST204" in error_msg:
                logger.error("HINT: This error usually means a column is missing in the Supabase table. "
                             "Ensure the 'conversations' table has an 'agent_name' column.")
            
            # Cleanup storage on DB failure
            try:
                self.supabase.storage.from_(self.bucket).remove([storage_path])
                logger.info(f"Cleaned up storage after DB failure: {storage_path}")
            except Exception as cleanup_err:
                logger.error(f"Failed to cleanup storage: {cleanup_err}")
                
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create conversation record: {error_msg}"
            )

    def download_file(self, storage_path: str) -> bytes:
        """Download a file from Supabase Storage."""
        try:
            response = self.supabase.storage.from_(self.bucket).download(storage_path)
            return response
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to download file: {e}")

    def update_conversation_status(self, conversation_id: str, status: str, error_message: str | None = None) -> None:
        """Update the status of a conversation."""
        update_data = {"status": status, "updated_at": get_utc_now()}
        if error_message:
            update_data["error_message"] = error_message
        try:
            self.supabase.table("conversations").update(update_data).eq("id", conversation_id).execute()
            logger.info(f"Conversation {conversation_id} status → {status}")
        except Exception as e:
            logger.error(f"Status update failed: {e}")
