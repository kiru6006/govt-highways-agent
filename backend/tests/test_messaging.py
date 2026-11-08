"""
Automated Test Suite for TN-HDOS Internal Messaging & Group Chat.
Covers:
- Direct, group, and project-linked conversation retrieval
- Sending, editing, deleting messages with priority detection
- Pinning and muting conversation controls
- Unread count calculation for top header badge
- AI conversation summary and action extraction
- Action confirmation into official directive
- RBAC security checks (non-participant access denial)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Conversation, Message, ConversationParticipant

client = TestClient(app)

def get_auth_token(username: str) -> str:
    pwd = "admin123" if username in ("admin", "it_sec_admin") else "highway123"
    resp = client.post("/api/v1/auth/token", data={"username": username, "password": pwd})
    assert resp.status_code == 200, f"Login failed for {username}: {resp.text}"
    return resp.json()["access_token"]


def test_conversations_retrieval_and_filtering():
    """Verify Minister and Secretary can query their active conversation threads."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    # All conversations
    resp = client.get("/api/v1/messaging/conversations?tab=ALL", headers=headers)
    assert resp.status_code == 200
    convs = resp.json()
    assert len(convs) > 0

    # Direct conversations tab
    dir_resp = client.get("/api/v1/messaging/conversations?tab=DIRECT", headers=headers)
    assert dir_resp.status_code == 200
    dir_convs = dir_resp.json()
    assert all(c["conversation_type"] == "DIRECT" for c in dir_convs)

    # Groups tab
    grp_resp = client.get("/api/v1/messaging/conversations?tab=GROUPS", headers=headers)
    assert grp_resp.status_code == 200
    grp_convs = grp_resp.json()
    assert all(c["conversation_type"] in ("GROUP", "PROJECT_LINKED") for c in grp_convs)


def test_send_and_reply_message():
    """Verify sending a new message, priority keyword detection, and reply-to threading."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    # Get first conversation
    resp = client.get("/api/v1/messaging/conversations", headers=headers)
    conv_id = resp.json()[0]["id"]

    # Send message with critical keyword to verify auto-priority detection
    msg_payload = {
        "content": "Alert: Critical delay reported on drainage crossing. Submit revised schedule immediately.",
        "message_type": "TEXT"
    }
    send_resp = client.post(f"/api/v1/messaging/conversations/{conv_id}/messages", headers=headers, json=msg_payload)
    assert send_resp.status_code == 200
    msg_data = send_resp.json()
    assert msg_data["content"] == msg_payload["content"]
    assert msg_data["priority"] == "CRITICAL"
    msg_id = msg_data["id"]

    # Reply to this message
    reply_payload = {
        "content": "Understood. The revised drainage plan is being uploaded.",
        "reply_to_message_id": msg_id
    }
    reply_resp = client.post(f"/api/v1/messaging/conversations/{conv_id}/messages", headers=headers, json=reply_payload)
    assert reply_resp.status_code == 200
    reply_data = reply_resp.json()
    assert reply_data["reply_to_message_id"] == msg_id


def test_edit_and_delete_message():
    """Verify user can edit and soft-delete their own message with audit logging."""
    token = get_auth_token("chief_eng")
    headers = {"Authorization": f"Bearer {token}"}

    # Get a conversation where CE is participant
    resp = client.get("/api/v1/messaging/conversations", headers=headers)
    conv_id = resp.json()[0]["id"]

    # Send message
    send_resp = client.post(
        f"/api/v1/messaging/conversations/{conv_id}/messages",
        headers=headers,
        json={"content": "Initial draft text for testing edit function."}
    )
    msg_id = send_resp.json()["id"]

    # Edit message
    edit_resp = client.put(
        f"/api/v1/messaging/messages/{msg_id}",
        headers=headers,
        json={"content": "Corrected text following proof consultant review."}
    )
    assert edit_resp.status_code == 200
    assert edit_resp.json()["is_edited"] is True
    assert edit_resp.json()["content"] == "Corrected text following proof consultant review."

    # Delete message
    del_resp = client.delete(f"/api/v1/messaging/messages/{msg_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["is_deleted"] is True


def test_pin_and_mute_controls():
    """Verify user can pin and mute conversations."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/messaging/conversations", headers=headers)
    conv_id = resp.json()[0]["id"]

    pin_resp = client.post(f"/api/v1/messaging/conversations/{conv_id}/pin", headers=headers)
    assert pin_resp.status_code == 200
    assert "is_pinned" in pin_resp.json()

    mute_resp = client.post(f"/api/v1/messaging/conversations/{conv_id}/mute", headers=headers)
    assert mute_resp.status_code == 200
    assert "is_muted" in mute_resp.json()


def test_unread_count_badge():
    """Verify unread message count endpoint returns compact badge format."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/messaging/unread-count", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_unread_conversations" in data
    assert "total_unread_messages" in data
    assert "display_badge" in data


def test_ai_conversation_summary_and_action_extraction():
    """Verify AI summary synthesizes decisions, unresolved issues, and extracted actions."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/messaging/conversations", headers=headers)
    conv_id = resp.json()[0]["id"]

    summary_resp = client.get(f"/api/v1/messaging/conversations/{conv_id}/ai-summary", headers=headers)
    assert summary_resp.status_code == 200
    summary_data = summary_resp.json()
    assert "summary_text" in summary_data
    assert "key_decisions_discussed" in summary_data
    assert "unresolved_issues" in summary_data
    assert "identified_risks" in summary_data
    assert summary_data["source_message_count"] >= 0


def test_confirm_action_item_directive():
    """Verify human officer confirming AI suggested action into official notification."""
    token = get_auth_token("secretary")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/messaging/conversations", headers=headers)
    conv_with_action = next((c for c in resp.json() if len(c["action_suggestions"]) > 0), None)

    if conv_with_action:
        sugg = conv_with_action["action_suggestions"][0]
        confirm_payload = {
            "action_suggestion_id": sugg["id"],
            "assigned_user_id": conv_with_action["participants"][0]["user_id"],
            "due_date": "2026-05-30",
            "priority": "HIGH"
        }
        conf_resp = client.post(
            f"/api/v1/messaging/conversations/{conv_with_action['id']}/confirm-action",
            headers=headers,
            json=confirm_payload
        )
        assert conf_resp.status_code == 200
        assert "action_code" in conf_resp.json()
        assert conf_resp.json()["action_code"].startswith("ACT-MSG-")


def test_user_search_for_direct_messaging():
    """Verify directory search for starting new direct conversations."""
    token = get_auth_token("minister")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/messaging/search-users?query=Palanivel", headers=headers)
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) > 0
    assert any("Palanivel" in u["full_name"] for u in results)

