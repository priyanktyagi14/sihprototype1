"""
Production-Grade Material Master Data Standardization, Attribute Extraction,
Entity Matching, and Canonical Cataloging Engine.
Designed for Multi-CPSE Master Data Management (MDM).
Supports batch CSV, Excel, and DataFrame standardization on arbitrary datasets.
"""

import os
import re
import argparse
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import pandas as pd


# ==============================================================================
# 1. INDUSTRIAL DICTIONARIES & TAXONOMY LOOKUPS
# ==============================================================================

MATERIAL_SYNONYMS = {
    r"\bss\b": "Stainless Steel",
    r"\bms\b": "Mild Steel",
    r"\bgi\b": "Galvanized Iron",
    r"\bg\.i\.\b": "Galvanized Iron",
    r"\bcu\b": "Copper",
    r"\bcs\b": "Carbon Steel",
    r"\bci\b": "Cast Iron",
    r"\bal\b": "Aluminium",
    r"\bbrass\b": "Brass",
    r"\bbronze\b": "Bronze",
    r"\bptfe\b": "PTFE",
    r"\bteflon\b": "PTFE",
    r"\bxlpe\b": "XLPE",
    r"\bpvc\b": "PVC",
    r"\bwcb\b|\ba216\s*wcb\b": "Carbon Steel",
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
    r"\bbrg\.?\b|\bbearing\b": "Bearing",
    r"\bball\s+(?:vlv|valve)\b": "Ball Valve",
    r"\bgate\s+(?:vlv|valve)\b": "Gate Valve",
    r"\bglobe\s+(?:vlv|valve)\b": "Globe Valve",
    r"\bvlv\b|\bvalve\b": "Valve",
    r"\bgasket\b": "Gasket",
    r"\bbusbar\b|\bbus\s+bar\b": "Busbar",
    r"\bcable\b": "Cable",
}

