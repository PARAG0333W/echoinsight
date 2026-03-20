"""
EchoInsight AI — Utility Helpers
"""

import os
import uuid
import tempfile
from datetime import datetime, timezone


def generate_uuid() -> str:
    """Generate a random UUID string."""
    return str(uuid.uuid4())


def get_utc_now() -> str:
    """Return current UTC timestamp as ISO string."""
    return datetime.now(timezone.utc).isoformat()


def get_file_extension(filename: str) -> str:
    """Extract file extension (lowercase, without dot)."""
    return os.path.splitext(filename)[1].lower().lstrip(".")


def classify_file_type(filename: str) -> str:
    """Classify a file as 'audio' or 'document' by extension."""
    ext = get_file_extension(filename)
    audio_exts = {"wav", "mp3", "flac", "m4a", "ogg", "webm", "mp4"}
    if ext in audio_exts:
        return "audio"
    return "document"


def get_temp_filepath(suffix: str = "") -> str:
    """Return a path in the system temp directory."""
    return os.path.join(tempfile.gettempdir(), f"echoinsight_{uuid.uuid4().hex}{suffix}")


ALLOWED_EXTENSIONS = {
    "audio": {"wav", "mp3", "flac", "m4a", "ogg", "webm"},
    "document": {"txt", "pdf", "docx", "csv"},
}

MAX_FILE_SIZE_MB = 100
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
