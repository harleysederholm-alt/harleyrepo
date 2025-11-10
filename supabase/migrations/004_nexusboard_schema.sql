-- NexusBoard: Complete Supabase Schema with RLS
-- This is a production-ready, secure schema for real-time project management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url VARCHAR(500),
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ORGANIZATION MEMBERS (Many-to-Many)
-- ============================================================================
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, member_id)
);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COLUMNS TABLE (Kanban columns)
-- ============================================================================
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, "order")
);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG TABLE (for audit trail)
-- ============================================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL, -- 'task_created', 'task_moved', 'comment_added', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'task', 'comment', 'column'
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_member_id ON org_members(member_id);
CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_columns_project_id ON columns(project_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: PROFILES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read profiles of people in their organizations
CREATE POLICY "Users can read profiles in their orgs"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT member_id FROM org_members
      WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: ORGANIZATIONS
-- ============================================================================
-- Users can see organizations they're members of
CREATE POLICY "Users can read their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- Only owners can update/delete organizations
CREATE POLICY "Only owners can update organization"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Only owners can delete organization"
  ON organizations FOR DELETE
  USING (owner_id = auth.uid());

-- Users can create organizations
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: ORG MEMBERS
-- ============================================================================
-- Users can see members of their organizations
CREATE POLICY "Users can read org members"
  ON org_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- Only owners can invite/remove members
CREATE POLICY "Only owners can manage members"
  ON org_members FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Only owners can delete members"
  ON org_members FOR DELETE
  USING (
    org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: PROJECTS
-- ============================================================================
-- Users can see projects in their organizations
CREATE POLICY "Users can read projects in their orgs"
  ON projects FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- Users can create projects in their organizations
CREATE POLICY "Users can create projects in their orgs"
  ON projects FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- Users can update projects in their organizations
CREATE POLICY "Users can update projects in their orgs"
  ON projects FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- Users can delete projects they own or in their org (as admin)
CREATE POLICY "Users can delete projects in their orgs"
  ON projects FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE member_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: COLUMNS
-- ============================================================================
-- Users can see columns in projects they have access to
CREATE POLICY "Users can read columns"
  ON columns FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can create columns in accessible projects
CREATE POLICY "Users can create columns"
  ON columns FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can update columns
CREATE POLICY "Users can update columns"
  ON columns FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can delete columns
CREATE POLICY "Users can delete columns"
  ON columns FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: TASKS
-- ============================================================================
-- Users can see tasks in their projects
CREATE POLICY "Users can read tasks"
  ON tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can update tasks in their projects
CREATE POLICY "Users can update tasks"
  ON tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- Users can delete tasks in their projects
CREATE POLICY "Users can delete tasks"
  ON tasks FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- RLS POLICIES: COMMENTS
-- ============================================================================
-- Users can see comments on tasks in their projects
CREATE POLICY "Users can read comments"
  ON comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE org_id IN (
          SELECT org_id FROM org_members WHERE member_id = auth.uid()
        )
      )
    )
  );

-- Users can create comments on tasks in their projects
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE project_id IN (
        SELECT id FROM projects WHERE org_id IN (
          SELECT org_id FROM org_members WHERE member_id = auth.uid()
        )
      )
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: ACTIVITY LOGS
-- ============================================================================
-- Users can see activity in their projects
CREATE POLICY "Users can read activity logs"
  ON activity_logs FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE org_id IN (
        SELECT org_id FROM org_members WHERE member_id = auth.uid()
      )
    )
  );

-- System can insert activity logs (bypassed by service role)
CREATE POLICY "Service role can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update "updated_at" timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_project_id UUID,
  p_user_id UUID,
  p_action_type VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (project_id, user_id, action_type, entity_type, entity_id, details)
  VALUES (p_project_id, p_user_id, p_action_type, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS (For easier querying)
-- ============================================================================

-- Get all projects for a user with member count
CREATE OR REPLACE VIEW user_projects AS
SELECT
  p.id,
  p.name,
  p.description,
  p.org_id,
  p.created_by,
  p.created_at,
  o.name as org_name,
  (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
FROM projects p
JOIN organizations o ON p.org_id = o.id;

-- Get all tasks for a project with assignee info
CREATE OR REPLACE VIEW project_tasks_detailed AS
SELECT
  t.id,
  t.title,
  t.description,
  t.column_id,
  t.project_id,
  t."order",
  t.created_by,
  t.created_at,
  t.updated_at,
  COALESCE(a.username, 'Unassigned') as assignee_name,
  a.id as assignee_id,
  a.avatar_url,
  (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count,
  c.name as column_name
FROM tasks t
LEFT JOIN profiles a ON t.assignee_id = a.id
LEFT JOIN columns c ON t.column_id = c.id;