UNIT_STANDARDIZATION = {
    r"\bmm\b": "mm",
    r"\bmtr\b|\bmtrs\b|\bmeter\b|\bmetres\b": "m",
    r"\binch\b|\binches\b|\bin\b|\"|\'\'": "inch",
    r"\bthk\b|\bthickness\b": "Thickness",
    r"\bdia\b|\bdiameter\b": "Diameter",
    r"\bsqmm\b|\bsq\.mm\b|\bsq\s+mm\b": "sq mm",
    r"\bkg\b|\bkgs\b|\bkilogram\b": "kg",
    r"\bnos\b|\bno\b|\bnumber\b": "nos",
    r"\bpcs\b|\bpc\b|\bpieces\b": "pcs",
    r"\bkv\b|\bk\.v\.\b": "kV",
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
        
        # 1. Expand dotted abbreviations early before symbol stripping
        s = re.sub(r"\bS\.S\.?\b", "SS", s, flags=re.IGNORECASE)
        s = re.sub(r"\bM\.S\.?\b", "MS", s, flags=re.IGNORECASE)
        s = re.sub(r"\bG\.I\.?\b", "GI", s, flags=re.IGNORECASE)
        s = re.sub(r"\bHEX\.\b", "HEX", s, flags=re.IGNORECASE)
        s = re.sub(r"\bBRG\.\b", "BEARING", s, flags=re.IGNORECASE)
        s = re.sub(r"\bVLV\.\b", "VALVE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bFLG\.\b", "FLANGE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bPLT\.\b", "PLATE", s, flags=re.IGNORECASE)
        s = re.sub(r"\bSHT\.\b", "SHEET", s, flags=re.IGNORECASE)

        # 2. Standardize Cable sizing: 4 CORE 4SQMM, 4C X 4 SQ MM -> 4 Core x 4 sq mm
        s = re.sub(r"\b(\d+)\s*[cC](?:ore)?\s*[*xX]?\s*(\d+(?:\.\d+)?)\s*(?:sqmm|sq\.mm|sq\s*mm)\b", r"\1 Core x \2 sq mm", s, flags=re.IGNORECASE)
        s = re.sub(r"\b1100\s*v\b|\b1\.1\s*kv\b", "1.1 kV", s, flags=re.IGNORECASE)

        # 3. Standardize Pressure Class: 150#, 150 lbs, class 150, 150 LBS -> Class 150
        s = re.sub(r"\b(\d+)\s*#", r"Class \1", s)
        s = re.sub(r"\b(\d+)\s*(?:lbs|lb)\b", r"Class \1", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(?:class|cl)\s*(\d+)\b", r"Class \1", s, flags=re.IGNORECASE)

        # 4. Standardize dimensional notations: e.g. M10X50 -> M10 x 50, M12X1.75 -> M12 x 1.75
        s = re.sub(r"([a-zA-Z0-9]+)\s*[*xX]\s*(\d+(?:\.\d+)?)", r"\1 x \2", s)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*\"", r"\1 inch", s)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*''", r"\1 inch", s)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*(?:in|inch)\b", r"\1 inch", s, flags=re.IGNORECASE)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*(?:mm)\b", r"\1 mm", s, flags=re.IGNORECASE)
        s = re.sub(r"(\d+(?:\.\d+)?)\s*(?:sqmm|sq\.mm)\b", r"\1 sq mm", s, flags=re.IGNORECASE)
        
        # 5. Clean unnecessary punctuation, preserve hyphens, slashes, periods in numbers
        s = re.sub(r"[!@$%^~_+=<>?]+", " ", s)
        s = re.sub(r"\s+", " ", s)
        
        # 6. Expand common industrial abbreviations
        for pattern, repl in MATERIAL_SYNONYMS.items():
            s = re.sub(pattern, repl, s, flags=re.IGNORECASE)
        
        s = re.sub(r"\bthk\b|\bthickness\b", "Thickness", s, flags=re.IGNORECASE)
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

        # 1. Material Type
        for pattern, canonical_type in TYPE_SYNONYMS.items():
            if re.search(pattern, full_text, re.IGNORECASE):
                attrs["material_type"] = canonical_type
                break
        
        # 2. Material
        for pattern, canonical_mat in MATERIAL_SYNONYMS.items():
            if re.search(pattern, full_text, re.IGNORECASE):
                attrs["material"] = canonical_mat
                break
        if not attrs["material"]:
            if re.search(r"\bstainless\s+steel\b|\bss316\b|\bss304\b", full_text, re.IGNORECASE):
                attrs["material"] = "Stainless Steel"
            elif re.search(r"\bmild\s+steel\b", full_text, re.IGNORECASE):
                attrs["material"] = "Mild Steel"
            elif re.search(r"\bgalvanized\s+iron\b", full_text, re.IGNORECASE):
                attrs["material"] = "Galvanized Iron"
            elif re.search(r"\bcopper\b", full_text, re.IGNORECASE):
                attrs["material"] = "Copper"
            elif re.search(r"\bcarbon\s+steel\b|\bwcb\b|\ba105\b", full_text, re.IGNORECASE):
                attrs["material"] = "Carbon Steel"

        # 3. Pressure Rating
        p_class = re.search(r"\b(Class\s*\d+)\b", full_text, re.IGNORECASE)
        if p_class:
            attrs["pressure_rating"] = p_class.group(1).capitalize()

        # 4. Manufacturer
        mfg_match = re.search(r"\b(SKF|FAG|TIMKEN)\b", full_text, re.IGNORECASE)
        if mfg_match:
            attrs["manufacturer"] = mfg_match.group(1).upper()

        # 5. Bearing Number & Canonical Bearing Type
        brg_match = re.search(r"\b(?:NO\.?\s*|BRG[\.\-_\s]*|BEARING[\.\-_\s]*)?(\d{4,5}(?:-[A-Z0-9/]+)?)\b", full_text, re.IGNORECASE)
        if attrs["material_type"] in ["Bearing", "Deep Groove Ball Bearing", "Ball Bearing", "Roller Bearing"] or "bearing" in full_text.lower():
            if brg_match:
                attrs["bearing_no"] = brg_match.group(1).upper()
                attrs["size"] = f"Bearing No. {attrs['bearing_no']}"
                attrs["material_type"] = get_canonical_bearing_type(attrs["material_type"], attrs["bearing_no"])
                if not attrs["material"]:
                    attrs["material"] = "High Carbon Chromium Steel"

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
            m_thread = re.search(r"\b(M\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?(?:\s*mm)?)\b", full_text, re.IGNORECASE)
            dim_mult = re.search(r"\b(\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?(?:\s*x\s*\d+(?:\.\d+)?)?\s*mm)\b", full_text, re.IGNORECASE)
            inch_size = re.search(r"\b((?:\d+\/\d+|\d+(?:\.\d+)?)\s*inch)\b", full_text, re.IGNORECASE)
            thk_size = re.search(r"\b(\d+(?:\.\d+)?\s*mm(?:\s*Thickness)?)\b", full_text, re.IGNORECASE)
            m_single = re.search(r"\b(M\d+(?:\.\d+)?)\b", full_text, re.IGNORECASE)

            if m_cable:
                attrs["size"] = m_cable.group(1)
            elif m_thread:
                sz = m_thread.group(1)
                if not sz.lower().endswith("mm"):
                    sz = sz + " mm"
                attrs["size"] = sz
            elif dim_mult:
                attrs["size"] = dim_mult.group(1).lower()
            elif inch_size:
                attrs["size"] = inch_size.group(1).lower()
            elif thk_size:
                attrs["size"] = thk_size.group(1)
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
            prefix = f"{mfg} " if mfg else ""
            desc = f"{prefix}{m_type} {brg_no}".strip()
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
    s = s.replace("diameter", "").replace("dia", "").replace("thickness", "").replace("thk", "").strip()
    s = re.sub(r"(\d+)\.0+\b", r"\1", s)
    s = s.replace("*", "x")
    s = re.sub(r"\bmm\b", "", s)
    s = re.sub(r"\binch(?:es)?\b|\bin\b", "inch", s)
    s = re.sub(r"\s+", "", s)
    return s

