"""
Comprehensive verification test suite for National Material Code Assignment & Cross-Enterprise Consolidation.
Tests all 8 required test cases from SIH prompt.
"""

import pytest
import pandas as pd
from material_standardizer import (
    RawMaterialRecord,
    run_pipeline,
    generate_three_column_catalog,
    generate_unique_national_catalog,
    normalize_type_key,
    normalize_dimension_key,
)


def test_case_1_four_enterprises_same_material():
    """Case 1: Same material across 4 different enterprises -> ONE National Material Code."""
    records = [
        RawMaterialRecord("ONGC", "ONG-001", "SS HEX BOLT M10X50"),
        RawMaterialRecord("BHEL", "BHL-001", "Stainless Steel Hexagonal Bolt M10 × 50 mm"),
        RawMaterialRecord("SAIL", "SAIL-001", "SS Hex Bolt M10 x 50"),
        RawMaterialRecord("NTPC", "NTP-001", "Hex Bolt Stainless Steel M10 50mm"),
    ]
    std_recs, _, _ = run_pipeline(records)
    codes = set(r.Standard_Material_ID for r in std_recs)
    assert len(codes) == 1, f"Expected 1 unique code, got {len(codes)}: {codes}"
    assert std_recs[0].Standard_Material_ID.startswith("NMC-")
    # Verify all 4 records share this exact code
    for r in std_recs:
        assert r.Standard_Material_ID == std_recs[0].Standard_Material_ID


def test_case_2_different_word_order():
    """Case 2: Same material, different word order -> ONE National Material Code."""
    records = [
        RawMaterialRecord("ONGC", "ONG-101", "stainless steel hex bolt m10 x 50 mm"),
        RawMaterialRecord("NTPC", "NTP-101", "hex bolt stainless steel m10 x 50 mm"),
        RawMaterialRecord("BHEL", "BHL-101", "m10 x 50 mm hex bolt stainless steel"),
    ]
    std_recs, _, _ = run_pipeline(records)
    codes = set(r.Standard_Material_ID for r in std_recs)
    assert len(codes) == 1, f"Word order variations produced multiple codes: {codes}"


def test_case_3_different_abbreviations():
    """Case 3: Same material, different abbreviations -> ONE National Material Code."""
    # Test SS vs Stainless Steel, MS vs Mild Steel, GI vs Galvanized Iron, Cu vs Copper
    records = [
        RawMaterialRecord("ONGC", "ONG-201", "MS PIPE 2 INCH"),
        RawMaterialRecord("BHEL", "BHL-201", "Mild Steel Pipe 2 inch"),
        RawMaterialRecord("SAIL", "SAIL-201", "mild stl pipe 2 in"),
        RawMaterialRecord("NTPC", "NTP-201", "M.S. Pipe 2\""),
    ]
    std_recs, _, _ = run_pipeline(records)
    codes = set(r.Standard_Material_ID for r in std_recs)
    assert len(codes) == 1, f"Abbreviation variations produced multiple codes: {codes}"


def test_case_4_different_unit_representations():
    """Case 4: Same material, different unit representation -> ONE National Material Code."""
    records = [
        RawMaterialRecord("ONGC", "ONG-301", "copper cable 4 sq mm"),
        RawMaterialRecord("BHEL", "BHL-301", "copper cable 4 sq.mm"),
        RawMaterialRecord("SAIL", "SAIL-301", "copper wire 4sqmm"),
        RawMaterialRecord("NTPC", "NTP-301", "4 sq mm copper flex cable"),
    ]
    std_recs, _, _ = run_pipeline(records)
    codes = set(r.Standard_Material_ID for r in std_recs)
    assert len(codes) == 1, f"Unit variations produced multiple codes: {codes}"


