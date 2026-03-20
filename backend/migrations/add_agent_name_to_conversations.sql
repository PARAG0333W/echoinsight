-- Migration: Add agent_name to conversations table
-- Date: 2026-03-19
-- Status: Pending (Manual Execution Required)

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS agent_name TEXT;
