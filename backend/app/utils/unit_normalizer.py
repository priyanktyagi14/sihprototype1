"""
Unit Normalization and Dimension Formatting utilities.
Handles standardizing industrial engineering units and dimension expressions.
"""

import re
from typing import Dict, List, Tuple, Optional


class UnitNormalizer:
    """
    Standardizes measurement units, dimension multipliers, and number-unit spacings.
    """

    # Mapping of raw / colloquial unit variants to canonical representation
    UNIT_MAPPINGS: Dict[str, str] = {
        # Length & Dimensions
        "mm": "mm",
        "m.m.": "mm",
        "m.m": "mm",
        "millimeter": "mm",
        "millimetre": "mm",
        "millimeters": "mm",
        "millimetres": "mm",
        "cm": "cm",
        "c.m.": "cm",
        "c.m": "cm",
        "centimeter": "cm",
        "centimeters": "cm",
        "centimetre": "cm",
        "centimetres": "cm",
        "mtr": "m",
        "mtrs": "m",
        "meter": "m",
        "meters": "m",
        "metre": "m",
        "metres": "m",
        "inch": "inch",
        "inches": "inch",
        "in": "inch",
        "in.": "inch",
        "ft": "ft",
        "feet": "ft",
        "foot": "ft",

        # Area
        "sq.mm": "sq mm",
        "sq. mm": "sq mm",
        "sq mm": "sq mm",
        "sqmm": "sq mm",
        "sq.m": "sq m",
        "sq. m": "sq m",
        "sq m": "sq m",
        "sqm": "sq m",
        "sq.cm": "sq cm",
        "sq. cm": "sq cm",
        "sq cm": "sq cm",
        "sqcm": "sq cm",

        # Quantity / Count
        "nos": "nos",
        "no": "nos",
        "no.": "nos",
        "number": "nos",
        "numbers": "nos",
        "pcs": "pcs",
        "pc": "pcs",
        "pc.": "pcs",
        "pieces": "pcs",
        "piece": "pcs",
        "sets": "set",
        "set": "set",

        # Electrical
        "kv": "kv",
        "k.v.": "kv",
        "k.v": "kv",
        "kilovolt": "kv",
        "kilovolts": "kv",
        "v": "v",
        "volt": "v",
        "volts": "v",
        "kw": "kw",
        "k.w.": "kw",
        "k.w": "kw",
        "kilowatt": "kw",
        "kilowatts": "kw",
        "hp": "hp",

        # Weight & Volume
        "kg": "kg",
        "kgs": "kg",
        "kilogram": "kg",
        "kilograms": "kg",
        "gm": "g",
        "gms": "g",
        "gram": "g",
        "grams": "g",
        "ltr": "l",
        "ltrs": "l",
        "liter": "l",
        "liters": "l",
        "litre": "l",
        "litres": "l",
        "mt": "mt",
        "ton": "mt",
        "tons": "mt",

        # Pressure & Mechanics
        "bar": "bar",
        "psi": "psi",
        "mpa": "mpa",
        "rpm": "rpm",
    }

    def __init__(self, custom_units: Optional[Dict[str, str]] = None) -> None:
        self._units: Dict[str, str] = dict(self.UNIT_MAPPINGS)
        if custom_units:
            for k, v in custom_units.items():
                self._units[k.strip().lower()] = v.strip().lower()

    def get_all(self) -> Dict[str, str]:
        """Return a copy of the active units dictionary."""
        return dict(self._units)

    def format_dimensions(self, text: str) -> Tuple[str, List[str]]:
        """
        Standardize dimension expressions:
        - M10X50 -> m10 x 50
        - M10*50 -> m10 x 50
        - 10X50MM -> 10 x 50 mm
        - 4SQMM -> 4 sq mm
        - 2MM -> 2 mm
        - 1/2" -> 1/2 inch
        """
        if not text:
            return text, []

        changes: List[str] = []
        current_text = text

        # 1. Separate attached number + unit first (e.g., 2mm -> 2 mm, 4sqmm -> 4 sq mm, 10x50mm -> 10x50 mm -> 10 x 50 mm)
        units_pattern = (
            r'(?<![.\d])(\d+(?:\.\d+)?)\s*(sq\.?\s*mm|sqmm|sq\.?\s*m|sqm|sq\.?\s*cm|sqcm|'
            r'mm|cm|mtrs?|meters?|metres?|kv|kg|kgs|gms?|ltrs?|nos?|pcs?|hp|kw|bar|psi|rpm)\b'
        )
        unit_attached_matches = list(re.finditer(units_pattern, current_text, flags=re.IGNORECASE))
        for m in unit_attached_matches:
            orig = m.group(0)
            num = m.group(1)
            u = m.group(2)
            sub = f"{num} {u}"
            if orig != sub and f"Separated number and unit: {orig} → {sub}" not in changes:
                changes.append(f"Separated number and unit: {orig} → {sub}")
        current_text = re.sub(units_pattern, r'\1 \2', current_text, flags=re.IGNORECASE)

        # 2. Standardize inch quotes: e.g. 2" -> 2 inch, 1/2" -> 1/2 inch
        inch_quote_pattern = r'(\b\d+(?:/\d+)?|\b\d+\.\d+)\s*(?:"|\'\'|\b(?:inch|inches|in)\b)'
        def replace_inch(m: re.Match) -> str:
            val = m.group(1)
            return f"{val} inch"

        inch_matches = list(re.finditer(r'(\b\d+(?:/\d+)?|\b\d+\.\d+)\s*(?:"|\'\')', current_text))
        if inch_matches:
            for m in inch_matches:
                orig = m.group(0)
                sub = f"{m.group(1)} inch"
                if f"Standardized dimension formatting: {orig} → {sub}" not in changes:
                    changes.append(f"Standardized dimension formatting: {orig} → {sub}")
            current_text = re.sub(r'(\b\d+(?:/\d+)?|\b\d+\.\d+)\s*(?:"|\'\')', replace_inch, current_text)

        # 3. Standardize dimension multipliers (e.g. M10X50 -> m10 x 50, M10*50 -> m10 x 50, 2500X10000 -> 2500 x 10000)
        # Matches (m\d+|\d+(?:\.\d+)?)\s*[*xX]\s*(\d+(?:\.\d+)?)
        dim_pattern = r'\b([mM]\d+|\d+(?:\.\d+)?)\s*([*xX])\s*(\d+(?:\.\d+)?)\b'
        for _ in range(3):
            matches = list(re.finditer(dim_pattern, current_text))
            if not matches:
                break
            for m in matches:
                full_match = m.group(0)
                p1 = m.group(1).lower()
                p2 = m.group(3).lower()
                replacement = f"{p1} x {p2}"
                if full_match != replacement and f"Standardized dimension formatting: {full_match} → {replacement}" not in changes:
                    changes.append(f"Standardized dimension formatting: {full_match} → {replacement}")
            current_text = re.sub(dim_pattern, r'\1 x \3', current_text)

        return current_text, changes

    def normalize_units(self, text: str) -> Tuple[str, List[str]]:
        """
        Normalize unit representations (e.g., MM -> mm, MTRS -> m, NOS -> nos, SQMM -> sq mm).
        """
        if not text:
            return text, []

        changes: List[str] = []
        current_text = text

        # Sort units by length descending to match multi-word / longer units first (e.g., "sq.mm", "sq mm" before "mm")
        sorted_units = sorted(self._units.keys(), key=len, reverse=True)

        for raw_unit in sorted_units:
            std_unit = self._units[raw_unit]
            escaped_unit = re.escape(raw_unit)

            # Match unit with word boundary or attached to numbers/delimiters
            pattern = rf"(?<![a-zA-Z0-9]){escaped_unit}(?![a-zA-Z0-9])"

            # Avoid replacing metric thread codes like 'm' in 'm10'
            if raw_unit == "m":
                # Only match isolated 'm' following a number: e.g. "10 m" or "10m"
                pattern = r"(?<=\d\s)m(?![a-zA-Z0-9])|(?<=\d)m(?![a-zA-Z0-9])"

            matches = list(re.finditer(pattern, current_text, flags=re.IGNORECASE))
            if matches:
                for match in matches:
                    matched_str = match.group(0)
                    if matched_str != std_unit:
                        changes.append(f"Normalized measurement unit: {matched_str} → {std_unit}")
                
                current_text = re.sub(pattern, std_unit, current_text, flags=re.IGNORECASE)

        return current_text, changes


# Global singleton instance
unit_normalizer = UnitNormalizer()
