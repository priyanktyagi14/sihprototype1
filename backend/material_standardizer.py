"""
Production-Grade Material Master Data Standardization, Attribute Extraction,
Entity Matching, Cross-Enterprise Consolidation, and Canonical Cataloging Engine.
Designed for Multi-CPSE Master Data Management (MDM).
Supports batch CSV, Excel, and DataFrame standardization on arbitrary datasets.
"""

import os
import re
import argparse
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, asdict
import pandas as pd


# ==============================================================================
# 1. INDUSTRIAL DICTIONARIES & TAXONOMY LOOKUPS
# ==============================================================================

MATERIAL_SYNONYMS = {
    r"\bss\b|\bs\.s\.?\b|\bstainless\s+steel\b": "Stainless Steel",
    r"\bms\b|\bm\.s\.?\b|\bmild\s+steel\b|\bmild\s+stl\b": "Mild Steel",
    r"\bgi\b|\bg\.i\.?\b|\bgalvanized\s+iron\b|\bgalvanised\s+iron\b": "Galvanized Iron",
    r"\bcu\b|\bcopper\b|\belectrolytic\s+copper\b": "Copper",
    r"\bcs\b|\bc\.s\.?\b|\bcarbon\s+steel\b|\bwcb\b|\ba216\s*wcb\b|\ba105\b": "Carbon Steel",
    r"\bci\b|\bc\.i\.?\b|\bcast\s+iron\b": "Cast Iron",
    r"\bal\b|\baluminium\b|\baluminum\b": "Aluminium",
    r"\bbrass\b": "Brass",
    r"\bbronze\b": "Bronze",
    r"\bptfe\b|\bteflon\b": "PTFE",
    r"\bxlpe\b": "XLPE",
    r"\bpvc\b": "PVC",
}

TYPE_SYNONYMS = {
    r"\bhex(?:agonal)?\.?(?:\s+head)?[\s\-_]*bolt\b": "Hexagonal Bolt",
    r"\bhex(?:agonal)?\.?(?:\s+head)?[\s\-_]*nut\b": "Hexagonal Nut",
    r"\bstud[\s\-_]*bolt\b": "Stud Bolt",
    r"\bbolt\b": "Bolt",
    r"\bnut\b": "Nut",
    r"\bspiral\s+wound(?:\s+gasket)?\b": "Spiral Wound Gasket",
    r"\bwnrf(?:\s+flange)?\b|\bweld\s+neck\s+raised\s+face\s+flange\b": "Weld Neck Raised Face Flange",
    r"\bflg\b|\bflange\b": "Flange",
    r"\bpipe\b": "Pipe",
    r"\btube\b": "Tube",
    r"\bplt\b|\bplate\b": "Plate",
    r"\bsht\b|\bsheet\b": "Sheet",
    r"\bdeep\s+groove\s+ball\s+(?:brg|bearing)\b": "Deep Groove Ball Bearing",
    r"\bball\s+(?:brg|bearing)\b": "Ball Bearing",
    r"\broller\s+(?:brg|bearing)\b": "Roller Bearing",
    r"\b(?:skf\s+)?(?:brg|bearing)(?:\s+nos?\.?)?\b": "Bearing",
    r"\bball\s+(?:vlv|valve)\b": "Ball Valve",
    r"\bgate\s+(?:vlv|valve)\b": "Gate Valve",
    r"\bglobe\s+(?:vlv|valve)\b": "Globe Valve",
    r"\bvlv\b|\bvalve\b": "Valve",
    r"\bgasket\b": "Gasket",
    r"\bbusbar\b|\bbus\s+bar\b": "Busbar",
    r"\b(?:flex\s+)?cable\b|\bwire\b": "Cable",
}

CATEGORY_CODE_MAP = {
    "Hexagonal Bolt": "BOLT",
    "Hexagonal Nut": "NUT",
    "Stud Bolt": "BOLT",
    "Bolt": "BOLT",
    "Nut": "NUT",
    "Pipe": "PIPE",
    "Tube": "TUBE",
    "Plate": "SHT",
    "Sheet": "SHT",
    "Deep Groove Ball Bearing": "BEAR",
    "Ball Bearing": "BEAR",
    "Roller Bearing": "BEAR",
    "Bearing": "BEAR",
    "Ball Valve": "VLV",
    "Gate Valve": "VLV",
    "Globe Valve": "VLV",
    "Valve": "VLV",
    "Flange": "FLG",
    "Weld Neck Raised Face Flange": "FLG",
    "Gasket": "GSK",
    "Spiral Wound Gasket": "GSK",
    "Cable": "CABL",
    "Busbar": "BUS",
}


# ==============================================================================
# 2. DATA STRUCTURES
# ==============================================================================

@dataclass
class RawMaterialRecord:
    cpse_name: str
    material_code: str
    material_description: str
    specification: str = ""

@dataclass
class StandardizedMaterialRecord:
    CPSE_Name: str
    Original_Material_Code: str
    Original_Description: str
    Specification: str
    Normalized_Description: str
    Extracted_Material_Type: str
    Extracted_Material: str
    Extracted_Grade: str
    Extracted_Size: str
    Extracted_Specification: str
    Standard_Material_ID: str = ""
    Standardized_Material_Description: str = ""
    Match_Confidence: str = ""
    Match_Score: float = 0.0
    Match_Reason: str = ""
    Equivalence_Group_ID: str = ""


# ==============================================================================
# 3. NORMALIZATION & ATTRIBUTE EXTRACTION ENGINE
# ==============================================================================

