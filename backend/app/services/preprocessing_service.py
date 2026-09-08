"""
Deterministic Preprocessing Service for SIH Material Standardization.
Executes a 7-step traceable pipeline and generates complete transformation audit trails.
"""

import io
import re
import time
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from app.config.settings import settings
from app.models.schemas import (
    MaterialResponse,
    CSVProcessResponse,
    CSVProcessSummary,
)
from app.utils.abbreviations import AbbreviationManager, abbreviation_manager
from app.utils.unit_normalizer import UnitNormalizer, unit_normalizer


class PreprocessingService:
    """
    Core engine for deterministic text normalization, special character sanitization,
    abbreviation expansion, unit standardization, and dimension formatting.
    """

    def __init__(
        self,
        abbr_mgr: Optional[AbbreviationManager] = None,
        unit_norm: Optional[UnitNormalizer] = None,
    ) -> None:
        self.abbr_mgr = abbr_mgr or abbreviation_manager
        self.unit_norm = unit_norm or unit_normalizer

    # -------------------------------------------------------------------------
    # STEP 1: Handle Missing/Invalid Data
    # -------------------------------------------------------------------------
    def step1_validate_input(self, raw_value: Any) -> Tuple[Optional[str], bool, str]:
        """
        Check for null, NaN, or empty string values.
        Returns:
            (safe_str_value, is_valid, raw_str_representation)
        """
        if raw_value is None:
            return None, False, ""

        if isinstance(raw_value, float) and pd.isna(raw_value):
            return None, False, ""

        raw_str = str(raw_value)
        cleaned_str = raw_str.strip()

        if not cleaned_str or cleaned_str.lower() in ["nan", "null", "none", "n/a"]:
            return None, False, raw_str

        return cleaned_str, True, raw_str

    # -------------------------------------------------------------------------
    # STEP 2: Text Normalization (Lowercasing & Basic Spacing)
    # -------------------------------------------------------------------------
    def step2_normalize_text(self, text: str) -> Tuple[str, List[str]]:
        """
        Convert text to lowercase and normalize multiple/irregular spaces.
        """
        changes: List[str] = []
        original = text

        lowercased = text.lower()
        if lowercased != original:
            changes.append("Converted text to lowercase")

        # Normalize multiple spaces and linebreaks into single spaces
        normalized_spacing = re.sub(r"[\t\r\n]+", " ", lowercased)
        normalized_spacing = re.sub(r"\s+", " ", normalized_spacing).strip()

        return normalized_spacing, changes

    # -------------------------------------------------------------------------
    # STEP 3: Special Character Cleaning
    # -------------------------------------------------------------------------
    def step3_clean_special_characters(self, text: str) -> Tuple[str, List[str]]:
        """
        Remove noisy special characters (!, @, #, $, %, ^, &, ~, repeated punctuation),
        while preserving technical tokens (numbers, decimals, dimension operators, inch symbols).
        Also replace hyphens between words with spaces (e.g. hex-bolt -> hex bolt).
        """
        changes: List[str] = []
        original = text

        # 1. Replace word-delimiter hyphens / underscores with space (e.g. hex-bolt -> hex bolt)
        cleaned = re.sub(r"(?<=[a-zA-Z0-9])[\-_](?=[a-zA-Z0-9])", " ", text)
        # Replace slash between words/letters (e.g. nut/bolt -> nut bolt) while preserving numeric fractions (1/2)
        cleaned = re.sub(r"(?<=[a-zA-Z])/(?=[a-zA-Z0-9])|(?<=[a-zA-Z0-9])/(?=[a-zA-Z])", " ", cleaned)

        # 2. Remove noisy punctuation (!, @, #, $, %, ^, &, *, ~, ?, <, >, ;, :, (, ), [, ], {, })
        # Note: we preserve '"' for inch parsing in dimension step, and '.' for decimals/dotted abbreviations
        noisy_chars_pattern = r'[!@#$%^&~?<>;:\(\)\[\]\{\}\|\\`]'
        cleaned = re.sub(noisy_chars_pattern, " ", cleaned)

        # 3. Collapse repeated punctuation (e.g. '....' or '---')
        cleaned = re.sub(r"\.{2,}", " ", cleaned)

        # 4. Collapse spaces
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        if cleaned != original:
            changes.append("Removed unnecessary special characters")

        return cleaned, changes

    # -------------------------------------------------------------------------
    # STEP 4: Abbreviation Expansion
    # -------------------------------------------------------------------------
    def step4_expand_abbreviations(self, text: str) -> Tuple[str, List[str]]:
        """
        Expand industrial shorthand using safe regex word boundary matching.
        """
        return self.abbr_mgr.expand(text)

    # -------------------------------------------------------------------------
    # STEP 5 & 6: Dimension Formatting & Unit Normalization
    # -------------------------------------------------------------------------
    def step5_and_6_format_dimensions_and_units(
        self, text: str, raw_original: str
    ) -> Tuple[str, List[str]]:
        """
        Standardize dimension formatting (m10x50 -> m10 x 50, 4sqmm -> 4 sq mm, 2mm -> 2 mm)
        and normalize measurement units (MM -> mm, MTR -> m, NOS -> nos).
        """
        changes: List[str] = []

        # Format dimensions first
        dim_formatted, dim_changes = self.unit_norm.format_dimensions(text)
        changes.extend(dim_changes)

        # Standardize units
        unit_normalized, unit_changes = self.unit_norm.normalize_units(dim_formatted)
        
        # If uppercase unit was present in original text (e.g., 'MM'), ensure audit trail logs standard notation
        if not unit_changes and re.search(r"\b(MM|MTRS?|INCH|INCHES|NOS|PCS|SQMM|KV|KGS?|GM)\b", raw_original):
            # Check which unit is now present in the normalized string
            for u in ["mm", "m", "inch", "nos", "pcs", "sq mm", "kv", "kg", "g"]:
                if re.search(rf"\b{re.escape(u)}\b", unit_normalized):
                    changes.append(f"Normalized measurement unit: {u.upper()} → {u}")
                    break
        else:
            changes.extend(unit_changes)

        return unit_normalized, changes

    # -------------------------------------------------------------------------
    # STEP 7: Final Whitespace Cleanup
    # -------------------------------------------------------------------------
    def step7_final_whitespace_cleanup(self, text: str) -> Tuple[str, List[str]]:
        """
        Remove any trailing, leading, or consecutive spaces.
        """
        changes: List[str] = []
        original = text
        cleaned = re.sub(r"\s+", " ", text).strip()

        # Remove any lingering standalone quotes if not attached to inches
        cleaned = re.sub(r'(?<!\d)"', '', cleaned).strip()
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        if cleaned != original:
            changes.append("Cleaned extraneous whitespace")

        return cleaned, changes

    # -------------------------------------------------------------------------
    # FULL PIPELINE EXECUTION
    # -------------------------------------------------------------------------
    def process(self, raw_input: Any) -> MaterialResponse:
        """
        Execute the deterministic 7-step pipeline on a single material description.
        """
        # Step 1: Validate input
        valid_text, is_valid, raw_str = self.step1_validate_input(raw_input)
        if not is_valid or valid_text is None:
            return MaterialResponse(
                raw_description=raw_str,
                cleaned_description="",
                changes=["Empty or invalid material description"],
                processing_status="error",
            )

        all_changes: List[str] = []

        # Step 2: Text Normalization
        text, step2_changes = self.step2_normalize_text(valid_text)
        all_changes.extend(step2_changes)

        # Step 3: Special Character Cleaning
        text, step3_changes = self.step3_clean_special_characters(text)
        all_changes.extend(step3_changes)

        # Step 4: Abbreviation Expansion
        text, step4_changes = self.step4_expand_abbreviations(text)
        all_changes.extend(step4_changes)

        # Step 5 & 6: Dimension Formatting & Unit Normalization
        text, step56_changes = self.step5_and_6_format_dimensions_and_units(text, valid_text)
        all_changes.extend(step56_changes)

        # Step 7: Final Whitespace Cleanup
        text, step7_changes = self.step7_final_whitespace_cleanup(text)
        all_changes.extend(step7_changes)

        # Deduplicate changes while preserving chronological order
        unique_changes: List[str] = []
        for c in all_changes:
            if c not in unique_changes:
                unique_changes.append(c)

        return MaterialResponse(
            raw_description=raw_str,
            cleaned_description=text,
            changes=unique_changes,
            processing_status="success",
        )

    # -------------------------------------------------------------------------
    # BATCH CSV PROCESSING
    # -------------------------------------------------------------------------
    def process_csv(
        self,
        file_bytes: bytes,
        filename: str = "upload.csv",
        custom_column: Optional[str] = None,
    ) -> CSVProcessResponse:
        """
        Read CSV bytes with Pandas, auto-detect description column, process every record,
        preserve original columns, and append cleaned fields.
        """
        start_time = time.time()

        # Attempt to decode CSV with UTF-8, fall back to latin-1
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding="latin-1")

        if df.empty:
            return CSVProcessResponse(
                summary=CSVProcessSummary(
                    total_rows=0,
                    processed_rows=0,
                    success_count=0,
                    error_count=0,
                    detected_description_column=custom_column or "none",
                    processing_time_ms=round((time.time() - start_time) * 1000, 2),
                ),
                records=[],
            )

        # Identify target description column
        target_col: Optional[str] = None
        if custom_column and custom_column in df.columns:
            target_col = custom_column
        else:
            # Case-insensitive search through default candidate list
            df_cols_lower = {str(c).strip().lower(): c for c in df.columns}
            for candidate in settings.DEFAULT_DESC_COLUMNS:
                if candidate in df_cols_lower:
                    target_col = df_cols_lower[candidate]
                    break

            # If still not found, check for any column containing 'desc' or 'material'
            if not target_col:
                for col_lower, orig_col in df_cols_lower.items():
                    if "desc" in col_lower or "material" in col_lower or "item" in col_lower:
                        target_col = orig_col
                        break

            # Fallback to first string/object column if available
            if not target_col:
                object_cols = df.select_dtypes(include=["object"]).columns
                if len(object_cols) > 0:
                    target_col = object_cols[0]
                else:
                    target_col = df.columns[0]

        cleaned_descriptions: List[str] = []
        changes_list: List[List[str]] = []
        statuses: List[str] = []

        success_count = 0
        error_count = 0

        for val in df[target_col]:
            res = self.process(val)
            cleaned_descriptions.append(res.cleaned_description)
            changes_list.append(res.changes)
            statuses.append(res.processing_status)

            if res.processing_status == "success":
                success_count += 1
            else:
                error_count += 1

        # Preserve original columns and append new fields
        df["cleaned_description"] = cleaned_descriptions
        df["changes_made"] = changes_list
        df["processing_status"] = statuses

        # Replace NaN values in the dataframe with None for JSON serialization
        records = df.where(pd.notnull(df), None).to_dict(orient="records")

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return CSVProcessResponse(
            summary=CSVProcessSummary(
                total_rows=len(df),
                processed_rows=len(df),
                success_count=success_count,
                error_count=error_count,
                detected_description_column=str(target_col),
                processing_time_ms=elapsed_ms,
            ),
            records=records,
        )


# Global singleton instance
preprocessing_service = PreprocessingService()
