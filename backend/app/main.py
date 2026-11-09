import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config import settings
from app.database import engine, Base, get_db
from app.seed import seed_database
from app.seed_synthetic_foundation import seed_synthetic_foundation_data
from app.seed_engineering_quality_assets import seed_engineering_quality_assets_data
from app.seed_department_land_utility import seed_department_land_utility_data
from app.seed_digital_office import seed_digital_office_data
from app.seed_notifications_calendar import seed_notifications_calendar_data
from app.seed_messaging import seed_messaging_data
from app.seed_universal_connectivity import seed_universal_connectivity
from app.models import Project, Issue, DepartmentDependency, WorkflowTask, Road
from app.routers import (
    auth, users, roles, departments, organisations, projects,
    officials, contractors, dependencies, issues, workflows,
    documents, audit, ai, executive, programmes, leakage, reports,
    engineering_quality_assets, land_utility, digital_office,
    notifications, calendar, messaging, connectivity, cm_dashboard,
    land_litigation
)

# Initialize schema tables
with engine.connect() as conn:
    # Check if notifications table needs schema upgrade
    try:
        from sqlalchemy import text
        res = conn.execute(text("PRAGMA table_info(notifications)"))
        cols = [r[1] for r in res.fetchall()]
        if cols and "priority" not in cols:
            conn.execute(text("DROP TABLE IF EXISTS notification_audit_events"))
            conn.execute(text("DROP TABLE IF EXISTS notifications"))
            conn.commit()
    except Exception:
        pass

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Tamil Nadu Highways Digital Operating System (TN-HDOS) Master API - Phase 0/1 Foundation",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration - restrict origins in production
cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()] or settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Automatically seed the database if fresh
    seed_database()
    seed_synthetic_foundation_data()
    seed_engineering_quality_assets_data()
    seed_department_land_utility_data()
    seed_digital_office_data()
    seed_notifications_calendar_data()
    seed_messaging_data()
    seed_universal_connectivity()

# Include versioned API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(roles.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(land_utility.router, prefix=settings.API_V1_STR)
app.include_router(digital_office.router, prefix=settings.API_V1_STR)
app.include_router(organisations.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(officials.router, prefix=settings.API_V1_STR)
app.include_router(contractors.router, prefix=settings.API_V1_STR)
app.include_router(dependencies.router, prefix=settings.API_V1_STR)
app.include_router(issues.router, prefix=settings.API_V1_STR)
app.include_router(workflows.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(executive.router, prefix=settings.API_V1_STR)
app.include_router(programmes.router, prefix=settings.API_V1_STR)
app.include_router(leakage.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(engineering_quality_assets.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(messaging.router, prefix=settings.API_V1_STR)
app.include_router(connectivity.router, prefix=settings.API_V1_STR)
app.include_router(cm_dashboard.router, prefix=settings.API_V1_STR)
app.include_router(land_litigation.router, prefix=settings.API_V1_STR)

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "TN-HDOS Master Platform",
        "version": "1.0.0-phase1",
        "demo_mode": settings.IS_DEMO_MODE,
        "disclaimer": "TN-HDOS Phase 1 Enterprise Foundation. All sample entities are marked [DEMO DATA]."
    }

@app.get("/api/v1/stats", tags=["Dashboard KPIs"])
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregates high-level KPIs for the Executive Landing Page"""
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status.in_(["IN_PROGRESS", "SANCTIONED", "DELAYED"])).count()
    delayed_projects = db.query(Project).filter(Project.status == "DELAYED").count()
    
    total_sanctioned_cr = db.query(func.sum(Project.sanctioned_cost_cr)).scalar() or 0.0
    total_expenditure_cr = db.query(func.sum(Project.expenditure_to_date_cr)).scalar() or 0.0
    
    pending_bottlenecks = db.query(DepartmentDependency).filter(DepartmentDependency.status != "CLEARED").count()
    critical_issues = db.query(Issue).filter(Issue.priority == "CRITICAL", Issue.status != "Closed").count()
    active_tasks = db.query(WorkflowTask).filter(WorkflowTask.status != "Completed").count()
    
    # Road type distribution
    road_counts = {
        "SH": db.query(Road).filter(Road.road_type == "SH").count(),
        "NH": db.query(Road).filter(Road.road_type == "NH").count(),
        "MDR": db.query(Road).filter(Road.road_type == "MDR").count(),
        "ODR": db.query(Road).filter(Road.road_type == "ODR").count(),
        "RURAL": db.query(Road).filter(Road.road_type == "RURAL").count()
    }

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "delayed_projects": delayed_projects,
        "total_sanctioned_cr": round(total_sanctioned_cr, 2),
        "total_expenditure_cr": round(total_expenditure_cr, 2),
        "pending_bottlenecks": pending_bottlenecks,
        "critical_issues": critical_issues,
        "active_tasks": active_tasks,
        "road_network_counts": road_counts,
        "is_demo": True
    }

