-- Create shared_reports table for shareable links
CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_by_user_id VARCHAR(255) NOT NULL,
  CONSTRAINT fk_shared_reports_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

CREATE INDEX idx_shared_reports_token ON shared_reports(share_token);
CREATE INDEX idx_shared_reports_person ON shared_reports(person_id);
CREATE INDEX idx_shared_reports_expires ON shared_reports(expires_at);

COMMENT ON TABLE shared_reports IS 'Shareable report links with expiry';
COMMENT ON COLUMN shared_reports.share_token IS 'Unique token for public access';
COMMENT ON COLUMN shared_reports.expires_at IS 'When the share link expires';
COMMENT ON COLUMN shared_reports.view_count IS 'Number of times the report was viewed';
