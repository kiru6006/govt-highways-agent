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

// In-Memory Fallback Store for Static Deployments (GitHub Pages)
const fallbackUsers: Record<string, UserInfo> = {
  admin: {
    id: 1,
    username: 'admin',
    full_name: 'Thiru R. Senthil Kumar IAS [DEMO]',
    role_code: 'ADMIN',
    role_name: 'System Administrator',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  chief_eng: {
    id: 2,
    username: 'chief_eng',
    full_name: 'Er. K. Balasubramanian, M.E. [DEMO]',
    role_code: 'CHIEF_ENG',
    role_name: 'Chief Engineer (Highways - Projects)',
    department_name: 'Tamil Nadu Highways Department',
    is_active: true
  },
  se_chengalpattu: {
    id: 3,
    username: 'se_chengalpattu',
    full_name: 'Er. M. Rajasekaran, M.E. [DEMO]',
    role_code: 'SE_CIRCLE',
    role_name: 'Superintending Engineer',
    department_name: 'Tamil Nadu Highways Department',
    zone_id: 1,
    circle_id: 1,
    is_active: true
  },
  ee_tambaram: {
    id: 4,
    username: 'ee_tambaram',
    full_name: 'Er. P. Anandhan, B.E. [DEMO]',
    role_code: 'EE_DIV',
    role_name: 'Divisional Engineer',
    department_name: 'Tamil Nadu Highways Department',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    is_active: true
  },
  contractor_lt: {
    id: 5,
    username: 'contractor_lt',
    full_name: 'V. Ramakrishnan (Project Director, L&T) [DEMO]',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 1,
    is_active: true
  },
  contractor_pst: {
    id: 6,
    username: 'contractor_pst',
    full_name: 'T. Shanmugam (Managing Director, PST) [DEMO]',
    role_code: 'CONTRACTOR',
    role_name: 'Empanelled Contractor Representative',
    contractor_id: 2,
    is_active: true
  }
};

let activeUser: UserInfo = fallbackUsers.admin;

let fallbackProjects: ProjectItem[] = [
  {
    id: 1,
    project_code: 'PRJ-TN-2026-001',
    title: 'Widening to 4 Lanes with Paved Shoulders of SH-49 (ECR) km 22/0 to 45/0 [DEMO DATA]',
    description: 'Major infrastructure upgradation under Chief Minister Road Development Programme (CMRDP) to reduce fatal accidents and improve scenic coastal corridor capacity.',
    road_type: 'SH',
    estimated_cost_cr: 145.50,
    sanctioned_cost_cr: 142.20,
    expenditure_to_date_cr: 64.80,
    physical_progress_pct: 52.5,
    financial_progress_pct: 45.6,
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 1,
    contractor_name: 'L&T Infrastructure Engineering Ltd',
    road_name: 'East Coast Road (SH-49)',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    project_code: 'PRJ-TN-2026-002',
    title: 'Construction of 4-Lane Grade Separator / Elevated Corridor at Tambaram on MDR-102 [DEMO DATA]',
    description: 'Elevated flyover junction decongestion project connecting GST corridor with Sriperumbudur industrial belt.',
    road_type: 'MDR',
    estimated_cost_cr: 88.40,
    sanctioned_cost_cr: 85.00,
    expenditure_to_date_cr: 22.10,
    physical_progress_pct: 28.0,
    financial_progress_pct: 26.0,
    status: 'DELAYED',
    priority: 'HIGH',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 2,
    contractor_name: 'PST Engineering Constructions',
    road_name: 'Tambaram - Mudichur Road (MDR-102)',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    project_code: 'PRJ-TN-2026-003',
    title: 'Reconstruction of Distressed High-Level Bridge on ODR-045 Thiruporur Hub [DEMO DATA]',
    description: 'Comprehensive bridge reconstruction replacing damaged multi-vent causeway with pre-stressed girder superstructure.',
    road_type: 'ODR',
    estimated_cost_cr: 18.60,
    sanctioned_cost_cr: 18.10,
    expenditure_to_date_cr: 16.50,
    physical_progress_pct: 89.0,
    financial_progress_pct: 91.2,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    zone_id: 1,
    circle_id: 1,
    division_id: 1,
    contractor_id: 2,
    contractor_name: 'PST Engineering Constructions',
    road_name: 'Guduvanchery - Thiruporur Link (ODR-045)',
    created_at: new Date().toISOString()
  }
];

let fallbackDependencies: DepartmentDependencyItem[] = [
  {
    id: 1,
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    requesting_dept_name: 'Tamil Nadu Highways Department',
    target_dept_name: 'Revenue & Disaster Management (Tahsildar Tambaram)',
    dependency_type: 'Land Acquisition (4.2 Hectares)',
    description: 'Award enquiry under TN Highways Act 2001 Section 15(2) pending hearing.',
    impact_days: 65,
    status: 'ESCALATED',
    target_clearance_date: '2026-12-15'
  },
  {
    id: 2,
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    requesting_dept_name: 'Tamil Nadu Highways Department',
    target_dept_name: 'TANGEDCO (Electricity Board Kanchipuram)',
    dependency_type: 'Utility Shifting (42 HT Electric Poles)',
    description: 'Working estimate prepared; statutory deposit of Rs 1.82 Cr remitted.',
    impact_days: 40,
    status: 'IN_PROGRESS',
    target_clearance_date: '2026-11-30'
  },
  {
    id: 3,
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    requesting_dept_name: 'Tamil Nadu Highways Department',
    target_dept_name: 'Southern Railway (Zone 7)',
    dependency_type: 'Railway General Arrangement Drawing (GAD) Clearance',
    description: 'GAD clearance for Pier P-4 and P-5 within railway boundary corridor pending CBE approval.',
    impact_days: 90,
    status: 'PENDING',
    target_clearance_date: '2027-01-31'
  }
];

let fallbackTasks: WorkflowTaskItem[] = [
  {
    id: 1,
    task_reference: 'TSK-2026-0001',
    project_id: 1,
    project_title: 'Widening to 4 Lanes of SH-49 (ECR)',
    title: 'Conduct Joint Ground Verification with TANGEDCO Executive Engineer [DEMO DATA]',
    description: 'Inspect Akkarai junction utility trenching to finalize alignment avoiding 33kV corridor.',
    priority: 'HIGH',
    status: 'Assigned',
    assigned_to_name: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    task_reference: 'TSK-2026-0002',
    project_id: 2,
    project_title: 'Tambaram Elevated Corridor on MDR-102',
    title: 'Inspect Staging Rigidity & Safety Netting at Pier P-4 [DEMO DATA]',
    description: 'Verify scaffolding certified by Structural Chartered Engineer before load test.',
    priority: 'CRITICAL',
    status: 'In Progress',
    assigned_to_name: 'Er. P. Anandhan, B.E. (Divisional Engineer)',
    created_at: new Date().toISOString()
  }
];

let fallbackAuditEvents: AuditEventItem[] = [
  {
    id: 1,
    actor_name: 'Thiru R. Senthil Kumar IAS',
    actor_role: 'System Administrator',
    action: 'PLATFORM_INITIALIZATION',
    entity_type: 'SYSTEM',
    entity_reference: 'SYS-TNHDOS-001',
    changes_json: '{"status": "INITIALIZED", "version": "1.0.0-phase1"}',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    actor_name: 'Er. K. Balasubramanian, M.E.',
    actor_role: 'Chief Engineer (Projects)',
    action: 'SANCTION_APPROVE',
    entity_type: 'PROJECT',
    entity_reference: 'PRJ-TN-2026-001',
    changes_json: '{"sanctioned_cost_cr": 142.20, "programme": "CMRDP"}',
    created_at: new Date().toISOString()
  }
];

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
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // static fallback on GitHub Pages
    }

    // Fallback authentication
    const user = fallbackUsers[username] || fallbackUsers.admin;
    activeUser = user;
    return {
      access_token: `mock_token_${user.username}`,
      token_type: 'bearer',
      user_info: user
    };
  },

  getCurrentUser: async () => {
    try {
      return await request<UserInfo>('/auth/me');
    } catch {
      return activeUser;
    }
  },

  // Stats
  getDashboardStats: async () => {
    try {
      return await request<DashboardStats>('/stats');
    } catch {
      return {
        total_projects: fallbackProjects.length,
        active_projects: fallbackProjects.filter(p => p.status !== 'COMPLETED').length,
        delayed_projects: fallbackProjects.filter(p => p.status === 'DELAYED').length,
        total_sanctioned_cr: 245.30,
        total_expenditure_cr: 103.40,
        pending_bottlenecks: fallbackDependencies.length,
        critical_issues: 2,
        active_tasks: fallbackTasks.filter(t => t.status !== 'Completed').length,
        road_network_counts: {
          SH: 1,
          NH: 1,
          MDR: 1,
          ODR: 1,
          RURAL: 1
        },
        is_demo: true
      };
    }
  },

  // Projects (respecting RBAC Contractor Isolation)
  getProjects: async (roadType?: RoadType) => {
    try {
      const query = roadType ? `?road_type=${roadType}` : '';
      return await request<ProjectItem[]>(`/projects${query}`);
    } catch {
      let filtered = [...fallbackProjects];

      // Contractor isolation in fallback demo mode
      if (activeUser.role_code === 'CONTRACTOR') {
        filtered = filtered.filter(p => p.contractor_id === activeUser.contractor_id);
      }

      if (roadType) {
        filtered = filtered.filter(p => p.road_type === roadType);
      }

      return filtered;
    }
  },

  getProjectById: async (id: number) => {
    try {
      return await request<ProjectItem>(`/projects/${id}`);
    } catch {
      const p = fallbackProjects.find(item => item.id === id);
      if (!p) throw new Error('Project not found');
      return p;
    }
  },

  // Dependencies
  getDependencies: async () => {
    try {
      return await request<DepartmentDependencyItem[]>('/dependencies');
    } catch {
      return fallbackDependencies;
    }
  },

  // Issues
  getIssues: async () => {
    try {
      return await request<IssueItem[]>('/issues');
    } catch {
      return [];
    }
  },

  updateIssueStatus: async (id: number, status: string, notes?: string) => {
    try {
      return await request<IssueItem>(`/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolution_notes: notes }),
      });
    } catch {
      return {} as IssueItem;
    }
  },

  // Workflows
  getWorkflowTasks: async (myTasksOnly = false) => {
    try {
      return await request<WorkflowTaskItem[]>(`/workflows?my_tasks_only=${myTasksOnly}`);
    } catch {
      return fallbackTasks;
    }
  },

  completeTask: async (id: number) => {
    try {
      return await request<WorkflowTaskItem>(`/workflows/${id}/complete`, {
        method: 'PATCH',
      });
    } catch {
      fallbackTasks = fallbackTasks.map(t =>
        t.id === id ? { ...t, status: 'Completed' } : t
      );
      const target = fallbackTasks.find(t => t.id === id);
      if (target) {
        fallbackAuditEvents.unshift({
          id: Date.now(),
          actor_name: activeUser.full_name,
          actor_role: activeUser.role_name,
          action: 'COMPLETE',
          entity_type: 'WORKFLOW_TASK',
          entity_reference: target.task_reference,
          created_at: new Date().toISOString()
        });
      }
      return target || ({} as WorkflowTaskItem);
    }
  },

  // Audit
  getAuditEvents: async (limit = 30) => {
    try {
      return await request<AuditEventItem[]>(`/audit?limit=${limit}`);
    } catch {
      return fallbackAuditEvents.slice(0, limit);
    }
  },

  // Ask AI
  askAI: async (query: string, screenContext: string) => {
    try {
      return await request<AskAIResult>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query, screen_context: screenContext }),
      });
    } catch {
      const q = query.toLowerCase();
      let answer = `[DEMO AI ASSISTANT]: Contextual analysis for ${screenContext}. Query received: "${query}". Real-time data synthesis indicates normal road maintenance operations.`;
      let actions = ['List High-Risk Interdepartmental Issues', 'Show Pending Approvals in Circle', 'Check Contractor Rating'];
      let groundings = [
        {
          type: 'Project Record',
          reference: 'PRJ-TN-2026-001',
          detail: 'SH-49 East Coast Road (Sanctioned: ₹142.20 Cr, Physical: 52.5%)'
        }
      ];

      if (q.includes('delay') || q.includes('bottleneck') || q.includes('tangedco') || q.includes('sh-49')) {
        answer = `[DEMO AI ANALYSIS for ${screenContext}]: Identified active statutory bottleneck on SH-49 (ECR). 42 HT Electric Poles shifting is pending with TANGEDCO Kanchipuram (+40 days schedule impact). Recommended escalation: Convene Joint District Review Meeting.`;
        actions = ['Convene Joint Revenue-TANGEDCO Taskforce', 'Generate G.O. Escalation Draft', 'Review Milestone Critical Path'];
        groundings = [
          {
            type: 'Department Dependency',
            reference: 'DEP-2',
            detail: 'Utility Shifting (42 HT Poles) with TANGEDCO (Impact: +40 days)'
          },
          {
            type: 'Land Acquisition',
            reference: 'DEP-1',
            detail: 'Section 15(2) award enquiry pending Tahsildar Tambaram (+65 days)'
          }
        ];
      }

      return {
        answer,
        suggested_actions: actions,
        grounding_references: groundings,
        is_demo: true,
        disclaimer: 'DEMO DATA ONLY: This AI response is generated for architectural demonstration purposes. Official decisions require formal statutory Government Orders (G.O.).'
      };
    }
  },
};
