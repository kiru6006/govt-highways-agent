import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token(username: str = "admin", password: str = "admin123"):
    resp = client.post(
        "/api/v1/auth/token",
        data={"username": username, "password": password}
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]

def get_contractor_token():
    return get_auth_token("contractor_lt", "highway123")


# -------------------------------------------------------------
# 1. DIGITAL OFFICE OVERVIEW & 14 DYNAMIC KPIS
# -------------------------------------------------------------

def test_digital_office_overview_14_kpis():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/overview", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    kpis = data["kpis"]
    # Check key dynamic KPIs
    assert kpis["total_incoming_communications"] >= 20
    assert kpis["files_currently_under_processing"] >= 5
    assert kpis["files_pending_secretary_approval"] >= 1
    assert kpis["files_pending_minister_decision"] >= 1
    assert kpis["decisions_issued"] >= 15
    assert kpis["pending_action_items"] >= 15
    assert kpis["completed_action_items"] >= 5
    assert kpis["average_file_processing_time_days"] > 0
    assert kpis["critical_administrative_bottlenecks"] >= 1


# -------------------------------------------------------------
# 2. INCOMING AND OUTGOING CORRESPONDENCE REGISTER
# -------------------------------------------------------------

def test_correspondence_register_and_filtering():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # All correspondence
    resp = client.get("/api/v1/digital-office/correspondence", headers=headers)
    assert resp.status_code == 200, resp.text
    comms = resp.json()
    assert len(comms) >= 50

    # Filter incoming
    resp_in = client.get("/api/v1/digital-office/correspondence?communication_type=INCOMING", headers=headers)
    assert resp_in.status_code == 200
    assert all(c["communication_type"] == "INCOMING" for c in resp_in.json())

    # Filter outgoing
    resp_out = client.get("/api/v1/digital-office/correspondence?communication_type=OUTGOING", headers=headers)
    assert resp_out.status_code == 200
    assert all(c["communication_type"] == "OUTGOING" for c in resp_out.json())


def test_correspondence_registration_with_dispatch_evidence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/digital-office/correspondence",
        headers=headers,
        json={
            "reference_number": "ROC.2026/TEST/D1",
            "communication_type": "OUTGOING",
            "sender_or_recipient_org": "District Collectorate Ooty",
            "sender_or_recipient_name": "District Revenue Officer",
            "sender_or_recipient_role": "Special DRO (LA)",
            "subject": "Authorization for expedited Treasury token allocation",
            "category": "Administrative Sanction",
            "priority": "HIGH",
            "confidentiality_level": "INTERNAL",
            "dispatch_evidence_ref": "SPEEDPOST-ACK-9912-TN"
        }
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "SUCCESS"
    assert resp.json()["item"]["status"] == "DISPATCHED"


# -------------------------------------------------------------
# 3. GOVERNMENT FILE MANAGEMENT & IMMUTABLE MOVEMENTS
# -------------------------------------------------------------

def test_government_file_register_and_dossier():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/files", headers=headers)
    assert resp.status_code == 200, resp.text
    files = resp.json()
    assert len(files) >= 20

    f_id = files[0]["id"]
    detail_resp = client.get(f"/api/v1/digital-office/files/{f_id}", headers=headers)
    assert detail_resp.status_code == 200, detail_resp.text
    detail = detail_resp.json()
    assert "file" in detail
    assert "movements" in detail
    assert "notes" in detail
    assert "decisions" in detail


def test_file_movement_registration():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Pick an active open file
    files_resp = client.get("/api/v1/digital-office/files?is_closed=false", headers=headers)
    f_id = files_resp.json()[0]["id"]

    move_resp = client.post(
        f"/api/v1/digital-office/files/{f_id}/movement",
        headers=headers,
        json={
            "to_department_id": 2,
            "to_officer_name": "Special DRO (Land Acquisition)",
            "reason_for_movement": "Joint verification of survey boundaries",
            "instruction_note": "Please examine village cadastral map and convey revenue concurrence.",
            "expected_action": "Affix revenue certification.",
            "due_date": "2026-02-28"
        }
    )
    assert move_resp.status_code == 200, move_resp.text
    assert move_resp.json()["status"] == "SUCCESS"
    assert move_resp.json()["movement"]["movement_number"] >= 1


# -------------------------------------------------------------
# 4. STRUCTURED OFFICE NOTES & WORKFLOW STAGES
# -------------------------------------------------------------

