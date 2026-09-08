"""
Pydantic schemas for data validation and API serialization.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


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