def get_canonical_bearing_type(raw_type: str, brg_no: str) -> str:
    """Classifies ISO standard bearing series to canonical engineering types."""
    if brg_no.startswith(("60", "62", "63", "64", "68", "69", "160")):
        return "Deep Groove Ball Bearing"
    elif brg_no.startswith(("72", "73", "74")):
        return "Angular Contact Ball Bearing"
    elif brg_no.startswith(("213", "222", "223", "230", "231", "232")):
        return "Spherical Roller Bearing"
    elif brg_no.startswith(("302", "303", "313", "320", "322", "323")):
        return "Tapered Roller Bearing"
    elif brg_no.startswith(("NU", "NJ", "NUP", "N")):
        return "Cylindrical Roller Bearing"
    return raw_type or "Bearing"


class MaterialEngine:
    def normalize_text(self, text: str) -> str:
        if not text or pd.isna(text):
            return ""
        s = str(text).strip()
        
        # 0. Replace unicode multiplication symbols
        s = s.replace("×", " x ").replace("✕", " x ").replace("✖", " x ").replace("·", " ")

        # 1. Expand dotted abbreviations early before symbol stripping
        s = re.sub(r"\bS\.S\.?\b", "SS", s, flags=re.IGNORECASE)
        s = re.sub(r"\bM\.S\.?\b", "MS", s, flags=re.IGNORECASE)
        s = re.sub(r"\bG\.I\.?\b", "GI", s, flags=re.IGNORECASE)
        s = re.sub(r"\bHEX\.\b", "HEX", s, flags=re.IGNORECASE)
        s = re.sub(r"\bBRG\.\b|\bBRG\b", "BEARING", s, flags=re.IGNORECASE)
        s = re.sub(r"\bVLV\.\b|\bVLV\b", "VALVE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bFLG\.\b|\bFLG\b", "FLANGE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bPLT\.\b|\bPLT\b", "PLATE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bSHT\.\b|\bSHT\b", "SHEET", s, flags=re.IGNORECASE)
        s = re.sub(r"\bSTL\b", "STEEL", s, flags=re.IGNORECASE)
        s = re.sub(r"\bNOS?\.?\s*(\d+)", r"NOS \1", s, flags=re.IGNORECASE)

        # 2. Standardize Cable sizing: 4 CORE 4SQMM, 4C X 4 SQ MM -> 4 Core x 4 sq mm
        s = re.sub(r"\b(\d+)\s*[cC](?:ore)?\s*[*xX]?\s*(\d+(?:\.\d+)?)\s*(?:sqmm|sq\.mm|sq\s*mm)\b", r"\1 Core x \2 sq mm", s, flags=re.IGNORECASE)
        s = re.sub(r"\b1100\s*v\b|\b1\.1\s*kv\b", "1.1 kV", s, flags=re.IGNORECASE)

        # 3. Standardize Pressure Class: 150#, 150 lbs, class 150, 150 LBS -> Class 150
        s = re.sub(r"\b(\d+)\s*#", r"Class \1", s)
        s = re.sub(r"\b(\d+)\s*(?:lbs|lb)\b", r"Class \1", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(?:class|cl)\s*(\d+)\b", r"Class \1", s, flags=re.IGNORECASE)

        # 4. Standardize dimensional notations: e.g. M10X50 -> M10 x 50, M12X1.75 -> M12 x 1.75
        s = re.sub(r"\b(M\d+(?:\.\d+)?)\s*[*xX]\s*(\d+(?:\.\d+)?)", r"\1 x \2", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(M\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*mm\b", r"\1 x \2 mm", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(M\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\b", r"\1 x \2", s, flags=re.IGNORECASE)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*\"", r"\1 inch", s)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*''", r"\1 inch", s)
        s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(?:in|inch|inches)\b", r"\1 inch", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(?:mm)\b", r"\1 mm", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(\d+(?:\.\d+)?)\s*(?:sqmm|sq\.mm|mm2|mm²)\b", r"\1 sq mm", s, flags=re.IGNORECASE)
        
        # 5. Clean unnecessary punctuation, preserve hyphens in grades, slashes, periods in numbers
        s = re.sub(r"[!@$%^~_+=<>?]+", " ", s)
        s = re.sub(r"\s+", " ", s)
        
        # 6. Expand common industrial abbreviations
        for pattern, repl in MATERIAL_SYNONYMS.items():
            s = re.sub(pattern, repl, s, flags=re.IGNORECASE)
        
        s = re.sub(r"\bthk\b|\bthickness\b|\bthick\b", "Thickness", s, flags=re.IGNORECASE)
        s = re.sub(r"\bdia\b|\bdiameter\b", "Diameter", s, flags=re.IGNORECASE)
        
        return re.sub(r"\s+", " ", s).strip()

    def extract_attributes(self, norm_desc: str, spec: str = "") -> Dict[str, str]:
        full_text = f"{norm_desc} {spec}".strip()
        attrs = {
            "material_type": "",
            "material": "",
            "grade": "",
            "size": "",
            "specification": "",
            "bearing_no": "",
            "pressure_rating": "",
            "manufacturer": "",
        }

        # 1. Manufacturer
        mfg_match = re.search(r"\b(SKF|FAG|TIMKEN|NTN|KOYO)\b", full_text, re.IGNORECASE)
        if mfg_match:
            attrs["manufacturer"] = mfg_match.group(1).upper()

        # 2. Bearing Number & Canonical Bearing Type
        brg_match = re.search(r"\b(?:NO\.?\s*|NOS\.?\s*|BRG[\.\-_\s]*|BEARING[\.\-_\s]*|SKF\s*)?(\d{4,5}(?:-[A-Z0-9/]+)?)\b", full_text, re.IGNORECASE)
        is_bearing_context = (
            re.search(r"\b(bearing|brg|ball bearing|roller bearing)\b", full_text, re.IGNORECASE) is not None
            or (brg_match and int(brg_match.group(1).split("-")[0][:2]) in [60, 62, 63, 64, 68, 69, 72, 73, 74, 16, 21, 22, 23, 30, 31, 32])
        )
        
        if is_bearing_context and brg_match:
            attrs["bearing_no"] = brg_match.group(1).upper()
            attrs["size"] = f"Bearing No. {attrs['bearing_no']}"
            attrs["material_type"] = get_canonical_bearing_type("Deep Groove Ball Bearing", attrs["bearing_no"])
            attrs["material"] = "High Carbon Chromium Steel"

        # 3. Material Type (if not already set as bearing)
        if not attrs["material_type"]:
            for pattern, canonical_type in TYPE_SYNONYMS.items():
                if re.search(pattern, full_text, re.IGNORECASE):
                    attrs["material_type"] = canonical_type
                    break
        
        # 4. Material
        if not attrs["material"]:
            for pattern, canonical_mat in MATERIAL_SYNONYMS.items():
                if re.search(pattern, full_text, re.IGNORECASE):
                    attrs["material"] = canonical_mat
                    break
        if not attrs["material"]:
            if re.search(r"\bstainless\s+steel\b|\bss316\b|\bss304\b|\bss\b", full_text, re.IGNORECASE):
                attrs["material"] = "Stainless Steel"
            elif re.search(r"\bmild\s+steel\b|\bmild\s+stl\b|\bms\b", full_text, re.IGNORECASE):
                attrs["material"] = "Mild Steel"
            elif re.search(r"\bgalvanized\s+iron\b|\bgi\b", full_text, re.IGNORECASE):
                attrs["material"] = "Galvanized Iron"
            elif re.search(r"\bcopper\b|\bcu\b", full_text, re.IGNORECASE):
                attrs["material"] = "Copper"
            elif re.search(r"\bcarbon\s+steel\b|\bwcb\b|\ba105\b|\bcs\b", full_text, re.IGNORECASE):
                attrs["material"] = "Carbon Steel"

        # 5. Pressure Rating
        p_class = re.search(r"\b(Class\s*\d+)\b", full_text, re.IGNORECASE)
        if p_class:
            attrs["pressure_rating"] = p_class.group(1).capitalize()

        # 6. Grade
        grade_patterns = [
            r"\b(IS\s*2062(?:\s+[A-Z0-9]+)?)\b",
            r"\b(IS\s*1239(?:\s+[A-Z0-9]+)?)\b",
            r"\b(IS\s*1364(?:\s+[A-Z0-9]+)?)\b",
            r"\b(IS\s*613(?:\s+[A-Z0-9]+)?)\b",
            r"\b(IS\s*277(?:\s+[A-Z0-9]+)?)\b",
            r"\b(IS\s*7098(?:\s+[A-Z0-9]+)?)\b",
            r"\b(ASTM\s+A\d+(?:\s+[A-Z0-9]+)?)\b",
            r"\b(A105|A216\s+WCB|WCB)\b",
            r"\b(A2-70|A4-80|A2-50|8\.8|10\.9)\b",
            r"\b(SS\s*316L?|SS\s*304L?|316L?|304L?)\b",
            r"\b(ETP|ELECTROLYTIC)\b",
            r"\b(Class\s+[A-C]|CL-[A-C])\b",
        ]
        grades_found = []
        for gp in grade_patterns:
            m = re.search(gp, full_text, re.IGNORECASE)
            if m:
                grades_found.append(m.group(1).upper().strip())
        if grades_found:
            seen = set()
            dedup_grades = []
            for g in grades_found:
                if g not in seen:
                    seen.add(g)
                    dedup_grades.append(g)
            attrs["grade"] = " / ".join(dedup_grades)

        # 7. Size / Dimension (if not bearing)
        if not attrs["bearing_no"]:
            m_cable = re.search(r"\b(\d+\s*Core\s*x\s*\d+(?:\.\d+)?\s*sq\s*mm)\b", full_text, re.IGNORECASE)
            m_single_cable = re.search(r"\b(\d+(?:\.\d+)?\s*sq\s*mm)\b", full_text, re.IGNORECASE)
            m_thread = re.search(r"\b(M\d+(?:\.\d+)?)\s*(?:x|\*|\s)\s*(\d+(?:\.\d+)?(?:\s*mm)?)\b", full_text, re.IGNORECASE)
            dim_mult = re.search(r"\b(\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?(?:\s*x\s*\d+(?:\.\d+)?)?\s*mm)\b", full_text, re.IGNORECASE)
            inch_size = re.search(r"\b((?:\d+\/\d+|\d+(?:\.\d+)?)\s*inch)\b", full_text, re.IGNORECASE)
            thk_size = re.search(r"\b(\d+(?:\.\d+)?\s*mm(?:\s*(?:Thickness|thick|thk))?)\b", full_text, re.IGNORECASE)
            m_single = re.search(r"\b(M\d+(?:\.\d+)?)\b", full_text, re.IGNORECASE)

            if m_cable:
                attrs["size"] = m_cable.group(1)
            elif m_single_cable:
                attrs["size"] = m_single_cable.group(1)
            elif m_thread:
                sz_m = m_thread.group(1).upper()
                sz_len = m_thread.group(2).lower()
                if not sz_len.endswith("mm"):
                    sz_len = f"{sz_len} mm"
                attrs["size"] = f"{sz_m} x {sz_len}".strip()
            elif dim_mult:
                attrs["size"] = dim_mult.group(1).lower()
            elif inch_size:
                attrs["size"] = inch_size.group(1).lower()
            elif thk_size:
                sz = thk_size.group(1)
                sz = re.sub(r"\s*(?:thickness|thick|thk)", "", sz, flags=re.IGNORECASE).strip()
                attrs["size"] = sz
            elif m_single:
                attrs["size"] = m_single.group(1)

        # 8. Additional Specifications
        specs = []
        if attrs["pressure_rating"]:
            specs.append(attrs["pressure_rating"])
        p_sch = re.search(r"\b(SCH(?:EDULE)?\s*\d+[A-Z]?)\b", full_text, re.IGNORECASE)
        if p_sch:
            specs.append(p_sch.group(1).upper())
        p_volt = re.search(r"\b(\d+(?:\.\d+)?\s*kV)\b", full_text, re.IGNORECASE)
        if p_volt:
            specs.append(p_volt.group(1))
        p_purity = re.search(r"\b(\d+(?:\.\d+)?%\s*(?:Cu|Purity)?)\b", full_text, re.IGNORECASE)
        if p_purity:
            specs.append(p_purity.group(1).strip())
        if attrs["manufacturer"]:
            specs.append(f"Make: {attrs['manufacturer']}")

        if specs:
            attrs["specification"] = " | ".join(specs)
        elif spec:
            attrs["specification"] = spec.strip()

        return attrs

    def generate_canonical_description(self, attrs: Dict[str, str]) -> str:
        mat = attrs.get("material", "").strip()
        m_type = attrs.get("material_type", "").strip()
        mfg = attrs.get("manufacturer", "").strip()
        brg_no = attrs.get("bearing_no", "").strip()
        size = attrs.get("size", "").strip()
        grade = attrs.get("grade", "").strip()
        spec = attrs.get("specification", "").strip()

        if brg_no:
            desc = f"{m_type} {brg_no}".strip()
            if mfg:
                desc = f"{mfg} {desc}"
            if spec and f"Make: {mfg}" not in spec:
                desc += f" ({spec})"
            return desc

        parts = []
        if mat:
            parts.append(mat)
        if m_type:
            parts.append(m_type)
        if size:
            parts.append(size)
        if grade:
            parts.append(f"Grade {grade}")
        if spec:
            clean_spec = " | ".join([s for s in spec.split(" | ") if s not in grade])
            if clean_spec:
                parts.append(f"({clean_spec})")

        desc = " ".join(parts).strip()
        desc = re.sub(r"\s+", " ", desc)
        return desc if desc else "Unclassified Material"


# ==============================================================================
# 4. MULTI-TIER ENTITY MATCHING & GROUPING
# ==============================================================================

def normalize_dimension_key(size_str: str) -> str:
    """Normalizes size strings for deterministic invariant comparison."""
    if not size_str:
        return ""
    s = size_str.lower().strip()
    s = s.replace("diameter", "").replace("dia", "").replace("thickness", "").replace("thk", "").replace("thick", "").strip()
    s = re.sub(r"(\d+)\.0+\b", r"\1", s)
    s = s.replace("*", "x")
    s = re.sub(r"\s*x\s*", "x", s)
    s = re.sub(r"\bmm\b", "", s)
    s = re.sub(r"\binch(?:es)?\b|\bin\b|\"", "inch", s)
    s = re.sub(r"\s+", "", s)
    return s

def normalize_type_key(type_str: str) -> str:
    if not type_str:
        return "UNKNOWN"
    t = type_str.lower().replace(" ", "").replace("_", "")
    if t in ["sheet", "plate", "sht", "plt"]:
        return "sheetplate"
    if t in ["cable", "wire", "flexcable", "coppercable", "copperwire"]:
        return "cable"
    if "bearing" in t:
        return "bearing"
    return t

def normalize_material_key(mat_str: str) -> str:
    if not mat_str:
        return "UNKNOWN"
    m = mat_str.lower().replace(" ", "").replace("_", "")
    if m in ["stainlesssteel", "ss", "ss304", "ss316"]:
        return "stainlesssteel"
    if m in ["mildsteel", "ms", "mildstl"]:
        return "mildsteel"
    if m in ["galvanizediron", "gi", "galvanisediron"]:
        return "galvanizediron"
    if m in ["copper", "cu"]:
        return "copper"
    if m in ["carbonsteel", "cs"]:
        return "carbonsteel"
    return m

def normalize_rating_key(rating_str: str) -> str:
    if not rating_str:
        return ""
    return rating_str.lower().replace(" ", "")

def compute_record_match(rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Tuple[float, str, str]:
    type_a = normalize_type_key(rec_a["extracted_material_type"])
    type_b = normalize_type_key(rec_b["extracted_material_type"])
    
    mat_a = normalize_material_key(rec_a["extracted_material"])
    mat_b = normalize_material_key(rec_b["extracted_material"])
    
    size_a = normalize_dimension_key(rec_a["extracted_size"])
    size_b = normalize_dimension_key(rec_b["extracted_size"])

    rate_a = normalize_rating_key(rec_a["attrs"].get("pressure_rating", ""))
    rate_b = normalize_rating_key(rec_b["attrs"].get("pressure_rating", ""))

    # Hard Invariant 1: Type mismatch
    if type_a != type_b and type_a != "UNKNOWN" and type_b != "UNKNOWN":
        return 0.0, "LOW", f"Incompatible material types: '{rec_a['extracted_material_type']}' vs '{rec_b['extracted_material_type']}'"

    # Hard Invariant 2: Dimension mismatch (CRITICAL RULE)
    if size_a and size_b and size_a != size_b:
        return 0.0, "LOW", f"Dimension mismatch prevents merge: '{rec_a['extracted_size']}' vs '{rec_b['extracted_size']}'"

    # Hard Invariant 3: Pressure Rating mismatch for pressure retaining equipment
    if rate_a and rate_b and rate_a != rate_b:
        return 0.0, "LOW", f"Pressure class mismatch prevents merge: '{rec_a['attrs']['pressure_rating']}' vs '{rec_b['attrs']['pressure_rating']}'"

    # Bearing specific model
    brg_a = rec_a.get("extracted_bearing_no", "")
    brg_b = rec_b.get("extracted_bearing_no", "")
    if brg_a and brg_b and brg_a != brg_b:
        return 0.0, "LOW", f"Bearing number mismatch: {brg_a} vs {brg_b}"

    # Ambiguity check
    if not size_a and not size_b and not brg_a and not brg_b:
        return 50.0, "REVIEW_REQUIRED", "Insufficient dimensional data for deterministic physical equivalence"

    # Check Material
    if mat_a and mat_b and mat_a != mat_b:
        return 10.0, "LOW", f"Metallurgical base mismatch: '{rec_a['extracted_material']}' vs '{rec_b['extracted_material']}'"

    # Score calculation
    score = 98.0
    tokens_a = set(rec_a["normalized_description"].lower().split())
    tokens_b = set(rec_b["normalized_description"].lower().split())
    overlap = len(tokens_a & tokens_b) / max(len(tokens_a | tokens_b), 1)
    score += min(2.0, overlap * 2.0)

    confidence = "HIGH" if score >= 90.0 else "MEDIUM"
    reason = f"Exact physical match on Material Type ({rec_a['extracted_material_type']}), Material ({rec_a['extracted_material']}), and Dimension ({rec_a['extracted_size']})"
    return round(score, 1), confidence, reason


# ==============================================================================
# 5. PIPELINE EXECUTION & CROSS-ENTERPRISE GROUPING
# ==============================================================================

def run_pipeline(
    raw_records: List[RawMaterialRecord],
    code_format: str = "sequential"  # 'sequential' (NMC-000001) or 'categorized' (NMC-BOLT-00001)
) -> Tuple[List[StandardizedMaterialRecord], List[Dict[str, Any]], List[Dict[str, Any]]]:
    engine = MaterialEngine()
    processed_records = []

    # Step 1 & 2: Normalize and extract attributes
    for r in raw_records:
        norm = engine.normalize_text(r.material_description)
        attrs = engine.extract_attributes(norm, r.specification)
        canon_desc = engine.generate_canonical_description(attrs)
        
        is_ambiguous = False
        review_reason = ""
        
        if not attrs["material_type"] or attrs["material_type"] == "UNKNOWN":
            is_ambiguous = True
            review_reason = "Missing or unidentifiable material type"
        elif not attrs["size"] and attrs["material_type"] in ["Hexagonal Bolt", "Hexagonal Nut", "Pipe", "Flange", "Plate", "Sheet", "Valve"]:
            is_ambiguous = True
            review_reason = f"Missing critical dimension/size for {attrs['material_type']}"
        elif attrs["material_type"] in ["Flange", "Weld Neck Raised Face Flange"] and not attrs.get("pressure_rating"):
            is_ambiguous = True
            review_reason = "Missing mandatory pressure class rating (e.g. Class 150, Class 300) for Flange"
        elif attrs.get("bearing_no") and ("-2rs" in attrs["bearing_no"].lower() or "/c3" in attrs["bearing_no"].lower()):
            is_ambiguous = True
            review_reason = f"Bearing has specialized clearance/seal suffix ({attrs['bearing_no']}) requiring engineering validation"
        elif "unknown" in r.material_description.lower() or "misc" in r.material_description.lower():
            is_ambiguous = True
            review_reason = "Vague legacy description without engineering specifications"

        processed_records.append({
            "raw": r,
            "norm": norm,
            "attrs": attrs,
            "canon_desc": canon_desc,
            "is_ambiguous": is_ambiguous,
            "review_reason": review_reason,
            "extracted_bearing_no": attrs.get("bearing_no", ""),
            "normalized_description": norm,
            "extracted_material_type": attrs["material_type"],
            "extracted_material": attrs["material"],
            "extracted_size": attrs["size"],
        })

    # Step 3 & 4: Clustering & Canonical Key Construction
    groups: Dict[Tuple, List[int]] = {}
    ambiguous_indices: List[int] = []

    for idx, item in enumerate(processed_records):
        if item["is_ambiguous"]:
            ambiguous_indices.append(idx)
            continue
        
        type_key = normalize_type_key(item["attrs"]["material_type"])
        mat_key = normalize_material_key(item["attrs"]["material"])
        size_key = normalize_dimension_key(item["attrs"]["size"])
        rate_key = normalize_rating_key(item["attrs"].get("pressure_rating", ""))
        
        # For bearings, group by (bearing_series, bearing_no)
        if item["attrs"]["bearing_no"]:
            key = ("bearing", item["attrs"]["bearing_no"].lower())
        # For pressure equipment, group by (type_key, mat_key, size_key, rate_key)
        elif item["attrs"]["material_type"] in ["Ball Valve", "Gate Valve", "Globe Valve", "Valve", "Flange", "Weld Neck Raised Face Flange", "Gasket", "Spiral Wound Gasket"]:
            key = (type_key, mat_key, size_key, rate_key)
        else:
            key = (type_key, mat_key, size_key)

        groups.setdefault(key, []).append(idx)

    # Deterministic sorting of cluster keys so row order doesn't change assigned codes
    sorted_group_keys = sorted(groups.keys(), key=lambda k: str(k))

    standardized_results: List[StandardizedMaterialRecord] = [None] * len(processed_records)  # type: ignore
    cross_reference_rows: List[Dict[str, Any]] = []
    review_required_rows: List[Dict[str, Any]] = []

    # Assign IDs to valid grouped clusters
    for group_num, key in enumerate(sorted_group_keys, start=1):
        indices = groups[key]
        first_item = processed_records[indices[0]]
        m_type = first_item["attrs"].get("material_type", "")
        cat_prefix = CATEGORY_CODE_MAP.get(m_type, "MAT")
        
        # Canonical National Material Code
        if code_format == "categorized":
            std_id = f"NMC-{cat_prefix}-{group_num:05d}"
        else:
            std_id = f"NMC-{group_num:06d}"
            
        group_id = f"GRP-{group_num:05d}"

        # Representative canonical description
        best_canon = max([processed_records[i]["canon_desc"] for i in indices], key=len)
        cluster_cpses = list(dict.fromkeys([processed_records[i]["raw"].cpse_name for i in indices if processed_records[i]["raw"].cpse_name]))
        cpse_summary_str = ", ".join(cluster_cpses) if cluster_cpses else "Multiple CPSEs"

        for i, idx in enumerate(indices):
            item = processed_records[idx]
            raw = item["raw"]
            
            if len(indices) == 1:
                score = 100.0
                confidence = "HIGH"
                reason = "Unique verified physical entity; canonical standard assigned"
                ai_result = "Same (Verified Canonical Entity)"
            else:
                score, confidence, reason = compute_record_match(
                    processed_records[indices[0]],
                    item
                )
                if i == 0:
                    score = 99.0
                    reason = f"Primary benchmark identity for standardized cluster ({len(indices)} cross-CPSE equivalents linked)"

                if score >= 90.0:
                    ai_result = f"Same (Exact Physical Equivalence across {cpse_summary_str})"
                elif score >= 70.0:
                    ai_result = f"Potentially Same (Functionally Equivalent across {cpse_summary_str})"
                else:
                    ai_result = f"Potentially Same (Variant / Review Required: {reason})"

            rec = StandardizedMaterialRecord(
                CPSE_Name=raw.cpse_name,
                Original_Material_Code=raw.material_code,
                Original_Description=raw.material_description,
                Specification=raw.specification,
                Normalized_Description=item["norm"],
                Extracted_Material_Type=item["attrs"]["material_type"],
                Extracted_Material=item["attrs"]["material"],
                Extracted_Grade=item["attrs"]["grade"],
                Extracted_Size=item["attrs"]["size"],
                Extracted_Specification=item["attrs"]["specification"],
                Standard_Material_ID=std_id,
                Standardized_Material_Description=best_canon,
                Match_Confidence=confidence,
                Match_Score=score,
                Match_Reason=ai_result,
                Equivalence_Group_ID=group_id
            )
            standardized_results[idx] = rec

            cross_reference_rows.append({
                "Standard_Material_ID": std_id,
                "Equivalence_Group_ID": group_id,
                "Standardized_Material_Description": best_canon,
                "CPSE_Name": raw.cpse_name,
                "Original_Material_Code": raw.material_code,
                "Original_Description": raw.material_description,
                "Match_Score": score,
                "AI_Equivalence_Result": ai_result
            })

    # Process Ambiguous / Review Required records
    for idx in ambiguous_indices:
        item = processed_records[idx]
        raw = item["raw"]
        std_id = "REVIEW_REQUIRED"
        group_id = f"GRP-REV-{idx+1:04d}"
        ai_result = f"Potentially Same (Pending Validation: {item['review_reason']})"
        
        rec = StandardizedMaterialRecord(
            CPSE_Name=raw.cpse_name,
            Original_Material_Code=raw.material_code,
            Original_Description=raw.material_description,
            Specification=raw.specification,
            Normalized_Description=item["norm"],
            Extracted_Material_Type=item["attrs"]["material_type"] or "UNRESOLVED",
            Extracted_Material=item["attrs"]["material"] or "UNRESOLVED",
            Extracted_Grade=item["attrs"]["grade"],
            Extracted_Size=item["attrs"]["size"] or "MISSING",
            Extracted_Specification=item["attrs"]["specification"],
            Standard_Material_ID=std_id,
            Standardized_Material_Description=item["canon_desc"] or "PENDING HUMAN VALIDATION",
            Match_Confidence="REVIEW_REQUIRED",
            Match_Score=45.0,
            Match_Reason=ai_result,
            Equivalence_Group_ID=group_id
        )
        standardized_results[idx] = rec

        review_required_rows.append({
            "CPSE_Name": raw.cpse_name,
            "Original_Material_Code": raw.material_code,
            "Original_Description": raw.material_description,
            "Specification": raw.specification,
            "Extracted_Type": item["attrs"]["material_type"] or "UNRESOLVED",
            "Extracted_Material": item["attrs"]["material"] or "UNRESOLVED",
            "Extracted_Size": item["attrs"]["size"] or "MISSING",
            "Review_Reason": item["review_reason"],
            "Recommended_Action": "Request engineering datasheet or CPSE catalog manager clarification before merging"
        })

    return standardized_results, cross_reference_rows, review_required_rows


# ==============================================================================
# 6. UNIVERSAL DATA INGESTION & CATALOG GENERATION
# ==============================================================================

def generate_three_column_catalog(std_records: List[StandardizedMaterialRecord]) -> pd.DataFrame:
    """
    Generates the streamlined 3-column Master Dataset:
    1. National Material Code
    2. Standardized Material Description
    3. AI Equivalence Result
    """
    rows = []
    for r in std_records:
        rows.append({
            "National Material Code": r.Standard_Material_ID,
            "Standardized Material Description": r.Standardized_Material_Description,
            "AI Equivalence Result": r.Match_Reason
        })
    return pd.DataFrame(rows)


def generate_unique_national_catalog(std_records: List[StandardizedMaterialRecord]) -> pd.DataFrame:
    """
    Generates the unique consolidated National Catalog (deduplicated by National Material Code).
    """
    grouped: Dict[str, Dict[str, Any]] = {}
    for r in std_records:
        code = r.Standard_Material_ID
        if code not in grouped:
            grouped[code] = {
                "National Material Code": code,
                "Equivalence Group ID": r.Equivalence_Group_ID,
                "Standardized Material Description": r.Standardized_Material_Description,
                "AI Equivalence Result": r.Match_Reason,
                "Linked_CPSE_Count": 0,
                "CPSE_List": set()
            }
        grouped[code]["Linked_CPSE_Count"] += 1
        if r.CPSE_Name:
            grouped[code]["CPSE_List"].add(r.CPSE_Name)

    unique_rows = []
    for code, data in grouped.items():
        cpses = ", ".join(sorted(data["CPSE_List"])) if data["CPSE_List"] else "N/A"
        unique_rows.append({
            "National Material Code": data["National Material Code"],
            "Equivalence Group ID": data["Equivalence Group ID"],
            "Standardized Material Description": data["Standardized Material Description"],
            "AI Equivalence Result": data["AI Equivalence Result"],
            "Linked_CPSE_Count": data["Linked_CPSE_Count"],
            "CPSE_List": cpses
        })
    return pd.DataFrame(unique_rows)


def standardize_dataframe(
    df: pd.DataFrame,
    cpse_col: Optional[str] = None,
    code_col: Optional[str] = None,
    desc_col: Optional[str] = None,
    spec_col: Optional[str] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Standardizes arbitrary Pandas DataFrame with intelligent column auto-detection.
    """
    cols = {str(c).lower().strip(): c for c in df.columns}

    # Auto-detect CPSE column
    detected_cpse = cpse_col or next((cols[k] for k in cols if any(x in k for x in ["cpse", "org", "enterprise", "company"])), None)
    # Auto-detect Material Code column
    detected_code = code_col or next((cols[k] for k in cols if any(x in k for x in ["material_code", "item_code", "mat_code", "material_id", "code", "id"])), None)
    # Auto-detect Description column
    detected_desc = desc_col or next((cols[k] for k in cols if any(x in k for x in ["material_description", "raw material description", "item_description", "desc", "description", "item_name", "standardized material description"])), None)
    # Auto-detect Specification column
    detected_spec = spec_col or next((cols[k] for k in cols if any(x in k for x in ["spec", "specification", "technical"])), None)

    if not detected_desc:
        raise ValueError("Could not auto-detect a Material Description column. Please specify `desc_col`.")

    raw_records = []
    cpse_prefixes = {
        "ONG": "ONGC", "ONGC": "ONGC",
        "BHL": "BHEL", "BHEL": "BHEL",
        "SAIL": "SAIL",
        "NTP": "NTPC", "NTPC": "NTPC",
        "IOC": "IOCL", "IOCL": "IOCL",
        "GAIL": "GAIL", "CIL": "CIL", "BPCL": "BPCL", "HPCL": "HPCL"
    }

    for idx, row in df.iterrows():
        cpse = str(row[detected_cpse]) if detected_cpse and pd.notna(row.get(detected_cpse)) else ""
        code = str(row[detected_code]) if detected_code and pd.notna(row.get(detected_code)) else f"CODE-{idx+1:05d}"
        desc = str(row[detected_desc]) if pd.notna(row.get(detected_desc)) else ""
        spec = str(row[detected_spec]) if detected_spec and pd.notna(row.get(detected_spec)) else ""
        
        # Auto-infer CPSE and original material code from legacy prefix if CPSE column was missing
        if not cpse and code:
            m_code = re.search(r"(?:NMC-STD-)?([A-Z]+)[-_]?(\d+)", code)
            if m_code:
                pfx = m_code.group(1).upper()
                if pfx in cpse_prefixes:
                    cpse = cpse_prefixes[pfx]
        
        raw_records.append(RawMaterialRecord(
            cpse_name=cpse,
            material_code=code,
            material_description=desc,
            specification=spec
        ))

    std_recs, xref, reviews = run_pipeline(raw_records)

    df_master = pd.DataFrame([asdict(r) for r in std_recs])
    df_3col = generate_three_column_catalog(std_recs)
    df_xref = pd.DataFrame(xref)
    df_reviews = pd.DataFrame(reviews)

    return df_master, df_3col, df_xref, df_reviews


def standardize_csv(input_csv_path: str, output_dir: Optional[str] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Standardizes any arbitrary CSV file, saves 3-column & audit reports to output_dir if specified.
    """
    if not os.path.exists(input_csv_path):
        raise FileNotFoundError(f"Input file not found: {input_csv_path}")

    df = pd.read_csv(input_csv_path)
    df_master, df_3col, df_xref, df_reviews = standardize_dataframe(df)

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        df_3col.to_csv(os.path.join(output_dir, "national_material_master_3col.csv"), index=False)
        df_master.to_csv(os.path.join(output_dir, "standardized_master_data.csv"), index=False)
        df_xref.to_csv(os.path.join(output_dir, "material_cross_reference.csv"), index=False)
        df_reviews.to_csv(os.path.join(output_dir, "review_required_queue.csv"), index=False)
        print(f"Results exported successfully to '{output_dir}':")
        print(f" - [3-Column Cleaned Master]: {os.path.join(output_dir, 'national_material_master_3col.csv')}")
        print(f" - [Detailed Audit Master]: {os.path.join(output_dir, 'standardized_master_data.csv')}")

    return df_master, df_3col, df_xref, df_reviews


# ==============================================================================
# 7. MAIN ENTRYPOINT / CLI
# ==============================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-CPSE Material Master Data Standardization Engine")
    parser.add_argument("--input", type=str, help="Path to arbitrary raw CSV dataset to standardize")
    parser.add_argument("--output", type=str, default="output_standardized", help="Directory to export output CSVs")
    args = parser.parse_args()

    if args.input:
        print(f"Loading and standardizing new dataset from: {args.input}")
        df_m, df_3col, df_x, df_r = standardize_csv(args.input, args.output)
        print(f"Processed: {len(df_m)} records | Groups Formed: {len(df_x['Standard_Material_ID'].unique())} | Review Required: {len(df_r)}")
        print("\n--- SAMPLE 3-COLUMN NATIONAL MATERIAL DATASET ---")
        print(df_3col.head(20).to_string(index=False))
    else:
        # Default: Execute verification with multi-CPSE benchmark dataset
        print("Executing Master Benchmark Dataset (Fasteners, Piping, Structural Steel, Bearings, Electrical, Exception Queue)...")
        benchmark_dataset = [
            # Group 1: SS Hex Bolt M10x50 MM (Equivalence across ONGC, BHEL, NTPC)
            RawMaterialRecord("ONGC", "ONG-1001", "SS HEX BOLT M10X50 MM", "Grade A2-70"),
            RawMaterialRecord("BHEL", "BHEL-2001", "HEX. BOLT STAINLESS STEEL M10*50MM", "SS-304 A2-70"),
            RawMaterialRecord("SAIL", "SAIL-3001", "SS Hex Bolt M10 x 50", "SS304"),
            RawMaterialRecord("NTPC", "NTPC-4001", "Hex Bolt Stainless Steel M10 50mm", "IS 1364"),

            # Invariant Test: SS Hex Bolt M12x50 (Must NOT merge with M10x50!)
            RawMaterialRecord("IOCL", "IOCL-1092", "SS HEX BOLT M12X50", "Grade A2-70"),

            # Group 2: MS Pipe 2 Inch (Equivalence between ONGC, BHEL, SAIL, NTPC, GAIL, IOCL)
            RawMaterialRecord("ONGC", "ONG-1002", "mild steel pipe 2 inch", ""),
            RawMaterialRecord("BHEL", "BHL-2002", "mild steel pipe diameter 2 inch", ""),
            RawMaterialRecord("SAIL", "SAIL-3002", "mild stl pipe 2 inch", ""),
            RawMaterialRecord("NTPC", "NTP-4002", "mild steel pipe 2 inch diameter", ""),

            # Invariant Test: MS Pipe 3 Inch (Must NOT merge with 2 Inch!)
            RawMaterialRecord("SAIL", "SAIL-7014", "MS PIPE 3 INCH", "IS 1239 Class C"),

            # Group 3: Bearing 6205 SKF
            RawMaterialRecord("ONGC", "ONG-1003", "bearing 6205 skf", ""),
            RawMaterialRecord("BHEL", "BHL-2003", "ball bearing 6205 skf", ""),
            RawMaterialRecord("SAIL", "SAIL-3003", "bearing nos 6205", ""),
            RawMaterialRecord("NTPC", "NTP-4003", "skf bearing nos.6205", ""),

            # Group 4: GI Sheet 2mm Thickness
            RawMaterialRecord("ONGC", "ONG-1004", "galvanized iron sheet 2 mm thickness", ""),
            RawMaterialRecord("BHEL", "BHL-2004", "galvanized iron sheet thickness 2 mm", ""),
            RawMaterialRecord("SAIL", "SAIL-3004", "galvanized iron sheet 2 mm", ""),
            RawMaterialRecord("NTPC", "NTP-4004", "galvanized iron plate 2 mm thick", ""),

            # Group 5: Copper Cable 4 sq mm
            RawMaterialRecord("ONGC", "ONG-1005", "copper cable 4 sq mm", ""),
            RawMaterialRecord("BHEL", "BHL-2005", "copper cable 4 sq mm", ""),
            RawMaterialRecord("SAIL", "SAIL-3005", "copper wire 4 sq mm", ""),
            RawMaterialRecord("NTPC", "NTP-4005", "4 sq mm copper flex cable", ""),
        ]

        std_recs, xref, reviews = run_pipeline(benchmark_dataset)
        df_3col = generate_three_column_catalog(std_recs)
        print(f"Total Processed: {len(std_recs)}")
        print(f"Total Groups Formed: {len(set(r.Standard_Material_ID for r in std_recs if r.Standard_Material_ID != 'REVIEW_REQUIRED'))}")
        print(f"Total Review Required: {len(reviews)}")
        print("\n--- SAMPLE 3-COLUMN NATIONAL CATALOG ROWS ---")
        print(df_3col.to_string(index=False))
