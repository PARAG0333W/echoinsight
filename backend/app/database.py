"""
EchoInsight AI — Supabase Database Client
Provides a singleton Supabase client for the entire application.
"""

from supabase import create_client, Client
from app.config import get_settings
from app.utils.logger import logger

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Return a singleton Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY,
        )
        logger.info("Supabase client initialized")
    return _supabase_client


def get_supabase_admin() -> Client:
    """
    Return a Supabase client using the service-role key.
    Use this for server-side operations that bypass RLS.
    """
    settings = get_settings()
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon client")
        return get_supabase()
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )
