import {
  UserInfo,
  ProjectItem,
  DepartmentDependencyItem,
  IssueItem,
  WorkflowTaskItem,
  AuditEventItem,
  DashboardStats,
  AskAIResult,
  RoadType
} from '../types';

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('tn_hdos_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('tn_hdos_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('tn_hdos_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      throw new Error('Authentication Failed: Invalid credentials');
    }
    return res.json();
  },

  getCurrentUser: () => request<UserInfo>('/auth/me'),

  // Stats
  getDashboardStats: () => request<DashboardStats>('/stats'),

  // Projects
  getProjects: (roadType?: RoadType) => {
    const query = roadType ? `?road_type=${roadType}` : '';
    return request<ProjectItem[]>(`/projects${query}`);
  },

  getProjectById: (id: number) => request<ProjectItem>(`/projects/${id}`),

  // Dependencies
  getDependencies: () => request<DepartmentDependencyItem[]>('/dependencies'),

  // Issues
  getIssues: () => request<IssueItem[]>('/issues'),

  updateIssueStatus: (id: number, status: string, notes?: string) =>
    request<IssueItem>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_notes: notes }),
    }),

  // Workflows
  getWorkflowTasks: (myTasksOnly = false) =>
    request<WorkflowTaskItem[]>(`/workflows?my_tasks_only=${myTasksOnly}`),

  completeTask: (id: number) =>
    request<WorkflowTaskItem>(`/workflows/${id}/complete`, {
      method: 'PATCH',
    }),

  // Audit
  getAuditEvents: (limit = 30) => request<AuditEventItem[]>(`/audit?limit=${limit}`),

  // Ask AI
  askAI: (query: string, screenContext: string) =>
    request<AskAIResult>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query, screen_context: screenContext }),
    }),
};

