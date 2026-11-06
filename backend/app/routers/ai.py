from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AskAIRequest, AskAIResponse
from app.models import User, Project, Issue, DepartmentDependency
from app.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["Persistent Ask AI Assistant"])

@router.post("/query", response_model=AskAIResponse)
def ask_ai_endpoint(
    payload: AskAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query_text = payload.query.lower()
    screen = payload.screen_context or "General Operations"
    
    # Grounding references from existing database context
    grounding = []
    
    # Check if querying about delays / bottlenecks
    if "delay" in query_text or "bottleneck" in query_text or "clearance" in query_text:
        pending_deps = db.query(DepartmentDependency).filter(DepartmentDependency.status != "CLEARED").limit(3).all()
        for d in pending_deps:
            grounding.append({
                "type": "Department Dependency",
                "reference": f"DEP-{d.id}",
                "detail": f"{d.dependency_type} pending with {d.target_dept.name if d.target_dept else 'Agency'} (Impact: +{d.impact_days} days)"
            })
        answer = (
            f"[DEMO AI ANALYSIS for {screen}]: Found active statutory bottlenecks affecting project schedules. "
            f"Key friction is Land Acquisition and TANGEDCO EB pole relocation. "
            f"Escalation recommendation: Convene Joint District Collector Review Meeting."
        )
        suggested_actions = [
            "Convene Joint Revenue-Highways Taskforce",
            "Generate G.O. Escalation Draft Note",
            "Review Milestone Critical Path"
        ]
    elif "project" in query_text or "cost" in query_text or "sh-49" in query_text or "status" in query_text:
        sample_proj = db.query(Project).first()
        if sample_proj:
            grounding.append({
                "type": "Project Record",
                "reference": sample_proj.project_code,
                "detail": f"{sample_proj.title} (Sanctioned: ₹{sample_proj.sanctioned_cost_cr} Cr, Physical: {sample_proj.physical_progress_pct}%)"
            })
        answer = (
            f"[DEMO AI ANALYSIS for {screen}]: Analyzing highway asset records for '{payload.query}'. "
            f"Current expenditure conforms to CRIDP budget allocations. "
            f"Physical progress tracking requires updated geo-tagged drone survey evidence."
        )
        suggested_actions = [
            "Inspect Geo-tagged Evidence Records",
            "Compare Billable vs Physical Progress",
            "View Project 360° Profile"
        ]
    else:
        answer = (
            f"[DEMO AI ASSISTANT]: Contextual analysis for screen '{screen}'. "
            f"Query processed: '{payload.query}'. "
            f"The TN-HDOS AI subsystem is running in synthetic evaluation mode. Live departmental databases are not directly accessed."
        )
        suggested_actions = [
            "List High-Risk Interdepartmental Issues",
            "Show Pending Approvals in my Circle",
            "Check Contractor Performance Rating"
        ]
        
    return AskAIResponse(
        answer=answer,
        suggested_actions=suggested_actions,
        grounding_references=grounding,
        is_demo=True,
        disclaimer="DEMO DATA ONLY: This AI response is generated for architectural demonstration purposes. Official decisions and financial disbursements must be authorized through official statutory notes and digital signatures."
    )

