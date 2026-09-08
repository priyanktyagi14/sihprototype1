"""
Review and Validation Service for Human-in-the-Loop Governance.
Manages material records, review decisions (Approve, Edit, Reject), and generates immutable audit trails.
Maintains Original Raw Value, AI Proposed Value, and Human Final Value invariant.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import uuid

from app.models.schemas import (
    ReviewItem,
    ReviewStatusEnum,
    ReviewDashboardStats,
    AuditLogRecord,
)


class ReviewService:
    """
    Central review management service supporting deterministic data cleaning reviews,
    future AI attribute extraction validation, and AI material matching deduplication reviews.
    """

    def __init__(self):
        self._reviews: Dict[str, ReviewItem] = {}
        self._audit_logs: List[AuditLogRecord] = []
        self._seed_initial_records()

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _seed_initial_records(self):
        """Seed realistic CPSE industrial benchmark items for instant demonstration."""
        initial_items = [
            {
                "id": "rev-ong-1001",
                "material_code": "ONG-1001",
                "cpse_name": "ONGC",
                "raw_description": "SS HEX-BOLT M10X50 MM!!!",
                "original_unit": "NOS",
                "specification": "Grade A2-70",
                "category": "Fasteners & Hardware",
                "sub_category": "Bolts & Screws",
                "proposed_cleaned_description": "stainless steel hex bolt m10 x 50 mm",
                "proposed_cleaned_unit": "nos",
                "proposed_specification": "Standard Hexagonal Fastener",
                "changes_made": [
                    "Converted text to lowercase",
                    "Removed special characters",
                    "Expanded abbreviation: ss → stainless steel",
                    "Standardized dimension formatting: m10x50 → m10 x 50",
                    "Normalized measurement unit: NOS → nos",
                ],
                "confidence_score": 98.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Pending Review",
                "created_at": self._now_iso(),
                "ai_matching_preview": {
                    "matched_equivalent_code": "BHL-2055",
                    "matched_cpse": "BHEL",
                    "matched_description": "stainless steel hex bolt m10 x 50 mm",
                    "confidence": 94.0,
                    "reasons": [
                        "Semantic similarity: 96%",
                        "Same material: Stainless Steel",
                        "Same dimension: M10 x 50",
                    ],
                },
            },
            {
                "id": "rev-bhl-2004",
                "material_code": "BHL-2004",
                "cpse_name": "BHEL",
                "raw_description": "MS PLT 25MM THK IS 2062 BR 2500X10000MM",
                "original_unit": "MTR",
                "specification": "IS 2062 E250 BR",
                "category": "Structural Steel",
                "sub_category": "Plates",
                "proposed_cleaned_description": "mild steel plate 25 mm thickness is 2062 br 2500 x 10000 mm",
                "proposed_cleaned_unit": "m",
                "proposed_specification": "IS 2062 Structural Plate",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: ms → mild steel",
                    "Expanded abbreviation: plt → plate",
                    "Expanded abbreviation: thk → thickness",
                    "Standardized dimension: 2500x10000mm → 2500 x 10000 mm",
                    "Normalized measurement unit: MTR → m",
                ],
                "confidence_score": 94.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Pending Review",
                "created_at": self._now_iso(),
            },
            {
                "id": "rev-ntp-3011",
                "material_code": "NTP-3011",
                "cpse_name": "NTPC",
                "raw_description": "CS FLG WNRF 150# 4\" SCH 40 ASTM A105",
                "original_unit": "PCS",
                "specification": "ASTM A105",
                "category": "Piping & Fittings",
                "sub_category": "Flanges",
                "proposed_cleaned_description": "carbon steel flange weld neck raised face class 150 4 inch schedule 40 astm a105",
                "proposed_cleaned_unit": "pcs",
                "proposed_specification": "Class 150 WNRF Flange",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: cs → carbon steel",
                    "Expanded abbreviation: flg → flange",
                    "Expanded abbreviation: wnrf → weld neck raised face",
                    "Expanded abbreviation: 150# → class 150",
                    "Standardized dimension: 4\" → 4 inch",
                    "Expanded abbreviation: sch → schedule",
                ],
                "confidence_score": 96.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Pending Review",
                "created_at": self._now_iso(),
            },
            {
                "id": "rev-ioc-4089",
                "material_code": "IOC-4089",
                "cpse_name": "IOCL",
                "raw_description": "BALL VLV 2\" 300# FLGD END BODY A216 WCB TRIM SS316",
                "original_unit": "NOS",
                "specification": "ASME B16.34",
                "category": "Valves & Flow Control",
                "sub_category": "Ball Valves",
                "proposed_cleaned_description": "ball valve 2 inch class 300 flanged end body a216 wcb trim stainless steel 316",
                "proposed_cleaned_unit": "nos",
                "proposed_specification": "Class 300 Flanged Valve",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: vlv → valve",
                    "Standardized dimension: 2\" → 2 inch",
                    "Expanded abbreviation: 300# → class 300",
                    "Expanded abbreviation: flgd → flanged",
                    "Expanded abbreviation: ss316 → stainless steel 316",
                ],
                "confidence_score": 95.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Pending Review",
                "created_at": self._now_iso(),
            },
            {
                "id": "rev-gai-5022",
                "material_code": "GAI-5022",
                "cpse_name": "GAIL",
                "raw_description": "GI PIPE 50MM DIA CL-B CONFORMING TO IS:1239",
                "original_unit": "MTRS",
                "specification": "IS:1239 Class B",
                "category": "Piping Systems",
                "sub_category": "GI Pipes",
                "proposed_cleaned_description": "galvanized iron pipe 50 mm diameter class b conforming to is:1239",
                "proposed_cleaned_unit": "m",
                "proposed_specification": "Galvanized Iron Class B",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: gi → galvanized iron",
                    "Expanded abbreviation: dia → diameter",
                    "Expanded abbreviation: cl-b → class b",
                    "Normalized measurement unit: MTRS → m",
                ],
                "confidence_score": 96.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Approved",
                "reviewer_name": "V. K. Mehta (GAIL Chief Inspector)",
                "reviewed_at": self._now_iso(),
                "created_at": self._now_iso(),
            },
            {
                "id": "rev-sai-6041",
                "material_code": "SAI-6041",
                "cpse_name": "SAIL",
                "raw_description": "CU BUSBAR 50X10MM ELEC GRADE 99.9% PURITY",
                "original_unit": "KGS",
                "specification": "Electrical Grade 99.9%",
                "category": "Electrical",
                "sub_category": "Busbars",
                "proposed_cleaned_description": "copper busbar 50 x 10 mm electrical grade 99.9% purity",
                "proposed_cleaned_unit": "kg",
                "proposed_specification": "99.9% Electrolytic Copper",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: cu → copper",
                    "Expanded abbreviation: elec → electrical",
                    "Standardized dimension: 50x10mm → 50 x 10 mm",
                    "Normalized unit: KGS → kg",
                ],
                "confidence_score": 93.0,
                "processing_status": "Cleaned Successfully",
                "review_stage": "cleaning",
                "review_status": "Edited",
                "reviewer_name": "R. Sengupta (SAIL Materials Manager)",
                "human_edited_description": "electrolytic copper busbar 50 x 10 mm grade etp 99.9% purity is 613",
                "human_edited_unit": "kg",
                "human_edited_specification": "IS 613 ETP Copper Grade",
                "edit_notes": "Added standard IS 613 designation and explicit ETP classification per SAIL tender specs.",
                "reviewed_at": self._now_iso(),
                "created_at": self._now_iso(),
            },
            {
                "id": "rev-ong-8810",
                "material_code": "ONG-8810",
                "cpse_name": "ONGC",
                "raw_description": "UNKNOWN MISC SPARE PART OLD DWG 4022A",
                "original_unit": "NOS",
                "specification": "Unknown",
                "category": "General",
                "sub_category": "Uncategorized",
                "proposed_cleaned_description": "unknown miscellaneous spare part old drawing 4022a",
                "proposed_cleaned_unit": "nos",
                "proposed_specification": "Unspecified OEM Spare",
                "changes_made": [
                    "Converted text to lowercase",
                    "Expanded abbreviation: misc → miscellaneous",
                    "Expanded abbreviation: dwg → drawing",
                ],
                "confidence_score": 42.0,
                "processing_status": "Requires Review",
                "review_stage": "cleaning",
                "review_status": "Rejected",
                "reviewer_name": "A. K. Roy (ONGC Senior Auditor)",
                "rejection_reason": "Insufficient technical specification. Missing material grade and dimensions.",
                "reviewed_at": self._now_iso(),
                "created_at": self._now_iso(),
            },
        ]

        for item in initial_items:
            record = ReviewItem(**item)
            self._reviews[record.id] = record

        # Seed initial audit logs
        self._audit_logs.extend([
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name="System Ingestion Engine",
                action="Material uploaded",
                cpse_name="ONGC",
                material_code="ONG-1001",
                previous_value=None,
                new_value="SS HEX-BOLT M10X50 MM!!!",
                details="Ingested raw material record from ONGC master ERP dump.",
                status="info",
            ),
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name="Deterministic Preprocessing Pipeline",
                action="Automated preprocessing completed",
                cpse_name="ONGC",
                material_code="ONG-1001",
                previous_value="SS HEX-BOLT M10X50 MM!!!",
                new_value="stainless steel hex bolt m10 x 50 mm",
                details="Executed 7-step standardization rules; 5 transformations applied.",
                status="success",
                rule_applied="Rule-EXP-ABBR-01, Rule-UNIT-SI-02",
            ),
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name="V. K. Mehta (GAIL Chief Inspector)",
                action="User approved standardized description",
                cpse_name="GAIL",
                material_code="GAI-5022",
                previous_value="GI PIPE 50MM DIA CL-B CONFORMING TO IS:1239",
                new_value="galvanized iron pipe 50 mm diameter class b conforming to is:1239",
                details="Approved standardization without manual changes.",
                status="success",
            ),
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name="R. Sengupta (SAIL Materials Manager)",
                action="User edited proposed description",
                cpse_name="SAIL",
                material_code="SAI-6041",
                previous_value="copper busbar 50 x 10 mm electrical grade 99.9% purity",
                new_value="electrolytic copper busbar 50 x 10 mm grade etp 99.9% purity is 613",
                details="Manual override: Added IS 613 ETP designation.",
                status="warning",
            ),
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name="A. K. Roy (ONGC Senior Auditor)",
                action="User rejected recommendation",
                cpse_name="ONGC",
                material_code="ONG-8810",
                previous_value="unknown miscellaneous spare part old drawing 4022a",
                new_value="[REJECTED]",
                details="Rejection reason: Insufficient technical specification.",
                status="error",
            ),
        ])

    def list_records(
        self,
        status: Optional[str] = None,
        cpse: Optional[str] = None,
        stage: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Filter review records with multi-facet queries and status counts."""
        items = list(self._reviews.values())

        # Compute summary counts across all items
        counts_by_status = {
            "Pending Review": 0,
            "Approved": 0,
            "Rejected": 0,
            "Edited": 0,
            "Total": len(items),
        }
        for it in items:
            if it.review_status in counts_by_status:
                counts_by_status[it.review_status] += 1

        # Apply Filters
        filtered = items
        if status and status.upper() != "ALL":
            filtered = [i for i in filtered if i.review_status.lower() == status.lower()]

        if cpse and cpse.upper() != "ALL":
            filtered = [i for i in filtered if i.cpse_name.upper() == cpse.upper()]

        if stage and stage.upper() != "ALL":
            filtered = [i for i in filtered if i.review_stage.lower() == stage.lower()]

        if search and search.strip():
            q = search.strip().lower()
            filtered = [
                i for i in filtered
                if q in i.material_code.lower()
                or q in i.raw_description.lower()
                or q in i.proposed_cleaned_description.lower()
                or (i.human_edited_description and q in i.human_edited_description.lower())
                or (i.category and q in i.category.lower())
            ]

        # Sort: Pending first, then by creation date desc
        status_priority = {"Pending Review": 0, "Edited": 1, "Approved": 2, "Rejected": 3}
        filtered.sort(key=lambda x: (status_priority.get(x.review_status, 4), x.created_at), reverse=False)

        return {
            "total": len(filtered),
            "items": filtered,
            "counts_by_status": counts_by_status,
        }

    def get_record(self, record_id: str) -> Optional[ReviewItem]:
        """Retrieve single review item by ID."""
        return self._reviews.get(record_id)

    def approve_record(
        self,
        record_id: str,
        reviewer_name: str = "Enterprise Reviewer",
        notes: Optional[str] = None,
    ) -> ReviewItem:
        """Approve proposed AI standardization."""
        item = self._reviews.get(record_id)
        if not item:
            raise KeyError(f"Review record '{record_id}' not found.")

        item.review_status = "Approved"
        item.reviewer_name = reviewer_name
        item.reviewed_at = self._now_iso()
        if notes:
            item.edit_notes = notes

        # Add Audit Event
        self._audit_logs.insert(
            0,
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name=reviewer_name,
                action="User approved standardized description",
                cpse_name=item.cpse_name,
                material_code=item.material_code,
                previous_value=item.raw_description,
                new_value=item.proposed_cleaned_description,
                details=f"Approved by {reviewer_name}. Proposed standard verified.",
                status="success",
            ),
        )

        return item

    def reject_record(
        self,
        record_id: str,
        reviewer_name: str = "Enterprise Reviewer",
        rejection_reason: str = "Unspecified rejection reason",
    ) -> ReviewItem:
        """Reject proposed AI standardization with mandatory reason."""
        item = self._reviews.get(record_id)
        if not item:
            raise KeyError(f"Review record '{record_id}' not found.")

        item.review_status = "Rejected"
        item.reviewer_name = reviewer_name
        item.rejection_reason = rejection_reason
        item.reviewed_at = self._now_iso()

        # Add Audit Event
        self._audit_logs.insert(
            0,
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name=reviewer_name,
                action="User rejected recommendation",
                cpse_name=item.cpse_name,
                material_code=item.material_code,
                previous_value=item.proposed_cleaned_description,
                new_value="[REJECTED]",
                details=f"Rejected by {reviewer_name}. Reason: {rejection_reason}",
                status="error",
            ),
        )

        return item

    def edit_record(
        self,
        record_id: str,
        reviewer_name: str,
        edited_description: str,
        edited_unit: Optional[str] = None,
        edited_specification: Optional[str] = None,
        edit_notes: Optional[str] = None,
    ) -> ReviewItem:
        """
        Manually edit proposed standardization.
        CRITICAL: Never overwrites original raw value or AI proposed value.
        Preserves original raw data, AI proposal, and human final value separately.
        """
        item = self._reviews.get(record_id)
        if not item:
            raise KeyError(f"Review record '{record_id}' not found.")

        item.review_status = "Edited"
        item.reviewer_name = reviewer_name
        item.human_edited_description = edited_description.strip()
        if edited_unit:
            item.human_edited_unit = edited_unit.strip()
        if edited_specification:
            item.human_edited_specification = edited_specification.strip()
        if edit_notes:
            item.edit_notes = edit_notes.strip()
        item.reviewed_at = self._now_iso()

        # Add Audit Event
        self._audit_logs.insert(
            0,
            AuditLogRecord(
                id=f"audit-{uuid.uuid4().hex[:8]}",
                timestamp=self._now_iso(),
                reviewer_name=reviewer_name,
                action="User edited proposed description",
                cpse_name=item.cpse_name,
                material_code=item.material_code,
                previous_value=item.proposed_cleaned_description,
                new_value=edited_description.strip(),
                details=f"Human override applied by {reviewer_name}. Edit note: {edit_notes or 'Direct manual correction'}",
                status="warning",
            ),
        )

        return item

    def batch_action(
        self,
        record_ids: List[str],
        action: str,
        reviewer_name: str = "Enterprise Reviewer",
        rejection_reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Perform bulk Approve or Reject on multiple records."""
        success_count = 0
        failed_count = 0

        for r_id in record_ids:
            try:
                if action.lower() == "approve":
                    self.approve_record(r_id, reviewer_name)
                    success_count += 1
                elif action.lower() == "reject":
                    self.reject_record(r_id, reviewer_name, rejection_reason or "Batch rejection")
                    success_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1

        return {
            "action": action,
            "total_requested": len(record_ids),
            "success_count": success_count,
            "failed_count": failed_count,
        }

    def get_dashboard_stats(self) -> ReviewDashboardStats:
        """Return metrics and activity aggregations for the Review Center Dashboard."""
        items = list(self._reviews.values())
        pending = sum(1 for i in items if i.review_status == "Pending Review")
        approved = sum(1 for i in items if i.review_status == "Approved")
        rejected = sum(1 for i in items if i.review_status == "Rejected")
        edited = sum(1 for i in items if i.review_status == "Edited")
        total = len(items)

        total_decided = approved + rejected + edited
        approval_rate = round((approved + edited) / total_decided * 100, 1) if total_decided > 0 else 100.0

        by_cpse: Dict[str, Dict[str, int]] = {}
        for it in items:
            cpse = it.cpse_name
            if cpse not in by_cpse:
                by_cpse[cpse] = {"pending": 0, "approved": 0, "rejected": 0, "edited": 0, "total": 0}
            by_cpse[cpse]["total"] += 1
            if it.review_status == "Pending Review":
                by_cpse[cpse]["pending"] += 1
            elif it.review_status == "Approved":
                by_cpse[cpse]["approved"] += 1
            elif it.review_status == "Rejected":
                by_cpse[cpse]["rejected"] += 1
            elif it.review_status == "Edited":
                by_cpse[cpse]["edited"] += 1

        recent_activity = [log.model_dump() for log in self._audit_logs[:8]]

        return ReviewDashboardStats(
            pending_count=pending,
            approved_count=approved,
            rejected_count=rejected,
            edited_count=edited,
            total_count=total,
            approval_rate=approval_rate,
            by_cpse=by_cpse,
            recent_activity=recent_activity,
        )

    def get_audit_logs(
        self,
        limit: int = 50,
        cpse: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[AuditLogRecord]:
        """Fetch chronological immutable audit logs with search & filters."""
        logs = self._audit_logs
        if cpse and cpse.upper() != "ALL":
            logs = [l for l in logs if l.cpse_name.upper() == cpse.upper()]
        if status and status.upper() != "ALL":
            logs = [l for l in logs if l.status.lower() == status.lower()]
        if search and search.strip():
            q = search.strip().lower()
            logs = [
                l for l in logs
                if q in l.action.lower()
                or q in l.material_code.lower()
                or q in l.reviewer_name.lower()
                or q in l.details.lower()
            ]
        return logs[:limit]

    def add_audit_log(self, record: AuditLogRecord) -> AuditLogRecord:
        """Append an audit log event."""
        self._audit_logs.insert(0, record)
        return record


# Global singleton review service
review_service = ReviewService()