def test_case_5_different_dimensions():
    """Case 5: Different dimensions -> DIFFERENT National Material Codes."""
    records = [
        RawMaterialRecord("ONGC", "ONG-401", "SS HEX BOLT M10X50 MM"),
        RawMaterialRecord("ONGC", "ONG-402", "SS HEX BOLT M12X50 MM"),
        RawMaterialRecord("GAIL", "GAI-401", "MS PIPE 2 INCH"),
        RawMaterialRecord("GAIL", "GAI-402", "MS PIPE 3 INCH"),
    ]
    std_recs, _, _ = run_pipeline(records)
    codes = [r.Standard_Material_ID for r in std_recs]
    assert codes[0] != codes[1], f"M10x50 and M12x50 should have different codes, got {codes[0]}"
    assert codes[2] != codes[3], f"2 inch and 3 inch pipe should have different codes, got {codes[2]}"


def test_case_6_critical_variants_and_ambiguities():
    """Case 6: Critical variants / special clearances trigger review required."""
    records = [
        RawMaterialRecord("ONGC", "ONG-501", "bearing 6205 skf"),
        RawMaterialRecord("NTPC", "NTP-501", "skf bearing 6205-2rs1/c3"),
    ]
    std_recs, _, reviews = run_pipeline(records)
    # Standard 6205 gets assigned a valid NMC code
    assert std_recs[0].Standard_Material_ID.startswith("NMC-")
    # C3 clearance variant gets flagged for human validation
    assert std_recs[1].Standard_Material_ID == "REVIEW_REQUIRED"
    assert len(reviews) == 1


def test_case_7_and_8_idempotency_and_order_independence():
    """Case 7 & 8: Re-running and re-ordering dataset produces identical, stable codes."""
    batch_1 = [
        RawMaterialRecord("ONGC", "ONG-1001", "SS HEX BOLT M10X50 MM"),
        RawMaterialRecord("BHEL", "BHL-2001", "mild steel pipe 2 inch"),
        RawMaterialRecord("SAIL", "SAIL-3001", "bearing 6205 skf"),
        RawMaterialRecord("NTPC", "NTP-4001", "galvanized iron sheet 2 mm"),
        RawMaterialRecord("IOCL", "IOC-5001", "copper cable 4 sq mm"),
    ]

    # Batch 2 has reversed row order and different enterprise names
    batch_2 = [
        RawMaterialRecord("NTPC", "NTP-4001", "galvanized iron plate 2 mm thick"),
        RawMaterialRecord("IOCL", "IOC-5001", "4 sq mm copper flex cable"),
        RawMaterialRecord("SAIL", "SAIL-3001", "skf bearing nos.6205"),
        RawMaterialRecord("BHEL", "BHL-2001", "mild steel pipe diameter 2 inch"),
        RawMaterialRecord("ONGC", "ONG-1001", "stainless steel hex bolt m10 x 50 mm"),
    ]

    std_1, _, _ = run_pipeline(batch_1)
    std_2, _, _ = run_pipeline(batch_2)

    # Build map of (normalized type, normalized size) -> National Code
    map_1 = {f"{normalize_type_key(r.Extracted_Material_Type)}_{normalize_dimension_key(r.Extracted_Size)}": r.Standard_Material_ID for r in std_1}
    map_2 = {f"{normalize_type_key(r.Extracted_Material_Type)}_{normalize_dimension_key(r.Extracted_Size)}": r.Standard_Material_ID for r in std_2}

    for key, code in map_1.items():
        assert key in map_2, f"Missing key {key} in re-ordered batch"
        assert map_2[key] == code, f"Code changed upon reordering: {code} vs {map_2[key]} for {key}"


