# TN-HDOS Project-Linked Discussions & Entity Traceability

## 1. Traceability Architecture

In standard communication platforms, discussions are orphaned from the physical assets and administrative records they concern. TN-HDOS binds discussions directly to enterprise entities:
- **Highway Projects**: `related_project_id` binds discussions to state highway records in the master database.
- **Project Packages**: Discussions can be filtered or categorized by individual construction packages.
- **Record Linkage**: Conversations reference administrative entities via `related_record_type` (`PROJECT`, `CONTRACT`, `QUALITY_NCR`, `LAND_PARCEL`, `COURT_CASE`, `INSPECTION`) and `related_record_id`.

---

## 2. Cross-Module Deep-Linking

1. **Project 360° Integration**:
   - The discussion centre panel features an explicit **"Project 360°"** link whenever a project ID is present.
   - Clicking this link opens the complete 360-degree engineering profile of the road/bridge, including physical/financial progress, map coordinates, and contractor performance.
2. **Field Operations & Quality Inspections**:
   - Observations logged by Assistant Engineers during field inspections can spawn a linked discussion thread with the EPC contractor and PMC.
   - Non-Conformance Reports (NCRs) generated in the Quality module attach directly to the corresponding quality working group.
3. **Digital Office File Movement**:
   - Government e-files and office notes can refer to discussion summaries, attaching extracted action directives as formal draft proceedings.

