export type RoadType = 'SH' | 'NH' | 'MDR' | 'ODR' | 'RURAL';

export interface UserInfo {
  id: number;
  username: string;
  full_name: string;
  role_code: string;
  role_name: string;
  department_name?: string;
  zone_id?: number;
  circle_id?: number;
  division_id?: number;
  contractor_id?: number;
  is_active: boolean;
}

export interface ProjectItem {
  id: number;
  project_code: string;
  title: string;
  description?: string;
  road_type: RoadType;
  estimated_cost_cr: number;
  sanctioned_cost_cr: number;
  expenditure_to_date_cr: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  status: string;
  priority: string;
  zone_id: number;
  circle_id: number;
  division_id: number;
  contractor_id?: number;
  contractor_name?: string;
  road_name?: string;
  created_at: string;
}

export interface DepartmentDependencyItem {
  id: number;
  project_id: number;
  project_title?: string;
  requesting_dept_name: string;
  target_dept_name: string;
  dependency_type: string;
  description: string;
  impact_days: number;
  status: string;
  target_clearance_date?: string;
}

export interface IssueItem {
  id: number;
  issue_reference: string;
  category: string;
  description: string;
  project_id: number;
  project_title?: string;
  priority: string;
  status: string;
  escalation_status: string;
  assigned_to_name?: string;
  assigned_date: string;
  target_resolution_date?: string;
  resolution_notes?: string;
}

export interface WorkflowTaskItem {
  id: number;
  task_reference: string;
  project_id: number;
  project_title?: string;
  issue_id?: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  assigned_to_name?: string;
  created_by_name?: string;
  created_at: string;
}

export interface AuditEventItem {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  entity_reference?: string;
  changes_json?: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  delayed_projects: number;
  total_sanctioned_cr: number;
  total_expenditure_cr: number;
  pending_bottlenecks: number;
  critical_issues: number;
  active_tasks: number;
  road_network_counts: {
    SH: number;
    NH: number;
    MDR: number;
    ODR: number;
    RURAL: number;
  };
  is_demo: boolean;
}

export interface AskAIResult {
  answer: string;
  suggested_actions: string[];
  grounding_references: Array<{
    type: string;
    reference: string;
    detail: string;
  }>;
  is_demo: boolean;
  disclaimer: string;
}

