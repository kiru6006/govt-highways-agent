from typing import Optional, List, Any
import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_info: dict

class TokenData(BaseModel):
    username: Optional[str] = None
    role_code: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# User & Role Schemas
class PermissionOut(BaseModel):
    id: int
    code: str
    name: str
    module: str
    action: str

    class Config:
        from_attributes = True

class RoleOut(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    tier: str
    permissions: List[PermissionOut] = []

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    role_code: str
    role_name: str
    department_name: Optional[str] = None
    zone_id: Optional[int] = None
    circle_id: Optional[int] = None
    division_id: Optional[int] = None
    contractor_id: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True

# Jurisdiction & Departments
class DepartmentOut(BaseModel):
    id: int
    code: str
    name: str
    contact_email: Optional[str] = None
    is_external: bool

    class Config:
        from_attributes = True

class OrganisationOut(BaseModel):
    id: int
    name: str
    org_type: str
    registration_no: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class ZoneOut(BaseModel):
    id: int
    code: str
    name: str
    headquarters: Optional[str] = None

    class Config:
        from_attributes = True

class CircleOut(BaseModel):
    id: int
    zone_id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class DivisionOut(BaseModel):
    id: int
    circle_id: int
    code: str
    name: str

    class Config:
        from_attributes = True

# Roads & Assets
class RoadOut(BaseModel):
    id: int
    code: str
    name: str
    road_type: str
    start_chainage: float
    end_chainage: float
    total_length_km: float

    class Config:
        from_attributes = True

class BridgeOut(BaseModel):
    id: int
    bridge_code: str
    bridge_name: str
    bridge_type: str
    chainage_km: float
    span_meters: float
    river_or_rail_crossing: Optional[str] = None
    condition_score: float

    class Config:
        from_attributes = True

# Projects
class ProjectCreate(BaseModel):
    project_code: str
    title: str
    description: Optional[str] = None
    road_id: Optional[int] = None
    road_type: str = "SH"
    estimated_cost_cr: float
    sanctioned_cost_cr: float
    zone_id: int
    circle_id: int
    division_id: int
    executing_department_id: int
    contractor_id: Optional[int] = None
    priority: str = "HIGH"

class ProjectOut(BaseModel):
    id: int
    project_code: str
    title: str
    description: Optional[str] = None
    road_type: str
    estimated_cost_cr: float
    sanctioned_cost_cr: float
    expenditure_to_date_cr: float
    physical_progress_pct: float
    financial_progress_pct: float
    status: str
    priority: str
    zone_id: int
    circle_id: int
    division_id: int
    contractor_id: Optional[int] = None
    contractor_name: Optional[str] = None
    road_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Contractors & Officials
class ContractorOut(BaseModel):
    id: int
    registration_number: str
    company_name: str
    class_category: str
    pan: Optional[str] = None
    gst: Optional[str] = None
    is_blacklisted: bool

    class Config:
        from_attributes = True

class OfficialOut(BaseModel):
    id: int
    user_id: int
    employee_code: str
    full_name: str
    designation: str
    cadre: Optional[str] = None
    current_posting: str
    active_from: datetime.datetime

    class Config:
        from_attributes = True

# Dependencies
class DependencyOut(BaseModel):
    id: int
    project_id: int
    project_title: Optional[str] = None
    requesting_dept_name: str
    target_dept_name: str
    dependency_type: str
    description: str
    impact_days: int
    status: str
    target_clearance_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class DependencyCreate(BaseModel):
    project_id: int
    requesting_dept_id: int
    target_dept_id: int
    dependency_type: str
    description: str
    impact_days: int = 0
    target_clearance_date: Optional[datetime.datetime] = None

# Issues & Workflows
class IssueCreate(BaseModel):
    project_id: int
    category: str
    description: str
    priority: str = "MEDIUM"
    department_id: Optional[int] = None
    assigned_to_user_id: Optional[int] = None
    target_resolution_date: Optional[datetime.datetime] = None

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    closure_evidence: Optional[str] = None
    escalation_status: Optional[str] = None

class IssueOut(BaseModel):
    id: int
    issue_reference: str
    category: str
    description: str
    project_id: int
    project_title: Optional[str] = None
    priority: str
    status: str
    escalation_status: str
    assigned_to_name: Optional[str] = None
    assigned_date: datetime.datetime
    target_resolution_date: Optional[datetime.datetime] = None
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True

class WorkflowTaskCreate(BaseModel):
    project_id: int
    issue_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    assigned_to_user_id: int
    priority: str = "MEDIUM"
    due_date: Optional[datetime.datetime] = None

class WorkflowTaskOut(BaseModel):
    id: int
    task_reference: str
    project_id: int
    project_title: Optional[str] = None
    issue_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime.datetime] = None
    assigned_to_name: Optional[str] = None
    created_by_name: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Documents & Evidence
class DocumentOut(BaseModel):
    id: int
    document_title: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    uploader_name: Optional[str] = None
    project_id: Optional[int] = None
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Audit
class AuditEventOut(BaseModel):
    id: int
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    entity_reference: Optional[str] = None
    changes_json: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Ask AI
class AskAIRequest(BaseModel):
    query: str
    screen_context: Optional[str] = "Dashboard"
    selected_record_type: Optional[str] = None
    selected_record_id: Optional[int] = None
    conversation_history: Optional[List[dict]] = []

class AskAIResponse(BaseModel):
    answer: str
    suggested_actions: List[str]
    grounding_references: List[dict]
    is_demo: bool = True
    disclaimer: str