def normalize_type_key(type_str: str) -> str:
    if not type_str:
        return "UNKNOWN"
    return type_str.lower().replace(" ", "")

def normalize_material_key(mat_str: str) -> str:
    if not mat_str:
        return "UNKNOWN"
    return mat_str.lower().replace(" ", "")

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
    if type_a != type_b and type_a != "unknown" and type_b != "unknown":
        return 0.0, "LOW", f"Incompatible material types: '{rec_a['extracted_material_type']}' vs '{rec_b['extracted_material_type']}'"

    # Hard Invariant 2: Dimension mismatch (CRITICAL RULE)
    if size_a and size_b and size_a != size_b:
        return 0.0, "LOW", f"Dimension mismatch prevents merge: '{rec_a['extracted_size']}' vs '{rec_b['extracted_size']}'"

    # Hard Invariant 3: Pressure Rating mismatch for pressure retaining equipment
    if rate_a and rate_b and rate_a != rate_b:
        return 0.0, "LOW", f"Pressure class mismatch prevents merge: '{rec_a['attrs']['pressure_rating']}' vs '{rec_b['attrs']['pressure_rating']}'"

    # Ambiguity check
    if not size_a or not size_b:
        return 50.0, "REVIEW_REQUIRED", "Insufficient dimensional data for deterministic physical equivalence"

    # Check Material
    if mat_a and mat_b and mat_a != mat_b:
        return 10.0, "LOW", f"Metallurgical base mismatch: '{rec_a['extracted_material']}' vs '{rec_b['extracted_material']}'"

    # Bearing specific model
    brg_a = rec_a.get("extracted_bearing_no", "")
    brg_b = rec_b.get("extracted_bearing_no", "")
    if brg_a and brg_b and brg_a != brg_b:
        return 0.0, "LOW", f"Bearing number mismatch: {brg_a} vs {brg_b}"

    # Score calculation
    score = 96.0
    tokens_a = set(rec_a["normalized_description"].lower().split())
    tokens_b = set(rec_b["normalized_description"].lower().split())
    overlap = len(tokens_a & tokens_b) / max(len(tokens_a | tokens_b), 1)
    score += min(4.0, overlap * 4.0)

    confidence = "HIGH" if score >= 90.0 else "MEDIUM"
    reason = f"Exact physical match on Material Type ({rec_a['extracted_material_type']}), Material ({rec_a['extracted_material']}), and Dimension ({rec_a['extracted_size']})"
    return round(score, 1), confidence, reason


