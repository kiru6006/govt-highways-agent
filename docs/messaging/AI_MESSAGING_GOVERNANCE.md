# TN-HDOS AI Messaging Decision Intelligence & Governance

## 1. Principles of AI Governance

AI in government decision systems must act exclusively as an advisory assistant and decision accelerator—never as an autonomous policy maker:
1. **Human-in-the-Loop Supremacy**: No AI-extracted action item can become an official government directive without explicit confirmation by an authorized official (Minister, Secretary, Chief Engineer, or SE).
2. **Context Grounding**: AI summaries and extractions must be grounded strictly in the messages and attachments of the specific conversation thread.
3. **Traceability & Auditability**: Every generated summary and confirmed action directive records the prompt generation timestamp, confidence score, confirming officer ID, and statutory directive code.

---

## 2. Capabilities of Discussion Intelligence Engine

### 2.1 Continuous Executive Summarization
- Analyzes message traffic and identifies:
  - **Executive Summary**: 2-3 sentence overview of discussion trajectory.
  - **Key Decisions Discussed**: Agreed deadlines, design approvals, or site clearance determinations.
  - **Unresolved Issues & Bottlenecks**: Open obstacles such as pending tree felling permissions, TANGEDCO pole shifts, or slow contractor mobilization.

### 2.2 Action Directive Extraction & Confirmation
- Inspects text for commitments, instructions, and target dates (e.g., "Divisional Engineer to conduct joint inspection with revenue authorities by 15th November").
- Formulates a structured suggestion (`title`, `suggested_assignee`, `suggested_due_date`, `priority`).
- **Confirmation Workflow**:
  - The authorized official reviews the suggested directive in the right panel.
  - Clicks **"Confirm & Schedule Action Directive"**.
  - System generates an official `confirmed_action_code` (e.g. `DIR-2026-MSG-0012`).
  - Registers the action item in the Unified Calendar and Department Task Registry.

