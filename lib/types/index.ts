// User & Auth types
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  member_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Kanban types
export interface Column {
  id: string;
  project_id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  project_id: string;
  assignee_id?: string;
  order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  creator?: Profile;
}

// Comment types
export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

// Activity types
export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
}
