ALTER TABLE professions
ADD COLUMN IF NOT EXISTS panel_channel_id TEXT,
ADD COLUMN IF NOT EXISTS panel_message_id TEXT;