def test_submit_structured_office_note():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    files_resp = client.get("/api/v1/digital-office/files?is_closed=false", headers=headers)
    f_id = files_resp.json()[0]["id"]

    note_resp = client.post(
        f"/api/v1/digital-office/files/{f_id}/notes",
        headers=headers,
        json={
            "background_context": "Statutory review for bridge reconstruction across Kollidam River.",
            "factual_matrix": "Hydraulic discharge calculations verified as per IRC-78:2014 standards.",
            "financial_implications_cr": 0.45,
            "legal_and_compliance_implications": "All environmental NOC clearances obtained.",
            "project_milestone_impact": "Enables foundation well sinking phase.",
            "officer_recommendation": "Recommended for administrative approval and budget commitment under Head 5054.",
            "supporting_doc_ref": "DOC-HYD-CALC-412"
        }
    )
    assert note_resp.status_code == 200, note_resp.text
    assert note_resp.json()["status"] == "SUCCESS"
    assert note_resp.json()["note"]["financial_implications_cr"] == 0.45


def test_advance_file_workflow_to_approved():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    files_resp = client.get("/api/v1/digital-office/files?is_closed=false", headers=headers)
    # Pick a file not being used by the demo
    target_file = next((f for f in files_resp.json() if f["file_number"] != "FILE-CKICP-2026-088"), files_resp.json()[1])
    f_id = target_file["id"]

    wf_resp = client.post(
        f"/api/v1/digital-office/files/{f_id}/workflow",
        headers=headers,
        json={
            "new_stage": "APPROVED",
            "decision_remarks": "Accorded formal administrative approval following Secretariat scrutiny.",
            "decision_authority": "PRINCIPAL_SECRETARY",
            "approved_action": "Issue G.O. for revised financial sanction.",
            "supporting_doc_ref": "G.O.Ms.No. 418/Highways/2026"
        }
    )
    assert wf_resp.status_code == 200, wf_resp.text
    assert wf_resp.json()["stage"] == "APPROVED"


# -------------------------------------------------------------
# 5. DECISIONS, MEETINGS, ACTIONS & DOCUMENTS
# -------------------------------------------------------------

def test_decisions_register():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/decisions", headers=headers)
    assert resp.status_code == 200, resp.text
    decs = resp.json()
    assert len(decs) >= 15

    authorities = {d["decision_authority"] for d in decs}
    assert "MINISTER" in authorities
    assert "PRINCIPAL_SECRETARY" in authorities


def test_meetings_register():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/meetings", headers=headers)
    assert resp.status_code == 200, resp.text
    meetings = resp.json()
    assert len(meetings) >= 10
    categories = {m["meeting_category"] for m in meetings}
    assert "MINISTERIAL_REVIEW" in categories or "SECRETARY_COORDINATION" in categories


def test_action_items_and_compliance_update():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/actions", headers=headers)
    assert resp.status_code == 200, resp.text
    actions = resp.json()
    assert len(actions) >= 30

    act_id = actions[0]["id"]
    upd_resp = client.post(
        f"/api/v1/digital-office/actions/{act_id}/update",
        headers=headers,
        json={
            "status": "COMPLETED",
            "progress_pct": 100.0,
            "evidence_ref": "FINAL-COMPLIANCE-CERT-2026-01",
            "closure_remarks": "Action verified and closed following site inspection."
        }
    )
    assert upd_resp.status_code == 200, upd_resp.text
    assert upd_resp.json()["status"] == "SUCCESS"


def test_digital_documents_repository():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/documents", headers=headers)
    assert resp.status_code == 200, resp.text
    docs = resp.json()
    assert len(docs) >= 50
    cats = {d["category"] for d in docs}
    assert "Government Order" in cats


def test_ai_office_intelligence_findings():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/digital-office/ai-intelligence", headers=headers)
    assert resp.status_code == 200, resp.text
    ai_data = resp.json()
    assert ai_data["total"] >= 15
    codes = {f["finding_code"] for f in ai_data["items"]}
    assert "DO-AIF-SH15-01" in codes


# -------------------------------------------------------------
# 6. SECTION 16 DEMONSTRATION SCENARIO VERIFICATION
# -------------------------------------------------------------

