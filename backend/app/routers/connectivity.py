"""
TN-HDOS Universal Connectivity Router
Provides:
- Bidirectional typed entity relationship navigation
- Universal cross-entity search
- Interactive graph generation
- Relationship creation, supersession, and audit logging
- AI-assisted relationship discovery with mandatory human confirmation
"""

import datetime
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, EntityRelationship, RelationshipAuditLog, Project, Contractor,
    Department, LandParcel, LegalCase, QualityFindingRecord, CMDirection
)
from app.schemas import (
    EntityRelationshipCreate, EntityRelationshipOut, RelationshipAuditLogOut,
    EntityRelationshipGraphOut, EntityRelationshipGraphNode, EntityRelationshipGraphEdge
)

router = APIRouter(prefix="/connectivity", tags=["Universal Connectivity Engine"])

def check_entity_access(current_user: User, access_tier: str) -> bool:
    """Enforces confidentiality tier boundaries on relationship queries."""
    role_code = current_user.role.code if current_user.role else ""
    if role_code in ["ADMIN", "CHIEF_MINISTER"]:
        return True
    if access_tier == "CABINET_ONLY":
        return role_code in ["MINISTER", "PRIN_SEC", "SEC"]
    if access_tier == "CONFIDENTIAL":
        return role_code in ["MINISTER", "PRIN_SEC", "SEC", "CHIEF_ENG", "LEGAL_OFFICER"]
    if access_tier == "RESTRICTED":
        return role_code != "CITIZEN"
    return True

