"""
FastAPI route handlers for Material Standardization text preprocessing endpoints.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status

from app.config.settings import settings
from app.models.schemas import (
    MaterialRequest,
    MaterialResponse,
    CSVProcessResponse,
    AbbreviationDictResponse,
    AbbreviationAddRequest,
    UnitDictResponse,
    HealthResponse,
)
from app.services.preprocessing_service import preprocessing_service
from app.utils.abbreviations import abbreviation_manager
from app.utils.unit_normalizer import unit_normalizer

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check Endpoint",
    description="Returns backend API operational status and metadata.",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.post(
    "/process/material",
    response_model=MaterialResponse,
    summary="Clean and Standardize Single Material Description",
    description=(
        "Processes a single raw material description through the 7-step deterministic "
        "preprocessing pipeline, returning the cleaned string and a full audit trail of changes."
    ),
    tags=["Preprocessing"],
)
async def process_single_material(payload: MaterialRequest) -> MaterialResponse:
    try:
        return preprocessing_service.process(payload.material_description)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing material description: {str(e)}",
        )


@router.post(
    "/process/csv",
    response_model=CSVProcessResponse,
    summary="Batch Clean Material Descriptions via CSV Upload",
    description=(
        "Upload a CSV file containing material records. The engine auto-detects the material "
        "description column, processes every row, preserves all original columns, and adds "
        "'cleaned_description', 'changes_made', and 'processing_status'."
    ),
    tags=["Preprocessing"],
)
async def process_csv_file(
    file: UploadFile = File(..., description="CSV file containing material master records"),
    column_name: Optional[str] = Query(
        None,
        description="Optional custom column name to target for description processing",
    ),
) -> CSVProcessResponse:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a CSV file with a .csv extension.",
        )

    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty.",
            )

        return preprocessing_service.process_csv(
            file_bytes=content,
            filename=file.filename,
            custom_column=column_name,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CSV file: {str(e)}",
        )


@router.get(
    "/abbreviations",
    response_model=AbbreviationDictResponse,
    summary="Get Configured Abbreviation Dictionary",
    description="Returns the currently active industrial abbreviation mapping table.",
    tags=["Configuration"],
)
async def get_abbreviations() -> AbbreviationDictResponse:
    abbr_dict = abbreviation_manager.get_all()
    return AbbreviationDictResponse(
        total_count=len(abbr_dict),
        abbreviations=abbr_dict,
    )


@router.post(
    "/abbreviations",
    response_model=AbbreviationDictResponse,
    summary="Register Custom Abbreviations",
    description="Add new industrial abbreviations or override existing mappings dynamically.",
    tags=["Configuration"],
)
async def add_abbreviations(payload: AbbreviationAddRequest) -> AbbreviationDictResponse:
    abbreviation_manager.add_abbreviations(payload.abbreviations)
    abbr_dict = abbreviation_manager.get_all()
    return AbbreviationDictResponse(
        total_count=len(abbr_dict),
        abbreviations=abbr_dict,
    )


@router.get(
    "/units",
    response_model=UnitDictResponse,
    summary="Get Configured Units Dictionary",
    description="Returns the standard unit mapping lookup table.",
    tags=["Configuration"],
)
async def get_units() -> UnitDictResponse:
    units_dict = unit_normalizer.get_all()
    return UnitDictResponse(
        total_count=len(units_dict),
        units=units_dict,
    )
