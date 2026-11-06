from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Programme, Project, WorkPackage, Tender, LandParcel, LegalCase,
    CorridorAlignment, Official, User
)
from app.schemas import (
    ProgrammeOut, CorridorAlignmentOut, TenderOut, LandParcelOut,
    LegalCaseOut, ProgrammeOverviewKPIs, ProjectOut
)
from app.auth import get_current_user
import json

router = APIRouter(prefix="/programmes", tags=["Infrastructure Programmes (CKICP & TNRSP-II)"])

@router.get("", response_model=List[ProgrammeOut])
def list_programmes(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists special infrastructure programmes (CKICP, TNRSP-II, CRIDP)."""
    q = db.query(Programme)
    if status and status != "ALL":
        q = q.filter(Programme.status == status)
    return q.all()

@router.get("/{code}", response_model=ProgrammeOut)
def get_programme(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns detailed master record for a programme (e.g. CKICP or TNRSP_II)."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    return prog

@router.get("/{code}/kpis", response_model=ProgrammeOverviewKPIs)
def get_programme_kpis(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns aggregated programme overview KPIs, land acquisition status, tenders, and litigations."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    projects = db.query(Project).filter(Project.programme_id == prog.id).all()
    project_ids = [p.id for p in projects]

    packages = db.query(WorkPackage).filter(WorkPackage.project_id.in_(project_ids)).all() if project_ids else []
    package_ids = [pkg.id for pkg in packages]

    tenders = db.query(Tender).filter(Tender.programme_id == prog.id).all()
    land_parcels = db.query(LandParcel).filter(LandParcel.project_id.in_(project_ids)).all() if project_ids else []
    legal_cases = db.query(LegalCase).filter(LegalCase.project_id.in_(project_ids)).all() if project_ids else []

    total_sanctioned = sum(p.sanctioned_cost_cr for p in projects)
    total_expenditure = sum(p.expenditure_to_date_cr for p in projects)
    avg_physical = sum(p.physical_progress_pct for p in projects) / len(projects) if projects else 0.0
    avg_financial = sum(p.financial_progress_pct for p in projects) / len(projects) if projects else 0.0

    awarded_tenders = sum(1 for t in tenders if t.status == "AWARDED")
    active_tenders = sum(1 for t in tenders if t.status in ["PUBLISHED", "TECH_EVALUATION", "FIN_EVALUATION"])

    total_land_req = sum(lp.total_land_sqm for lp in land_parcels)
    total_land_acq = sum(lp.total_land_sqm for lp in land_parcels if lp.possession_status == "POSSESSION_HANDED_OVER")
    land_acq_pct = (total_land_acq / total_land_req * 100.0) if total_land_req > 0 else 0.0
    total_comp_paid = sum(lp.compensation_paid_cr for lp in land_parcels)

    active_cases = len(legal_cases)
    stay_count = sum(1 for lc in legal_cases if lc.interim_stay_in_force)
    exposure_cr = sum(lc.financial_exposure_cr for lc in legal_cases)

    # Leadership specific to programme
    if code == "CKICP":
        leadership_info = {
            "project_director": "Thiru D. Baskara Pandian, IAS (Full Additional Charge)",
            "chief_engineer": "Er. R. Vimala (Additional Charge)",
            "headquarters": "CKICP Complex, HRS Campus, Guindy, Chennai - 600 025",
            "statutory_act": "Tamil Nadu Highways Act, 2001 (TN Act 34 of 2002)"
        }
    elif code == "TNRSP_II":
        leadership_info = {
            "project_director": "Thiru D. Baskara Pandian, IAS (Additional Charge)",
            "chief_engineer": "Er. S. Yamini (Additional Charge)",
            "headquarters": "TNRSP-II Directorate, Guindy, Chennai - 600 025",
            "statutory_act": "World Bank Safeguards / RFCTLARR Act 2013"
        }
    else:
        leadership_info = {
            "project_director": "Director General (Highways)",
            "chief_engineer": "Chief Engineer (C&M)",
            "headquarters": "HRS Campus, Guindy, Chennai",
            "statutory_act": "Tamil Nadu Highways Manual"
        }

    return ProgrammeOverviewKPIs(
        programme=ProgrammeOut.model_validate(prog),
        total_projects=len(projects),
        total_packages=len(packages),
        total_sanctioned_cost_cr=round(total_sanctioned, 2),
        total_expenditure_cr=round(total_expenditure, 2),
        overall_physical_progress_pct=round(avg_physical, 2),
        overall_financial_progress_pct=round(avg_financial, 2),
        total_tenders=len(tenders),
        awarded_tenders=awarded_tenders,
        active_tenders=active_tenders,
        total_land_required_sqm=round(total_land_req, 2),
        total_land_acquired_sqm=round(total_land_acq, 2),
        land_acquisition_pct=round(land_acq_pct, 2),
        total_compensation_paid_cr=round(total_comp_paid, 2),
        active_litigations_count=active_cases,
        stay_orders_count=stay_count,
        financial_exposure_cr=round(exposure_cr, 2),
        critical_risk_count=stay_count + (1 if avg_physical < 40 else 0),
        leadership=leadership_info
    )

@router.get("/{code}/projects", response_model=List[ProjectOut])
def get_programme_projects(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns all projects executing under the specified programme."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    return db.query(Project).filter(Project.programme_id == prog.id).all()

@router.get("/{code}/tenders", response_model=List[TenderOut])
def get_programme_tenders(
    code: str,
    status: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns official tender notifications including the published announcements."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    q = db.query(Tender).filter(Tender.programme_id == prog.id)
    if status and status != "ALL":
        q = q.filter(Tender.status == status)
    if district and district != "ALL":
        q = q.filter(Tender.location_district == district)
    return q.order_by(Tender.publication_date.desc()).all()

@router.get("/{code}/land-parcels", response_model=List[LandParcelOut])
def get_programme_land_parcels(
    code: str,
    district: Optional[str] = Query(None),
    possession_status: Optional[str] = Query(None),
    has_litigation: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns cadastral land acquisition parcel dataset with statutory notifications and awards."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    projects = db.query(Project).filter(Project.programme_id == prog.id).all()
    project_ids = [p.id for p in projects]
    if not project_ids:
        return []

    q = db.query(LandParcel).filter(LandParcel.project_id.in_(project_ids))
    if district and district != "ALL":
        q = q.filter(LandParcel.district == district)
    if possession_status and possession_status != "ALL":
        q = q.filter(LandParcel.possession_status == possession_status)
    if has_litigation is not None:
        q = q.filter(LandParcel.has_litigation == has_litigation)
    return q.all()

@router.get("/{code}/legal-cases", response_model=List[LegalCaseOut])
def get_programme_legal_cases(
    code: str,
    court_name: Optional[str] = Query(None),
    stay_only: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns litigation cases, court orders, arbitration claims, and financial exposure."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")

    projects = db.query(Project).filter(Project.programme_id == prog.id).all()
    project_ids = [p.id for p in projects]
    if not project_ids:
        return []

    q = db.query(LegalCase).filter(LegalCase.project_id.in_(project_ids))
    if court_name and court_name != "ALL":
        q = q.filter(LegalCase.court_name.ilike(f"%{court_name}%"))
    if stay_only:
        q = q.filter(LegalCase.interim_stay_in_force == True)
    return q.all()

@router.get("/{code}/alignments", response_model=List[CorridorAlignmentOut])
def get_programme_alignments(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns corridor alignment paths with verified GeoJSON coordinates."""
    prog = db.query(Programme).filter(Programme.code == code).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Programme not found")
    return db.query(CorridorAlignment).filter(CorridorAlignment.programme_id == prog.id).all()