# ==============================================================================
# 5. PIPELINE EXECUTION & GROUPING
# ==============================================================================

def run_pipeline(raw_records: List[RawMaterialRecord]) -> Tuple[List[StandardizedMaterialRecord], List[Dict[str, Any]], List[Dict[str, Any]]]:
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

    # Step 3 & 4: Clustering & Standard Material ID Assignment
    groups: Dict[Tuple, List[int]] = {}
    ambiguous_indices = []

    for idx, item in enumerate(processed_records):
        if item["is_ambiguous"]:
            ambiguous_indices.append(idx)
            continue
        
        type_key = normalize_type_key(item["attrs"]["material_type"])
        mat_key = normalize_material_key(item["attrs"]["material"])
        size_key = normalize_dimension_key(item["attrs"]["size"])
        rate_key = normalize_rating_key(item["attrs"].get("pressure_rating", ""))
        
        # For bearings, group by (type_key, manufacturer, bearing_no)
        if item["attrs"]["bearing_no"]:
            key = (type_key, item["attrs"]["manufacturer"].lower(), item["attrs"]["bearing_no"].lower())
        # For pressure equipment, group by (type_key, mat_key, size_key, rate_key)
        elif item["attrs"]["material_type"] in ["Ball Valve", "Gate Valve", "Globe Valve", "Valve", "Flange", "Weld Neck Raised Face Flange", "Gasket", "Spiral Wound Gasket"]:
            key = (type_key, mat_key, size_key, rate_key)
        else:
            key = (type_key, mat_key, size_key)

        groups.setdefault(key, []).append(idx)

    standardized_results: List[StandardizedMaterialRecord] = []
    cross_reference_rows: List[Dict[str, Any]] = []
    review_required_rows: List[Dict[str, Any]] = []

    mat_id_counter = 1

    # Assign IDs to valid grouped clusters
    for key, indices in groups.items():
        std_id = f"MAT-{mat_id_counter:06d}"
        mat_id_counter += 1

        # Representative canonical description
        best_canon = max([processed_records[i]["canon_desc"] for i in indices], key=len)

        for i, idx in enumerate(indices):
            item = processed_records[idx]
            raw = item["raw"]
            
            if len(indices) == 1:
                score = 100.0
                confidence = "HIGH"
                reason = "Unique verified physical entity; canonical standard assigned"
            else:
                score, confidence, reason = compute_record_match(
                    processed_records[indices[0]],
                    item
                )
                if i == 0:
                    score = 99.0
                    reason = f"Primary benchmark identity for standardized cluster ({len(indices)} cross-CPSE equivalents linked)"

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
                Match_Reason=reason
            )
            standardized_results.append(rec)

            cross_reference_rows.append({
                "Standard_Material_ID": std_id,
                "Standardized_Material_Description": best_canon,
                "CPSE_Name": raw.cpse_name,
                "Original_Material_Code": raw.material_code,
                "Original_Description": raw.material_description,
                "Match_Score": score
            })

    # Process Ambiguous / Review Required records
    for idx in ambiguous_indices:
        item = processed_records[idx]
        raw = item["raw"]
        std_id = "REVIEW_REQUIRED"
        
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
            Match_Reason=item["review_reason"]
        )
        standardized_results.append(rec)

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
# 6. UNIVERSAL DATA INGESTION (CSV, EXCEL, DATAFRAME)
# ==============================================================================

