"""
EchoInsight AI — Pydantic Schemas
Request/Response models for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ENUMS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"


class FileType(str, Enum):
    AUDIO = "audio"
    DOCUMENT = "document"


class ConversationStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    TEXT_EXTRACTED = "text_extracted"
    PARSED = "parsed"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    FAILED = "failed"


class SpeakerRole(str, Enum):
    AGENT = "agent"
    CUSTOMER = "customer"
    SYSTEM = "system"


class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ScoreCategory(str, Enum):
    GREETING = "greeting"
    EMPATHY = "empathy"
    RESOLUTION = "resolution"
    COMPLIANCE = "compliance"
    PROFESSIONALISM = "professionalism"
    CLARITY = "clarity"


class MistakeCategory(str, Enum):
    TONE = "tone"
    PROTOCOL = "protocol"
    ACCURACY = "accuracy"
    COMPLIANCE = "compliance"
    ESCALATION = "escalation"


class RiskType(str, Enum):
    LEGAL = "legal"
    COMPLIANCE = "compliance"
    CHURN = "churn"
    ESCALATION = "escalation"
    DATA_PRIVACY = "data_privacy"


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  RESPONSE WRAPPER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class APIResponse(BaseModel):
    success: bool = True
    data: Optional[dict | list] = None
    message: Optional[str] = None
    error: Optional[dict] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONVERSATION SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ConversationOut(BaseModel):
    id: str
    title: Optional[str] = None
    file_name: str
    file_type: FileType
    status: ConversationStatus
    duration_seconds: Optional[int] = None
    language: Optional[str] = "en"
    call_date: Optional[str] = None
    created_at: str
    agent_name: Optional[str] = None


class ConversationDetail(ConversationOut):
    storage_path: Optional[str] = None
    overall_score: Optional[float] = None
    overall_sentiment: Optional[str] = None
    summary: Optional[str] = None
    mistake_count: Optional[int] = 0
    risk_count: Optional[int] = 0


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MESSAGE SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MessageOut(BaseModel):
    id: str
    turn_index: int
    speaker: SpeakerRole
    speaker_name: Optional[str] = None
    content: str
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    sentiment: Optional[SentimentType] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ANALYSIS SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SimpleMistakeOut(BaseModel):
    mistake: str
    turn_index: Optional[int] = None

class ImprovedResponseOut(BaseModel):
    original: str
    improved: str

class AIAnalysisResponseOut(BaseModel):
    id: str
    conversation_id: str
    communication_score: float
    tone_score: float
    empathy_score: float
    professionalism_score: float
    solution_score: float
    mistakes: list[SimpleMistakeOut] = []
    improved_responses: list[ImprovedResponseOut] = []
    suggested_phrases: list[str] = []
    risk_level: str
    processing_time_ms: Optional[int] = None
    analyzed_at: Optional[str] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ANALYTICS SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class OverviewStats(BaseModel):
    total_conversations: int = 0
    analyzed_count: int = 0
    average_score: Optional[float] = None
    high_risk_count: int = 0
    total_mistakes: int = 0


class AgentPerformance(BaseModel):
    agent_id: str
    agent_name: str
    department: Optional[str] = None
    total_conversations: int = 0
    avg_score: Optional[float] = None
    total_mistakes: int = 0
    total_risks: int = 0


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  UPLOAD SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class UploadResponse(BaseModel):
    conversation_id: str
    file_name: str
    file_type: FileType
    status: ConversationStatus
    message: str = "File uploaded successfully. Processing will begin shortly."


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  REPORT SCHEMAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ReportOut(BaseModel):
    conversation_id: str
    agent_name: Optional[str] = None
    file_name: str
    call_date: Optional[str] = None
    overall_score: float
    overall_sentiment: str
    summary: str
    scores: list[ScoreOut] = []
    mistakes: list[dict] = []
    risks: list[dict] = []
    generated_at: str
