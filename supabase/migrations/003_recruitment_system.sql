-- Recruitment System Schema
-- Part of Autonomous HR System for candidate management

-- Jobs table: Stores job postings
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description_prompt TEXT NOT NULL, -- Original prompt (e.g., "Python developer, 5 years experience")
  generated_description TEXT, -- AI-generated job posting
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(100),
  requirements TEXT[], -- Array of key requirements
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidates table: Stores job applicants
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cv_text TEXT, -- Extracted text from PDF/DOCX
  cv_url VARCHAR(500), -- URL to original CV file in storage
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100), -- 0-100 score
  ai_summary TEXT, -- 3-sentence summary of fit
  ai_reasoning TEXT, -- Detailed analysis from Claude
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'screened', 'interviewing', 'rejected', 'hired', 'archived')),
  rejection_email_sent BOOLEAN DEFAULT FALSE,
  offer_email_sent BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interviews table: Stores scheduled interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_calendar_event_id VARCHAR(500), -- Google Calendar event ID
  scheduled_at TIMESTAMP,
  meeting_link VARCHAR(500), -- Google Meet link
  manager_feedback TEXT, -- Notes/feedback from manager after interview
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_ai_score ON candidates(ai_score DESC);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Jobs: Users can see their own jobs
CREATE POLICY "Users can read own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Candidates: Users can see candidates for their jobs
CREATE POLICY "Users can read candidates for own jobs" ON candidates
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can create candidates" ON candidates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update candidates for own jobs" ON candidates
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid()
    )
  );

-- Interviews: Users can see interviews for their jobs
CREATE POLICY "Users can read interviews for own jobs" ON interviews
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = interviews.job_id AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create interviews for own jobs" ON interviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = interviews.job_id AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interviews for own jobs" ON interviews
  FOR UPDATE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = interviews.job_id AND jobs.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_interviews_updated_at_column();

-- Storage bucket for CVs (Supabase Storage)
-- Note: This should be created via Supabase dashboard or this SQL:
-- CREATE ROLE bucket_holder WITH LOGIN ENCRYPTED PASSWORD 'temp_password';
-- Then use Supabase dashboard to create 'resumes' bucket