def test_sample_20_row_dataset():
    """Verifies the exact 20-row sample dataset produces exactly 5 unique National Material Codes."""
    sample_dataset = [
        RawMaterialRecord("ONGC", "ONG1001", "stainless steel hex bolt m10 x 50 mm"),
        RawMaterialRecord("ONGC", "ONG1002", "mild steel pipe 2 inch"),
        RawMaterialRecord("ONGC", "ONG1003", "bearing 6205 skf"),
        RawMaterialRecord("ONGC", "ONG1004", "galvanized iron sheet 2 mm thickness"),
        RawMaterialRecord("ONGC", "ONG1005", "copper cable 4 sq mm"),
        RawMaterialRecord("BHEL", "BHL2001", "stainless steel hexagonal bolt m10 x 50 mm"),
        RawMaterialRecord("BHEL", "BHL2002", "mild steel pipe diameter 2 inch"),
        RawMaterialRecord("BHEL", "BHL2003", "ball bearing 6205 skf"),
        RawMaterialRecord("BHEL", "BHL2004", "galvanized iron sheet thickness 2 mm"),
        RawMaterialRecord("BHEL", "BHL2005", "copper cable 4 sq mm"),
        RawMaterialRecord("SAIL", "SAIL3001", "stainless steel hex bolt m10 x 50"),
        RawMaterialRecord("SAIL", "SAIL3002", "mild stl pipe 2 inch"),
        RawMaterialRecord("SAIL", "SAIL3003", "bearing nos 6205"),
        RawMaterialRecord("SAIL", "SAIL3004", "galvanized iron sheet 2 mm"),
        RawMaterialRecord("SAIL", "SAIL3005", "copper wire 4 sq mm"),
        RawMaterialRecord("NTPC", "NTP4001", "hex bolt stainless steel m10 x 50"),
        RawMaterialRecord("NTPC", "NTP4002", "mild steel pipe 2 inch diameter"),
        RawMaterialRecord("NTPC", "NTP4003", "skf bearing nos.6205"),
        RawMaterialRecord("NTPC", "NTP4004", "galvanized iron plate 2 mm thick"),
        RawMaterialRecord("NTPC", "NTP4005", "4 sq mm copper flex cable"),
    ]

    std_recs, xref, reviews = run_pipeline(sample_dataset)
    df_3col = generate_three_column_catalog(std_recs)
    df_unique = generate_unique_national_catalog(std_recs)

    # 1. Total records: 20
    assert len(std_recs) == 20
    assert len(df_3col) == 20

    # 2. Total unique National Material Codes: EXACTLY 5
    unique_codes = set(df_3col["National Material Code"])
    assert len(unique_codes) == 5, f"Expected exactly 5 unique national codes, got {len(unique_codes)}: {unique_codes}"
    assert len(df_unique) == 5

    # 3. Verify each group of 4 CPSE items has the same code
    # Bolts: rows 0, 5, 10, 15
    bolt_codes = {df_3col.iloc[i]["National Material Code"] for i in [0, 5, 10, 15]}
    assert len(bolt_codes) == 1, f"Bolts have multiple codes: {bolt_codes}"

    # Pipes: rows 1, 6, 11, 16
    pipe_codes = {df_3col.iloc[i]["National Material Code"] for i in [1, 6, 11, 16]}
    assert len(pipe_codes) == 1, f"Pipes have multiple codes: {pipe_codes}"

    # Bearings: rows 2, 7, 12, 17
    bearing_codes = {df_3col.iloc[i]["National Material Code"] for i in [2, 7, 12, 17]}
    assert len(bearing_codes) == 1, f"Bearings have multiple codes: {bearing_codes}"

    # Sheets: rows 3, 8, 13, 18
    sheet_codes = {df_3col.iloc[i]["National Material Code"] for i in [3, 8, 13, 18]}
    assert len(sheet_codes) == 1, f"Sheets have multiple codes: {sheet_codes}"

    # Cables: rows 4, 9, 14, 19
    cable_codes = {df_3col.iloc[i]["National Material Code"] for i in [4, 9, 14, 19]}
    assert len(cable_codes) == 1, f"Cables have multiple codes: {cable_codes}"

    # 4. No enterprise-specific prefixes
    for code in unique_codes:
        assert not any(cpse in code for cpse in ["ONG", "BHL", "SAIL", "NTP"])
