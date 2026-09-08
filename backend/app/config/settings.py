"""
Application configuration and global settings.
"""

from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    PROJECT_NAME: str = "SIH Material Standardization Preprocessing Engine"
    PROJECT_DESCRIPTION: str = (
        "Deterministic text preprocessing and data ingestion API for "
        "AI-Driven Standardization and Harmonization of Material Codes Across CPSEs."
    )
    VERSION: str = "1.0.0"
    API_PREFIX: str = ""
    
    # CORS settings to allow local frontend (Next.js) connections
    CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "*"
        ]
    )
    
    # Potential column names to search for material descriptions in uploaded CSVs
    DEFAULT_DESC_COLUMNS: List[str] = Field(
        default_factory=lambda: [
            "material_description",
            "cleaned_description",
            "description",
            "item_description",
            "material_desc",
            "mat_desc",
            "item_desc",
            "item_name",
            "material_name",
            "material",
            "desc",
            "raw_description",
            "text",
            "item"
        ]
    )


settings = Settings()
