import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import WorkflowTask, User
from app.schemas import WorkflowTaskOut, WorkflowTaskCreate
from app.auth import get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/workflows", tags=["Workflows & Action Items"])

@router.get("", response_model=List[WorkflowTaskOut])
def list_workflow_tasks(
    my_tasks_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WorkflowTask)
    if my_tasks_only:
        query = query.filter(WorkflowTask.assigned_to_user_id == current_user.id)
        
    tasks = query.order_by(WorkflowTask.id.desc()).all()
    results = []
    for t in tasks:
        results.append(WorkflowTaskOut(
            id=t.id,
            task_reference=t.task_reference,
            project_id=t.project_id,
            project_title=t.project.title if t.project else None,
            issue_id=t.issue_id,
            title=t.title,
            description=t.description,
            priority=t.priority,
            status=t.status,
            due_date=t.due_date,
            assigned_to_name=t.assigned_to_user.full_name if t.assigned_to_user else None,
            created_by_name=t.created_by_user.full_name if t.created_by_user else None,
            created_at=t.created_at
        ))
    return results

@router.post("", response_model=WorkflowTaskOut, status_code=status.HTTP_201_CREATED)
def create_workflow_task(
    payload: WorkflowTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task_count = db.query(WorkflowTask).count() + 1
    task_ref = f"TSK-2026-{task_count:04d}"
    
    task = WorkflowTask(
        task_reference=task_ref,
        project_id=payload.project_id,
        issue_id=payload.issue_id,
        title=payload.title,
        description=payload.description,
        assigned_to_user_id=payload.assigned_to_user_id,
        created_by_user_id=current_user.id,
        priority=payload.priority,
        status="Assigned",
        due_date=payload.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    log_audit_event(
        db=db,
        action="CREATE",
        entity_type="WORKFLOW_TASK",
        entity_id=task.id,
        entity_reference=task.task_reference,
        user=current_user,
        changes={"title": task.title, "assigned_to": payload.assigned_to_user_id}
    )
    
    return WorkflowTaskOut(
        id=task.id,
        task_reference=task.task_reference,
        project_id=task.project_id,
        project_title=task.project.title if task.project else None,
        issue_id=task.issue_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        assigned_to_name=task.assigned_to_user.full_name if task.assigned_to_user else None,
        created_by_name=current_user.full_name,
        created_at=task.created_at
    )

@router.patch("/{task_id}/complete", response_model=WorkflowTaskOut)
def complete_workflow_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.status = "Completed"
    task.completed_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(task)
    
    log_audit_event(
        db=db,
        action="COMPLETE",
        entity_type="WORKFLOW_TASK",
        entity_id=task.id,
        entity_reference=task.task_reference,
        user=current_user
    )
    
    return WorkflowTaskOut(
        id=task.id,
        task_reference=task.task_reference,
        project_id=task.project_id,
        project_title=task.project.title if task.project else None,
        issue_id=task.issue_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        assigned_to_name=task.assigned_to_user.full_name if task.assigned_to_user else None,
        created_by_name=task.created_by_user.full_name if task.created_by_user else None,
        created_at=task.created_at
    )

