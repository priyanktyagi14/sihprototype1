"""
Pydantic schemas for data validation and API serialization.
Includes schemas for Preprocessing, Human-in-the-Loop Reviews, and Audit Logs.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


# =============================================================================
# 1. Preprocessing Engine Schemas
# =============================================================================

class MaterialRequest(BaseModel):
    """Input payload for single material description processing."""
    material_description: str = Field(
        ...,
        description="Raw material master description string to clean and standardize",
        examples=["SS HEX-BOLT M10X50 MM!!!"]
    )


class MaterialResponse(BaseModel):
    """Processed material output with transformation audit trail."""
    raw_description: str = Field(
        ...,
        description="Original raw material description preserved unchanged",
        examples=["SS HEX-BOLT M10X50 MM!!!"]
    )
    cleaned_description: str = Field(
        ...,
        description="Cleaned, normalized, and standardized material description",
        examples=["stainless steel hex bolt m10 x 50 mm"]
    )
    changes: List[str] = Field(
        ...,
        description="Chronological step-by-step audit trail of all transformations applied",
        examples=[
            [
                "Converted text to lowercase",
                "Removed unnecessary special characters",
                "Expanded abbreviation: ss → stainless steel",
                "Standardized dimension formatting: m10x50 → m10 x 50",
                "Normalized measurement unit: MM → mm"
            ]
        ]
    )
    processing_status: str = Field(
        ...,
        description="Processing status: 'success', 'skipped', or 'error'",
        examples=["success"]
    )


class CSVProcessSummary(BaseModel):
    """Summary statistics for batch CSV preprocessing execution."""
    total_rows: int = Field(..., description="Total records in uploaded CSV file")
    processed_rows: int = Field(..., description="Number of rows processed by the pipeline")
    success_count: int = Field(..., description="Number of successfully cleaned records")
    error_count: int = Field(..., description="Number of empty/invalid/failed records")
    detected_description_column: str = Field(
        ...,
        description="Column name identified as the material description"
    )
    processing_time_ms: float = Field(
        ...,
        description="Total execution time for the batch in milliseconds"
    )


class CSVProcessResponse(BaseModel):
    """Batch CSV processing output payload."""
    summary: CSVProcessSummary
    records: List[Dict[str, Any]] = Field(
        ...,
        description="List of all input records with preserved original columns plus cleaned fields"
    )


class AbbreviationDictResponse(BaseModel):
    """Response payload for abbreviation dictionary inspection."""
    total_count: int
    abbreviations: Dict[str, str]


class AbbreviationAddRequest(BaseModel):
    """Payload to register or update custom abbreviations dynamically."""
    abbreviations: Dict[str, str] = Field(
        ...,
        description="Dictionary of abbreviations to their standardized full expansions",
        examples=[{"cs": "carbon steel", "vlv": "valve"}]
    )


class UnitDictResponse(BaseModel):
    """Response payload for unit normalization dictionary."""
    total_count: int
    units: Dict[str, str]


class HealthResponse(BaseModel):
    """Health check payload."""
    status: str = "healthy"
    service: str
    version: str
    timestamp: str


# =============================================================================
# 2. Human-in-the-Loop Review & Validation Schemas
# =============================================================================

class ReviewStatusEnum(str, Enum):
    PENDING_REVIEW = "Pending Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    EDITED = "Edited"


class ReviewStageEnum(str, Enum):
    CLEANING = "cleaning"
    ATTRIBUTE_EXTRACTION = "attribute_extraction"
    MATCHING = "matching"
    UNMC_CODE = "unmc_code"


class ReviewItem(BaseModel):
    """
    Polymorphic review item representing a material record in the validation pipeline.
    Maintains 3 distinct data states: Original Value, AI Proposed Value, and Human Final Value.
    """
    id: str
    material_code: str
    cpse_name: str
    raw_description: str
    original_unit: Optional[str] = None
    specification: Optional[str] = None
    category: Optional[str] = "General"
    sub_category: Optional[str] = None
    
    # AI Proposed State
    proposed_cleaned_description: str
    proposed_cleaned_unit: Optional[str] = None
    proposed_specification: Optional[str] = None
    changes_made: List[str] = []
    confidence_score: float = 95.0
    processing_status: str = "success"
    review_stage: str = "cleaning"
    
    # Human Review Decision & Final Value
    review_status: str = "Pending Review"  # 'Pending Review', 'Approved', 'Rejected', 'Edited'
    reviewer_name: Optional[str] = None
    rejection_reason: Optional[str] = None
    human_edited_description: Optional[str] = None
    human_edited_unit: Optional[str] = None
    human_edited_specification: Optional[str] = None
    edit_notes: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: str
    
    # Extensible payload for AI Matching / Duplicate Detection demonstration
    ai_matching_preview: Optional[Dict[str, Any]] = None


class ReviewListResponse(BaseModel):
    """Paginated or filtered list of review records."""
    total: int
    items: List[ReviewItem]
    counts_by_status: Dict[str, int]


class ReviewApproveRequest(BaseModel):
    """Payload to approve an AI-proposed standardization record."""
    reviewer_name: str = Field(default="Enterprise Reviewer", description="Name of the human auditor")
    notes: Optional[str] = Field(default=None, description="Optional approval notes")


class ReviewRejectRequest(BaseModel):
    """Payload to reject an AI-proposed standardization record."""
    reviewer_name: str = Field(default="Enterprise Reviewer", description="Name of the human auditor")
    rejection_reason: str = Field(..., description="Mandatory or structured reason for rejection")


class ReviewEditRequest(BaseModel):
    """Payload for human manual correction of proposed standardization."""
    reviewer_name: str = Field(default="Enterprise Reviewer", description="Name of the human auditor")
    edited_description: str = Field(..., description="Human-modified final cleaned description")
    edited_unit: Optional[str] = Field(default=None, description="Human-modified unit")
    edited_specification: Optional[str] = Field(default=None, description="Human-modified specification")
    edit_notes: Optional[str] = Field(default=None, description="Notes on why manual edit was needed")


class ReviewBatchActionRequest(BaseModel):
    """Payload for bulk operations on multiple review records."""
    record_ids: List[str] = Field(..., description="List of review record IDs to act upon")
    action: str = Field(..., description="'approve' or 'reject'")
    reviewer_name: str = Field(default="Enterprise Reviewer", description="Name of the human auditor")
    rejection_reason: Optional[str] = Field(default=None, description="Rejection reason if action is 'reject'")


class ReviewDashboardStats(BaseModel):
    """Aggregated statistics for the Review Center Dashboard."""
    pending_count: int
    approved_count: int
    rejected_count: int
    edited_count: int
    total_count: int
    approval_rate: float
    by_cpse: Dict[str, Dict[str, int]]
    recent_activity: List[Dict[str, Any]]


# =============================================================================
# 3. Audit Trail Schemas
# =============================================================================

class AuditLogRecord(BaseModel):
    """Immutable audit event capturing pipeline or human-in-the-loop decisions."""
    id: str
    timestamp: str
    reviewer_name: str
    action: str
    cpse_name: str
    material_code: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    details: str
    status: str = "info"  # 'info', 'success', 'warning', 'error'
    rule_applied: Optional[str] = None


class AuditLogResponse(BaseModel):
    """List of audit events with metadata."""
    total: int
    logs: List[AuditLogRecord]
