# TN-HDOS Messaging Module API Reference

Base Endpoint: `/api/messaging`

## 1. Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/conversations` | Retrieve conversation list with tab & search filters | Yes |
| `POST` | `/conversations` | Create new direct or group conversation | Yes |
| `GET` | `/conversations/{id}` | Retrieve full conversation metadata and participants | Yes |
| `GET` | `/conversations/{id}/messages` | Retrieve paginated message stream with attachments | Yes |
| `POST` | `/conversations/{id}/messages` | Post new message, reply, priority alert, or attachments | Yes |
| `PUT` | `/messages/{id}` | Edit existing message within permitted time window | Yes |
| `DELETE`| `/messages/{id}` | Soft-delete message with audit trail retention | Yes |
| `POST` | `/conversations/{id}/read` | Mark conversation messages as read | Yes |
| `POST` | `/conversations/{id}/pin` | Toggle conversation pin status for current user | Yes |
| `POST` | `/conversations/{id}/mute` | Toggle conversation mute status for current user | Yes |
| `GET` | `/unread-count` | Retrieve global unread counters for application header | Yes |
| `GET` | `/conversations/{id}/ai-summary` | Generate/retrieve AI discussion summary & action suggestions | Yes |
| `POST` | `/conversations/{id}/confirm-action` | Formally confirm and schedule AI action directive | Yes |
| `GET` | `/search-users` | Query verified official user directory for discussions | Yes |

---

## 2. Key Payload Examples

### 2.1 Post Message (`POST /conversations/{id}/messages`)
```json
{
  "content": "Superintending Engineer has issued instructions to expedite sub-base laying on Package 2.",
  "priority": "HIGH",
  "reply_to_message_id": 4,
  "attachments": [
    {
      "file_name": "Sub_Base_Compaction_Test_Report.pdf",
      "file_type": "PDF",
      "file_size_bytes": 204850,
      "storage_path": "/files/Sub_Base_Compaction_Test_Report.pdf"
    }
  ]
}
```

### 2.2 Confirm Action Directive (`POST /conversations/{id}/confirm-action`)
```json
{
  "action_suggestion_id": 3,
  "assigned_user_id": 5,
  "due_date": "2026-11-20",
  "priority": "HIGH"
}
```
**Response (200 OK)**:
```json
{
  "status": "CONFIRMED",
  "directive_code": "DIR-2026-MSG-0003",
  "action_id": 3,
  "scheduled_in_calendar": true,
  "message": "Action suggestion confirmed and scheduled as official directive."
}
```