def standardize_dataframe(
    df: pd.DataFrame,
    cpse_col: Optional[str] = None,
    code_col: Optional[str] = None,
    desc_col: Optional[str] = None,
    spec_col: Optional[str] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Standardizes arbitrary Pandas DataFrame with intelligent column auto-detection.
    Returns:
    - Master Standardized DataFrame (15 fields)
    - Cross-Reference DataFrame
    - Review Required DataFrame
    """
    cols = {str(c).lower().strip(): c for c in df.columns}

    # Auto-detect CPSE column
    detected_cpse = cpse_col or next((cols[k] for k in cols if any(x in k for x in ["cpse", "org", "enterprise", "company"])), None)
    # Auto-detect Material Code column
    detected_code = code_col or next((cols[k] for k in cols if any(x in k for x in ["material_code", "item_code", "mat_code", "material_id", "code", "id"])), None)
    # Auto-detect Description column
    detected_desc = desc_col or next((cols[k] for k in cols if any(x in k for x in ["material_description", "item_description", "desc", "description", "item_name"])), None)
    # Auto-detect Specification column
    detected_spec = spec_col or next((cols[k] for k in cols if any(x in k for x in ["spec", "specification", "technical"])), None)

    if not detected_desc:
        raise ValueError("Could not auto-detect a Material Description column. Please specify `desc_col`.")

    raw_records = []
    for idx, row in df.iterrows():
        cpse = str(row[detected_cpse]) if detected_cpse and pd.notna(row.get(detected_cpse)) else "GENERIC_ENTERPRISE"
        code = str(row[detected_code]) if detected_code and pd.notna(row.get(detected_code)) else f"CODE-{idx+1:05d}"
        desc = str(row[detected_desc]) if pd.notna(row.get(detected_desc)) else ""
        spec = str(row[detected_spec]) if detected_spec and pd.notna(row.get(detected_spec)) else ""
        
        raw_records.append(RawMaterialRecord(
            cpse_name=cpse,
            material_code=code,
            material_description=desc,
            specification=spec
        ))

    std_recs, xref, reviews = run_pipeline(raw_records)

    df_master = pd.DataFrame([asdict(r) for r in std_recs])
    df_xref = pd.DataFrame(xref)
    df_reviews = pd.DataFrame(reviews)

    return df_master, df_xref, df_reviews


def standardize_csv(input_csv_path: str, output_dir: Optional[str] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Standardizes any arbitrary CSV file, saves reports to output_dir if specified.
    """
    if not os.path.exists(input_csv_path):
        raise FileNotFoundError(f"Input file not found: {input_csv_path}")

    df = pd.read_csv(input_csv_path)
    df_master, df_xref, df_reviews = standardize_dataframe(df)

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        df_master.to_csv(os.path.join(output_dir, "standardized_master_data.csv"), index=False)
        df_xref.to_csv(os.path.join(output_dir, "material_cross_reference.csv"), index=False)
        df_reviews.to_csv(os.path.join(output_dir, "review_required_queue.csv"), index=False)
        print(f"Results exported successfully to '{output_dir}'.")

    return df_master, df_xref, df_reviews


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
        df_m, df_x, df_r = standardize_csv(args.input, args.output)
        print(f"Processed: {len(df_m)} records | Groups Formed: {len(df_x['Standard_Material_ID'].unique())} | Review Required: {len(df_r)}")
    else:
        # Default: Execute verification with multi-CPSE benchmark dataset
        print("Executing Master Benchmark Dataset (Fasteners, Piping, Structural Steel, Bearings, Electrical, Exception Queue)...")
        benchmark_dataset = [
            # Group 1: SS Hex Bolt M10x50 MM (Equivalence across ONGC, BHEL, NTPC)
            RawMaterialRecord("ONGC", "ONG-1001", "SS HEX BOLT M10X50 MM", "Grade A2-70"),
            RawMaterialRecord("BHEL", "BHEL-2001", "HEX. BOLT STAINLESS STEEL M10*50MM", "SS-304 A2-70"),
            RawMaterialRecord("NTPC", "NTPC-4001", "SS HEXAGONAL HEAD BOLT SIZE M10 X 50 MM", "IS 1364 / SS304"),

            # Invariant Test: SS Hex Bolt M12x50 (Must NOT merge with M10x50!)
            RawMaterialRecord("IOCL", "IOCL-1092", "SS HEX BOLT M12X50", "Grade A2-70"),

            # Group 2: MS Pipe 2 Inch (Equivalence between GAIL and IOCL)
            RawMaterialRecord("GAIL", "GAIL-5011", "MS PIPE 2 INCH", "IS 1239 Heavy Class"),
            RawMaterialRecord("IOCL", "IOCL-3022", "MS PIPE DIA 2 IN", "IS 1239 Class C"),

            # Invariant Test: MS Pipe 3 Inch (Must NOT merge with 2 Inch!)
            RawMaterialRecord("SAIL", "SAIL-7014", "MS PIPE 3 INCH", "IS 1239 Class C"),

            # Group 3: GI Sheet 2mm Thickness (Equivalence between NTPC and BHEL)
            RawMaterialRecord("NTPC", "NTPC-6101", "GI SHEET 2MM THK", "IS 277 Class VIII 120 GSM"),
            RawMaterialRecord("BHEL", "BHEL-8204", "GALVANIZED IRON SHEET THICKNESS 2.0 MM", "IS 277 Zn 120"),

            # Group 4: Bearing 6205 SKF (Equivalence between ONGC and IOCL)
            RawMaterialRecord("ONGC", "ONG-3312", "BRG-6205 SKF", "Deep Groove Ball Bearing Open"),
            RawMaterialRecord("IOCL", "IOCL-9921", "BEARING DEEP GROOVE BALL NO. 6205 SKF", "ISO 15 / ABEC-1"),

            # Review Required: SKF 6205-2RS1/C3 (Rubber Sealed + C3 Clearance)
            RawMaterialRecord("NTPC", "NTPC-9930", "DEEP GROOVE BALL BRG. NO. 6205-2RS1/C3 SKF", "Sealed C3 Clearance"),

            # Group 5: Copper Busbar 50x10mm
            RawMaterialRecord("SAIL", "SAIL-4401", "CU BUSBAR 50X10MM ELEC GRADE 99.9% PURITY", "IS 613 ETP"),
            RawMaterialRecord("BHEL", "BHEL-5510", "ELECTROLYTIC COPPER FLAT BUS BAR 50 X 10 MM", "99.9% Cu ETP Grade"),

            # Ambiguous / Incomplete Records for Review Table
            RawMaterialRecord("ONGC", "ONG-8810", "UNKNOWN MISC SPARE PART OLD DWG 4022A", "Unspecified OEM Spare"),
            RawMaterialRecord("GAIL", "GAIL-9102", "SS FLANGE 2 INCH", "Class Unstated"),
        ]

        std_recs, xref, reviews = run_pipeline(benchmark_dataset)
        print(f"Total Processed: {len(std_recs)}")
        print(f"Total X-Ref Rows: {len(xref)}")
        print(f"Total Review Required: {len(reviews)}")
        print("\n--- SAMPLE X-REF ---")
        for x in xref[:6]:
            print(x)
        print("\n--- SAMPLE REVIEWS ---")
        for r in reviews:
            print(r)
