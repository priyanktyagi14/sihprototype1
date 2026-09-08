"""
Pytest unit and integration tests for the SIH Material Standardization Preprocessing Engine.
"""

import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.preprocessing_service import PreprocessingService, preprocessing_service
from app.utils.abbreviations import AbbreviationManager
from app.utils.unit_normalizer import UnitNormalizer

client = TestClient(app)


# =============================================================================
# 1. Pipeline Unit Tests
# =============================================================================

def test_example_bolt_transformation():
    """
    Test the exact example provided in the specification:
    Input: "SS HEX-BOLT M10X50 MM!!!"
    Output: "stainless steel hex bolt m10 x 50 mm"
    """
    raw_input = "SS HEX-BOLT M10X50 MM!!!"
    result = preprocessing_service.process(raw_input)

    assert result.raw_description == raw_input
    assert result.cleaned_description == "stainless steel hex bolt m10 x 50 mm"
    assert result.processing_status == "success"
    assert len(result.changes) > 0
    assert any("lowercase" in c.lower() for c in result.changes)
    assert any("special characters" in c.lower() for c in result.changes)
    assert any("expanded abbreviation" in c.lower() and "ss" in c.lower() for c in result.changes)
    assert any("dimension" in c.lower() or "m10 x 50" in c.lower() for c in result.changes)


def test_missing_and_invalid_data():
    """Step 1: Check handling of None, empty strings, and NaN-like values."""
    res_none = preprocessing_service.process(None)
    assert res_none.processing_status == "error"
    assert res_none.cleaned_description == ""

    res_empty = preprocessing_service.process("   ")
    assert res_empty.processing_status == "error"
    assert res_empty.cleaned_description == ""

    res_nan = preprocessing_service.process("nan")
    assert res_nan.processing_status == "error"


def test_abbreviation_word_boundaries():
    """Step 4: Ensure abbreviations do NOT match inside regular words."""
    abbr_mgr = AbbreviationManager()

    # 'ss' should expand in 'ss plate', but NOT in 'brass', 'pass', 'class', 'glass'
    text, changes = abbr_mgr.expand("brass pass class glass ss plate")
    assert "brass" in text
    assert "pass" in text
    assert "class" in text
    assert "glass" in text
    assert "stainless steel plate" in text

    # 'dia' should expand in '50mm dia', but NOT in 'diagram' or 'dial'
    text2, changes2 = abbr_mgr.expand("50mm dia diagram dial")
    assert "diameter" in text2
    assert "diagram" in text2
    assert "dial" in text2


def test_dotted_abbreviation_expansion():
    """Test expansion of dotted abbreviations like s.s., m.s., g.i., brg."""
    result1 = preprocessing_service.process("S.S. FLANGE 50MM")
    assert "stainless steel flange 50 mm" in result1.cleaned_description

    result2 = preprocessing_service.process("M.S. PLATE 25MM")
    assert "mild steel plate 25 mm" in result2.cleaned_description

    result3 = preprocessing_service.process("G.I. PIPE 2 INCH")
    assert "galvanized iron pipe 2 inch" in result3.cleaned_description


def test_dimension_and_unit_standardization():
    """Step 5 & 6: Test dimension operators and unit normalization."""
    test_cases = [
        ("M10X50", "m10 x 50"),
        ("M10*50", "m10 x 50"),
        ("10X50MM", "10 x 50 mm"),
        ("4SQMM", "4 sq mm"),
        ("2MM", "2 mm"),
        ("1/2\"", "1/2 inch"),
        ("2\" 300# FLANGE", "2 inch 300 flange"),
        ("100 MTRS", "100 m"),
        ("50 NOS", "50 nos"),
        ("10 PCS", "10 pcs"),
        ("11 KV", "11 kv"),
    ]

    for raw, expected_substr in test_cases:
        res = preprocessing_service.process(raw)
        assert expected_substr in res.cleaned_description, (
            f"Failed on input '{raw}': expected substring '{expected_substr}', got '{res.cleaned_description}'"
        )


def test_special_characters_cleaning():
    """Step 3: Test removing unwanted symbols without breaking numbers/decimals."""
    res = preprocessing_service.process("PIPE @#$$% 2.5 MM & 100M *** !!!")
    assert "@" not in res.cleaned_description
    assert "#" not in res.cleaned_description
    assert "$" not in res.cleaned_description
    assert "!" not in res.cleaned_description
    assert "2.5 mm" in res.cleaned_description


# =============================================================================
# 2. API Route Integration Tests
# =============================================================================

def test_api_health():
    """GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "service" in data


def test_api_process_single_material():
    """POST /process/material endpoint."""
    payload = {"material_description": "SS HEX-BOLT M10X50 MM!!!"}
    response = client.post("/process/material", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["raw_description"] == "SS HEX-BOLT M10X50 MM!!!"
    assert data["cleaned_description"] == "stainless steel hex bolt m10 x 50 mm"
    assert data["processing_status"] == "success"
    assert isinstance(data["changes"], list)
    assert len(data["changes"]) >= 4


def test_api_get_and_post_abbreviations():
    """GET /abbreviations and POST /abbreviations endpoints."""
    # 1. Get initial dictionary
    response = client.get("/abbreviations")
    assert response.status_code == 200
    data = response.json()
    assert "ss" in data["abbreviations"]
    assert data["abbreviations"]["ss"] == "stainless steel"
    initial_count = data["total_count"]

    # 2. Add custom abbreviation
    custom_payload = {"abbreviations": {"testabbr": "test expansion material"}}
    post_res = client.post("/abbreviations", json=custom_payload)
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["abbreviations"]["testabbr"] == "test expansion material"
    assert post_data["total_count"] == initial_count + 1

    # 3. Test that pipeline now uses newly registered abbreviation
    test_proc = client.post("/process/material", json={"material_description": "TESTABBR ITEM 10MM"})
    assert "test expansion material item 10 mm" in test_proc.json()["cleaned_description"]


def test_api_get_units():
    """GET /units endpoint."""
    response = client.get("/units")
    assert response.status_code == 200
    data = response.json()
    assert "units" in data
    assert data["units"]["mm"] == "mm"
    assert data["units"]["millimeter"] == "mm"
    assert data["units"]["mtr"] == "m"


def test_api_process_csv():
    """POST /process/csv endpoint with multipart form upload."""
    csv_content = (
        "id,material_description,category\n"
        "1,SS HEX-BOLT M10X50 MM!!!,Fasteners\n"
        "2,MS PLT 25MM THK 2500X10000MM,Plates\n"
        "3,,Missing\n"
    )

    files = {"file": ("test_materials.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/process/csv", files=files)

    assert response.status_code == 200
    data = response.json()

    # Check summary
    summary = data["summary"]
    assert summary["total_rows"] == 3
    assert summary["processed_rows"] == 3
    assert summary["success_count"] == 2
    assert summary["error_count"] == 1
    assert summary["detected_description_column"] == "material_description"

    # Check records
    records = data["records"]
    assert len(records) == 3

    # Row 1 check
    assert records[0]["cleaned_description"] == "stainless steel hex bolt m10 x 50 mm"
    assert records[0]["processing_status"] == "success"
    assert records[0]["category"] == "Fasteners"

    # Row 2 check
    assert "mild steel plate 25 mm thickness 2500 x 10000 mm" in records[1]["cleaned_description"]
    assert records[1]["processing_status"] == "success"

    # Row 3 check (empty)
    assert records[2]["processing_status"] == "error"
