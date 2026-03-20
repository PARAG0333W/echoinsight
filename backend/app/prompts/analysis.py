"""
EchoInsight AI — LLM Prompt Templates
All prompt templates for Gemini-based analysis.
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COMPREHENSIVE ANALYSIS PROMPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYSIS_PROMPT = """Analyze this conversation between a Customer and an Agent. 
Evaluate only the Agent's performance and provide a comprehensive analysis.

You MUST return a valid JSON object with the following structure:
{{
  "communication_score": number (0-100),
  "tone_score": number (0-100),
  "empathy_score": number (0-100),
  "professionalism_score": number (0-100),
  "solution_score": number (0-100),
  "sentiment": "positive|neutral|negative",
  "mistakes": [
    {{
      "turn_index": number,
      "mistake": "string description",
      "severity": "low|medium|high"
    }}
  ],
  "improved_responses": [
    {{
      "turn_index": number,
      "original": "string",
      "improved": "string"
    }}
  ],
  "suggested_phrases": ["string", "string", "string"],
  "risk_level": "low|medium|high"
}}

Scoring Guidelines:
- communication_score: Clarity and effectiveness of language.
- tone_score: Politeness, friendliness, and tone consistency.
- empathy_score: Acknowledgement and understanding of customer emotions.
- professionalism_score: Adherence to formal standards and respectfulness.
- solution_score: Accuracy of information and problem resolution effectiveness.

CONVERSATION:
{conversation}
"""