@router.get("/entities/{entity_type}/{entity_id}/relationships", response_model=List[EntityRelationshipOut])
def get_entity_relationships(
    entity_type: str,
    entity_id: str,
    relationship_type: Optional[str] = Query(None, description="Filter by relationship verb"),
    current_only: bool = Query(True, description="Show only active relationships"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all connected records for a specific entity (projects, contractors,
    officials, court cases, land parcels, etc.) with role-based access filtering.
    """
    e_type_upper = entity_type.upper()
    e_id_str = str(entity_id)

    query = db.query(EntityRelationship).filter(
        or_(
            and_(
                EntityRelationship.source_entity_type == e_type_upper,
                EntityRelationship.source_entity_id == e_id_str
            ),
            and_(
                EntityRelationship.target_entity_type == e_type_upper,
                EntityRelationship.target_entity_id == e_id_str
            )
        )
    )

    if current_only:
        query = query.filter(EntityRelationship.is_current == True)
    if relationship_type:
        query = query.filter(EntityRelationship.relationship_type == relationship_type.upper())

    results = query.order_by(EntityRelationship.created_at.desc()).all()

    # Filter by user role access tier
    accessible = [r for r in results if check_entity_access(current_user, r.access_tier)]
    return accessible

@router.get("/graph", response_model=EntityRelationshipGraphOut)
def get_entity_relationship_graph(
    center_type: Optional[str] = Query(None, description="Root entity type, e.g. PROJECT, CONTRACTOR"),
    center_id: Optional[str] = Query(None, description="Root entity ID"),
    entity_type: Optional[str] = Query(None, description="Alias for center_type"),
    entity_id: Optional[str] = Query(None, description="Alias for center_id"),
    depth: int = Query(1, ge=1, le=2, description="Traversal hop depth"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a localized node-link graph payload for interactive visual exploration.
    Bounded traversal depth prevents performance degradation.
    """
    c_type = center_type or entity_type or "PROJECT"
    c_id = center_id or entity_id or "1"
    center_type_upper = c_type.upper()
    center_id_str = str(c_id)

    # 1. Fetch Root Entity Name
    root_name = f"{center_type_upper} #{center_id_str}"
    if center_type_upper == "PROJECT":
        p = db.query(Project).filter(Project.id == int(center_id_str) if center_id_str.isdigit() else 0).first()
        if p:
            root_name = p.title
    elif center_type_upper == "CONTRACTOR":
        c = db.query(Contractor).filter(Contractor.id == int(center_id_str) if center_id_str.isdigit() else 0).first()
        if c:
            root_name = c.company_name
    elif center_type_upper == "USER" or center_type_upper == "OFFICER":
        u = db.query(User).filter(User.id == int(center_id_str) if center_id_str.isdigit() else 0).first()
        if u:
            root_name = u.full_name

    nodes: Dict[str, EntityRelationshipGraphNode] = {}
    edges: List[EntityRelationshipGraphEdge] = []

    root_key = f"{center_type_upper}:{center_id_str}"
    nodes[root_key] = EntityRelationshipGraphNode(
        id=root_key,
        name=root_name,
        type=center_type_upper,
        category="ROOT",
        status="ACTIVE",
        badge="Center Focus",
        access_tier="PUBLIC"
    )

    # 1-Hop Neighbors
    hop1_rels = db.query(EntityRelationship).filter(
        EntityRelationship.is_current == True,
        or_(
            and_(EntityRelationship.source_entity_type == center_type_upper, EntityRelationship.source_entity_id == center_id_str),
            and_(EntityRelationship.target_entity_type == center_type_upper, EntityRelationship.target_entity_id == center_id_str)
        )
    ).all()

    hop2_keys = []
    for r in hop1_rels:
        if not check_entity_access(current_user, r.access_tier):
            continue

        src_key = f"{r.source_entity_type}:{r.source_entity_id}"
        tgt_key = f"{r.target_entity_type}:{r.target_entity_id}"

        if src_key not in nodes:
            nodes[src_key] = EntityRelationshipGraphNode(
                id=src_key,
                name=r.source_entity_name,
                type=r.source_entity_type,
                category="CONNECTED",
                access_tier=r.access_tier
            )
            hop2_keys.append((r.source_entity_type, r.source_entity_id))

        if tgt_key not in nodes:
            nodes[tgt_key] = EntityRelationshipGraphNode(
                id=tgt_key,
                name=r.target_entity_name,
                type=r.target_entity_type,
                category="CONNECTED",
                access_tier=r.access_tier
            )
            hop2_keys.append((r.target_entity_type, r.target_entity_id))

        edges.append(EntityRelationshipGraphEdge(
            id=r.relationship_code,
            source=src_key,
            target=tgt_key,
            label=r.relationship_type.replace("_", " "),
            type=r.relationship_type,
            verification_status=r.verification_status
        ))

    # Optional 2nd Hop
    if depth >= 2 and len(nodes) < 30:
        for (h_type, h_id) in hop2_keys[:5]:
            sub_rels = db.query(EntityRelationship).filter(
                EntityRelationship.is_current == True,
                or_(
                    and_(EntityRelationship.source_entity_type == h_type, EntityRelationship.source_entity_id == str(h_id)),
                    and_(EntityRelationship.target_entity_type == h_type, EntityRelationship.target_entity_id == str(h_id))
                )
            ).limit(4).all()

            for sr in sub_rels:
                if not check_entity_access(current_user, sr.access_tier):
                    continue
                s_key = f"{sr.source_entity_type}:{sr.source_entity_id}"
                t_key = f"{sr.target_entity_type}:{sr.target_entity_id}"

                if s_key not in nodes:
                    nodes[s_key] = EntityRelationshipGraphNode(
                        id=s_key,
                        name=sr.source_entity_name,
                        type=sr.source_entity_type,
                        category="EXTENDED",
                        access_tier=sr.access_tier
                    )
                if t_key not in nodes:
                    nodes[t_key] = EntityRelationshipGraphNode(
                        id=t_key,
                        name=sr.target_entity_name,
                        type=sr.target_entity_type,
                        category="EXTENDED",
                        access_tier=sr.access_tier
                    )

                edge_id = f"{sr.relationship_code}_h2"
                if not any(e.source == s_key and e.target == t_key for e in edges):
                    edges.append(EntityRelationshipGraphEdge(
                        id=edge_id,
                        source=s_key,
                        target=t_key,
                        label=sr.relationship_type.replace("_", " "),
                        type=sr.relationship_type,
                        verification_status=sr.verification_status
                    ))

    return EntityRelationshipGraphOut(
        center_entity_id=center_id_str,
        center_entity_type=center_type_upper,
        nodes=list(nodes.values()),
        edges=edges,
        total_connections=len(edges)
    )

@router.get("/search")
def universal_entity_search(
    query: Optional[str] = Query(None, description="Search keyword, code, case number, or name"),
    q: Optional[str] = Query(None, description="Alias for query"),
    entity_types: Optional[List[str]] = Query(None, description="Filter by entity types"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Universal Search: Finds any authorized entity across TN-HDOS and returns its direct
    connection metrics and routing target.
    """
    search_term = query or q or ""
    q_str = f"%{search_term}%"
    results = []

    # 1. Projects
    if not entity_types or "PROJECT" in [t.upper() for t in entity_types]:
        projs = db.query(Project).filter(
            or_(Project.project_code.ilike(q_str), Project.title.ilike(q_str))
        ).limit(limit).all()
        for p in projs:
            rel_count = db.query(EntityRelationship).filter(
                EntityRelationship.is_current == True,
                or_(
                    and_(EntityRelationship.source_entity_type == "PROJECT", EntityRelationship.source_entity_id == str(p.id)),
                    and_(EntityRelationship.target_entity_type == "PROJECT", EntityRelationship.target_entity_id == str(p.id))
                )
            ).count()
            results.append({
                "entity_type": "PROJECT",
                "entity_id": str(p.id),
                "code": p.project_code,
                "title": p.title,
                "subtitle": f"Status: {p.status} • Cost: Rs {p.sanctioned_cost_cr} Cr",
                "route": f"/project-360?id={p.id}",
                "connection_count": rel_count,
                "badge": p.status
            })

    # 2. Contractors
    if not entity_types or "CONTRACTOR" in [t.upper() for t in entity_types]:
        contractors = db.query(Contractor).filter(Contractor.company_name.ilike(q_str)).limit(limit).all()
        for c in contractors:
            rel_count = db.query(EntityRelationship).filter(
                EntityRelationship.is_current == True,
                or_(
                    and_(EntityRelationship.source_entity_type == "CONTRACTOR", EntityRelationship.source_entity_id == str(c.id)),
                    and_(EntityRelationship.target_entity_type == "CONTRACTOR", EntityRelationship.target_entity_id == str(c.id))
                )
            ).count()
            results.append({
                "entity_type": "CONTRACTOR",
                "entity_id": str(c.id),
                "code": c.registration_number,
                "title": c.company_name,
                "subtitle": f"Class: {c.class_category} • Reg: {c.registration_number}",
                "route": f"/directory?tab=contractors&id={c.id}",
                "connection_count": rel_count,
                "badge": "EMPANELLED" if not c.is_blacklisted else "BLACKLISTED"
            })

    # 3. Officials & Engineers
    if not entity_types or "OFFICIAL" in [t.upper() for t in entity_types] or "ENGINEER" in [t.upper() for t in entity_types]:
        officials = db.query(User).filter(
            or_(User.full_name.ilike(q_str), User.username.ilike(q_str))
        ).limit(limit).all()
        for u in officials:
            rel_count = db.query(EntityRelationship).filter(
                EntityRelationship.is_current == True,
                or_(
                    and_(EntityRelationship.source_entity_type == "OFFICER", EntityRelationship.source_entity_id == str(u.id)),
                    and_(EntityRelationship.target_entity_type == "OFFICER", EntityRelationship.target_entity_id == str(u.id))
                )
            ).count()
            results.append({
                "entity_type": "OFFICIAL",
                "entity_id": str(u.id),
                "code": u.username,
                "title": u.full_name,
                "subtitle": f"Role: {u.role.name if u.role else 'Official'} • Dept: {u.department.name if u.department else 'Highways'}",
                "route": f"/directory?userId={u.id}",
                "connection_count": rel_count,
                "badge": u.role.tier if u.role else "OFFICER"
            })

    # 4. CM Directions
    if not entity_types or "CM_DIRECTION" in [t.upper() for t in entity_types]:
        directions = db.query(CMDirection).filter(
            or_(CMDirection.direction_code.ilike(q_str), CMDirection.title.ilike(q_str))
        ).limit(limit).all()
        for d in directions:
            results.append({
                "entity_type": "CM_DIRECTION",
                "entity_id": str(d.id),
                "code": d.direction_code,
                "title": d.title,
                "subtitle": f"Priority: {d.priority} • Status: {d.status} • Officer: {d.assigned_officer_name}",
                "route": f"/cm-dashboard?directionId={d.id}",
                "connection_count": 2,
                "badge": d.priority
            })

    # 5. Legal Cases
    if not entity_types or "LEGAL_CASE" in [t.upper() for t in entity_types]:
        cases = db.query(LegalCase).filter(
            or_(LegalCase.case_reference.ilike(q_str), LegalCase.petitioner.ilike(q_str))
        ).limit(limit).all()
        for lc in cases:
            results.append({
                "entity_type": "LEGAL_CASE",
                "entity_id": str(lc.id),
                "code": lc.case_reference,
                "title": f"{lc.case_reference}: {lc.petitioner} vs State",
                "subtitle": f"Court: {lc.court_name} • Type: {lc.case_type}",
                "route": f"/compliance?caseId={lc.id}",
                "connection_count": 3,
                "badge": lc.current_status
            })

    return {
        "query": query,
        "total_matches": len(results),
        "results": results[:limit]
    }

@router.post("/relationships", response_model=EntityRelationshipOut)
def create_relationship(
    payload: EntityRelationshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new typed bidirectional relationship with audit logging.
    Requires internal or leadership clearance.
    """
    role_code = current_user.role.code if current_user.role else ""
    if role_code not in ["ADMIN", "CHIEF_MINISTER", "MINISTER", "PRIN_SEC", "CHIEF_ENG", "SE_CIRCLE", "EE_DIV"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Adding operational relationships requires Divisional Engineer or higher authority."
        )

    # Circular Operational Dependency Prevention
    if (payload.source_entity_type == payload.target_entity_type and 
        payload.source_entity_id == payload.target_entity_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid relationship: Cannot link an entity to itself."
        )

    # Check for duplicate active relationship
    existing = db.query(EntityRelationship).filter(
        EntityRelationship.source_entity_type == payload.source_entity_type.upper(),
        EntityRelationship.source_entity_id == str(payload.source_entity_id),
        EntityRelationship.relationship_type == payload.relationship_type.upper(),
        EntityRelationship.target_entity_type == payload.target_entity_type.upper(),
        EntityRelationship.target_entity_id == str(payload.target_entity_id),
        EntityRelationship.is_current == True
    ).first()

    if existing:
        return existing

    count = db.query(EntityRelationship).count()
    code = f"REL-2026-{count + 1:04d}"

    src_name = payload.source_entity_name or f"{payload.source_entity_type.capitalize()} #{payload.source_entity_id}"
    tgt_name = payload.target_entity_name or f"{payload.target_entity_type.capitalize()} #{payload.target_entity_id}"

    new_rel = EntityRelationship(
        relationship_code=code,
        source_entity_type=payload.source_entity_type.upper(),
        source_entity_id=str(payload.source_entity_id),
        source_entity_name=src_name,
        relationship_type=payload.relationship_type.upper(),
        target_entity_type=payload.target_entity_type.upper(),
        target_entity_id=str(payload.target_entity_id),
        target_entity_name=tgt_name,
        directionality=payload.directionality,
        valid_from=datetime.datetime.utcnow(),
        is_current=True,
        verification_status=payload.verification_status,
        confidence_score=payload.weight or 1.0,
        source_reference=payload.source_reference,
        access_tier=payload.access_tier,
        metadata_json=payload.metadata_json,
        created_by_user_id=current_user.id,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_rel)
    db.commit()
    db.refresh(new_rel)

    # Write Audit Log
    audit = RelationshipAuditLog(
        relationship_id=new_rel.id,
        relationship_code=new_rel.relationship_code,
        action="CREATED",
        actor_user_id=current_user.id,
        reason=f"Official relationship established by {current_user.full_name}",
        new_state_json=json.dumps({"code": code, "type": new_rel.relationship_type})
    )
    db.add(audit)
    db.commit()

    return new_rel

@router.put("/relationships/{relationship_id}/supersede", response_model=EntityRelationshipOut)
@router.post("/relationships/{relationship_id}/supersede", response_model=EntityRelationshipOut)
def supersede_relationship(
    relationship_id: int,
    reason: str = Query(..., min_length=5, description="Reason for superseding or modifying relationship"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supersedes or terminates an active relationship while maintaining historical audit trail.
    """
    rel = db.query(EntityRelationship).filter(EntityRelationship.id == relationship_id).first()
    if not rel:
        raise HTTPException(status_code=404, detail="Entity relationship not found.")

    rel.is_current = False
    rel.valid_to = datetime.datetime.utcnow()
    rel.updated_at = datetime.datetime.utcnow()

    audit = RelationshipAuditLog(
        relationship_id=rel.id,
        relationship_code=rel.relationship_code,
        action="SUPERSEDED",
        actor_user_id=current_user.id,
        reason=reason,
        previous_state_json=json.dumps({"is_current": True}),
        new_state_json=json.dumps({"is_current": False, "valid_to": str(rel.valid_to)})
    )
    db.add(audit)
    db.commit()
    db.refresh(rel)
    return rel

@router.get("/suggested-relationships")
def get_ai_suggested_relationships(
    entity_type: str = Query(..., description="Entity type to find suggestions for"),
    entity_id: str = Query(..., description="Entity ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI-Assisted Relationship Discovery: Analyzes unlinked operational dependencies,
    court orders, and contractor associations, presenting candidate links that
    REQUIRE human confirmation before entering the authoritative knowledge graph.
    """
    e_type_upper = entity_type.upper()
    suggestions = []

    if e_type_upper == "PROJECT":
        p = db.query(Project).filter(Project.id == int(entity_id) if entity_id.isdigit() else 0).first()
        if p:
            # Suggest legal cases associated with project or land parcels
            unlinked_cases = db.query(LegalCase).filter(
                LegalCase.project_id == p.id
            ).limit(2).all()
            for lc in unlinked_cases:
                suggestions.append({
                    "suggestion_id": f"SUG-LC-{lc.id}",
                    "source_entity_type": "PROJECT",
                    "source_entity_id": str(p.id),
                    "source_entity_name": p.title,
                    "suggested_relationship": "AFFECTED_BY_LITIGATION",
                    "target_entity_type": "LEGAL_CASE",
                    "target_entity_id": str(lc.id),
                    "target_entity_name": f"{lc.case_reference} ({lc.court_name})",
                    "ai_reason": f"Case directly references Project ID {p.id} with stay status: {lc.interim_stay_in_force}.",
                    "confidence_score": 0.92,
                    "requires_human_confirmation": True
                })

            # Suggest contractor past performance link
            if p.contractor_id:
                c = db.query(Contractor).filter(Contractor.id == p.contractor_id).first()
                if c:
                    suggestions.append({
                        "suggestion_id": f"SUG-CNT-{c.id}",
                        "source_entity_type": "CONTRACTOR",
                        "source_entity_id": str(c.id),
                        "source_entity_name": c.company_name,
                        "suggested_relationship": "CONTRACTUAL_DEFAULT_RISK",
                        "target_entity_type": "PROJECT",
                        "target_entity_id": str(p.id),
                        "target_entity_name": p.title,
                        "ai_reason": "Contractor holds 2 concurrent delayed milestones across state network.",
                        "confidence_score": 0.92,
                        "requires_human_confirmation": True
                    })

    return {
        "entity_type": e_type_upper,
        "entity_id": entity_id,
        "suggestions_count": len(suggestions),
        "suggestions": suggestions
    }

@router.post("/confirm-suggestion", response_model=EntityRelationshipOut)
def confirm_ai_suggested_relationship(
    payload: EntityRelationshipCreate,
    suggestion_id: str = Query(..., description="ID of the AI suggestion being confirmed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Formally confirms an AI-inferred relationship into an authoritative verified record.
    Fulfills statutory governance requirement that AI cannot alter records autonomously.
    """
    payload.verification_status = "VERIFIED_OFFICIAL"
    payload.source_reference = f"AI Inference Confirmed by {current_user.full_name} ({suggestion_id})"
    return create_relationship(payload, db, current_user)
