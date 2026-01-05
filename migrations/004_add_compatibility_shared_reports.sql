-- Add shared reports support for compatibility analyses
-- This allows compatibility reports to be shared via public links

CREATE TABLE IF NOT EXISTS shared_compatibility_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compatibility_id UUID NOT NULL REFERENCES compatibility_analyses(id) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_shared_compatibility_reports_compatibility FOREIGN KEY (compatibility_id) REFERENCES compatibility_analyses(id) ON DELETE CASCADE
);

CREATE INDEX idx_shared_compatibility_reports_token ON shared_compatibility_reports(share_token);
CREATE INDEX idx_shared_compatibility_reports_compatibility ON shared_compatibility_reports(compatibility_id);
CREATE INDEX idx_shared_compatibility_reports_expires ON shared_compatibility_reports(expires_at);
CREATE INDEX idx_shared_compatibility_reports_user ON shared_compatibility_reports(created_by_user_id);

COMMENT ON TABLE shared_compatibility_reports IS 'Shareable compatibility report links with expiry';
COMMENT ON COLUMN shared_compatibility_reports.share_token IS 'Unique token for public access';
COMMENT ON COLUMN shared_compatibility_reports.expires_at IS 'When the share link expires';
COMMENT ON COLUMN shared_compatibility_reports.view_count IS 'Number of times the report was viewed';
