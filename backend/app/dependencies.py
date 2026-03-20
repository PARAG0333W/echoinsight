from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase
from app.utils.logger import logger

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Extract current user from Supabase JWT.
    Returns the user data including ID.
    """
    token = credentials.credentials
    supabase = get_supabase()
    
    try:
        # Supabase get_user verifies the token and returns user details
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return response.user
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_user_id(user = Depends(get_current_user)) -> str:
    """Return only the user UUID."""
    return user.id