def test_section_16_demonstration_scenario_traceability():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Incoming Communication COMM-IN-2026-042
    c_resp = client.get("/api/v1/digital-office/correspondence?search=COMM-IN-2026-042", headers=headers)
    assert c_resp.status_code == 200
    assert len(c_resp.json()) > 0
    demo_c = c_resp.json()[0]
    assert demo_c["communication_code"] == "COMM-IN-2026-042"
    assert "0.85 Cr" in demo_c["subject"]

    # 2. Government File FILE-CKICP-2026-088
    f_resp = client.get(f"/api/v1/digital-office/files/{demo_c['government_file_id']}", headers=headers)
    assert f_resp.status_code == 200
    file_detail = f_resp.json()
    f = file_detail["file"]
    assert f["file_number"] == "FILE-CKICP-2026-088"
    assert f["project_id"] == 4

    # 3. Movements trace
    movements = file_detail["movements"]
    assert len(movements) >= 3
    assert any("Pykara" in m["reason_for_movement"] for m in movements)

    # 4. Office Note NOTE-2026-142
    notes = file_detail["notes"]
    assert len(notes) >= 1
    assert any(n["financial_implications_cr"] == 0.85 for n in notes)

    # 5. Ministerial Decision DEC-MIN-2026-021
    dec_resp = client.get("/api/v1/digital-office/decisions?search=DEC-MIN-2026-021", headers=headers)
    assert dec_resp.status_code == 200
    decs = [d for d in dec_resp.json() if d["decision_code"] == "DEC-MIN-2026-021"]
    assert len(decs) > 0
    dec = decs[0]
    assert dec["decision_authority"] == "MINISTER"
    assert "TANGEDCO" in dec["decision_statement"]

    # 6. Action items ACT-OFF-081 & ACT-OFF-082
    act_resp = client.get("/api/v1/digital-office/actions", headers=headers)
    assert act_resp.status_code == 200
    act_codes = {a["action_code"] for a in act_resp.json()}
    assert "ACT-OFF-081" in act_codes
    assert "ACT-OFF-082" in act_codes


# -------------------------------------------------------------
# 7. MANDATORY NEGATIVE TESTS
# -------------------------------------------------------------

def test_negative_contractor_cannot_approve_file():
    contractor_token = get_contractor_token()
    headers = {"Authorization": f"Bearer {contractor_token}"}

    resp = client.post(
        "/api/v1/digital-office/files/1/workflow",
        headers=headers,
        json={
            "new_stage": "APPROVED",
            "decision_remarks": "Contractor attempting unauthorized administrative approval.",
            "decision_authority": "CONTRACTOR"
        }
    )
    assert resp.status_code == 403
    assert "RBAC Restriction" in resp.json()["detail"]


def test_negative_contractor_cannot_access_confidential_file():
    contractor_token = get_contractor_token()
    headers = {"Authorization": f"Bearer {contractor_token}"}

    admin_token = get_auth_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    files_resp = client.get("/api/v1/digital-office/files", headers=admin_headers)
    confidential_file = next(f for f in files_resp.json() if f["confidentiality_level"] in ["CONFIDENTIAL", "SECRET"])

    resp = client.get(f"/api/v1/digital-office/files/{confidential_file['id']}", headers=headers)
    assert resp.status_code == 403
    assert "Security Constraint" in resp.json()["detail"]


def test_negative_closed_file_cannot_be_moved():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    files_resp = client.get("/api/v1/digital-office/files?is_closed=true", headers=headers)
    closed_file = files_resp.json()[0]

    resp = client.post(
        f"/api/v1/digital-office/files/{closed_file['id']}/movement",
        headers=headers,
        json={
            "to_department_id": 2,
            "to_officer_name": "Special Officer",
            "reason_for_movement": "Attempting movement on closed file",
            "instruction_note": "Invalid action",
            "expected_action": "None"
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint: A closed file cannot be moved" in resp.json()["detail"]


def test_negative_outgoing_communication_requires_dispatch_evidence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/digital-office/correspondence",
        headers=headers,
        json={
            "reference_number": "ROC.2026/ERR/01",
            "communication_type": "OUTGOING",
            "sender_or_recipient_org": "District Collectorate",
            "sender_or_recipient_name": "Collector",
            "sender_or_recipient_role": "Head",
            "subject": "Missing dispatch evidence test",
            "category": "Administrative Sanction",
            "dispatch_evidence_ref": None  # Missing evidence!
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint: An official communication cannot be marked dispatched" in resp.json()["detail"]


def test_negative_action_item_completed_requires_evidence():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    act_resp = client.get("/api/v1/digital-office/actions?status=IN_PROGRESS", headers=headers)
    # Find an action item that does not currently have evidence
    act = next((a for a in act_resp.json() if not a["evidence_ref"]), act_resp.json()[0])

    resp = client.post(
        f"/api/v1/digital-office/actions/{act['id']}/update",
        headers=headers,
        json={
            "status": "COMPLETED",
            "evidence_ref": None  # Missing evidence!
        }
    )
    assert resp.status_code == 400
    assert "Integrity Constraint: An action item cannot be closed as COMPLETED without attaching compliance evidence" in resp.json()["detail"]
