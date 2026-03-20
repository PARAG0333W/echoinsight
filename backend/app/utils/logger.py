"""
EchoInsight AI — Structured Logger
Uses loguru for rich, structured logging.
"""

import sys
from loguru import logger as _logger
from app.config import get_settings

settings = get_settings()

# Remove default handler and reconfigure
_logger.remove()
_logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> — "
        "<level>{message}</level>"
    ),
    colorize=True,
)

# Also log to file with rotation
_logger.add(
    "logs/echoinsight.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} — {message}",
)

logger = _logger
