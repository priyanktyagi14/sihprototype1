"""
Abbreviation expansion module with configurable dictionary and safe word-boundary matching.
"""

import re
from typing import Dict, List, Tuple, Optional


class AbbreviationManager:
    """
    Manages industrial abbreviation mappings and executes safe regex-based expansions.
    """

    # Initial industrial abbreviation definitions (all lowercased keys)
    DEFAULT_ABBREVIATIONS: Dict[str, str] = {
        # Raw metals & materials
        "ss": "stainless steel",
        "s.s": "stainless steel",
        "s.s.": "stainless steel",
        "ms": "mild steel",
        "m.s": "mild steel",
        "m.s.": "mild steel",
        "gi": "galvanized iron",
        "g.i": "galvanized iron",
        "g.i.": "galvanized iron",
        "cs": "carbon steel",
        "c.s": "carbon steel",
        "c.s.": "carbon steel",
        "ci": "cast iron",
        "c.i": "cast iron",
        "c.i.": "cast iron",
        "as": "alloy steel",
        "cu": "copper",
        "brs": "brass",
        "al": "aluminium",
        "pvc": "polyvinyl chloride",
        "hdpe": "high density polyethylene",
        "ptfe": "polytetrafluoroethylene",

        # Mechanical components & hardware
        "brg": "bearing",
        "brg.": "bearing",
        "blt": "bolt",
        "wshr": "washer",
        "flg": "flange",
        "vlv": "valve",
        "plt": "plate",
        "sht": "sheet",
        "cplg": "coupling",

        # Dimensions, tolerances & technical specs
        "dia": "diameter",
        "dia.": "diameter",
        "thk": "thickness",
        "thk.": "thickness",
        "galv": "galvanized",
        "galv.": "galvanized",
        "od": "outer diameter",
        "id": "inner diameter",
        "nb": "nominal bore",
        "sch": "schedule",
        "len": "length",
        "std": "standard",
        "qty": "quantity",
        "req": "required",
        "temp": "temperature",
        "press": "pressure",
        "npt": "national pipe taper",
        "bspt": "british standard pipe taper",
    }

    def __init__(self, custom_dict: Optional[Dict[str, str]] = None) -> None:
        self._dict: Dict[str, str] = dict(self.DEFAULT_ABBREVIATIONS)
        if custom_dict:
            for k, v in custom_dict.items():
                self._dict[k.strip().lower()] = v.strip().lower()

    def get_all(self) -> Dict[str, str]:
        """Return a copy of the active abbreviation dictionary."""
        return dict(self._dict)

    def add_abbreviations(self, new_entries: Dict[str, str]) -> None:
        """Register or override abbreviation mappings."""
        for k, v in new_entries.items():
            self._dict[k.strip().lower()] = v.strip().lower()

    def reset_to_defaults(self) -> None:
        """Reset dictionary to the default initial mapping."""
        self._dict = dict(self.DEFAULT_ABBREVIATIONS)

    def expand(self, text: str) -> Tuple[str, List[str]]:
        """
        Expand all abbreviations present in `text` using safe word boundary matching.
        Returns:
            (expanded_text, list_of_audit_change_strings)
        """
        if not text:
            return text, []

        changes: List[str] = []
        current_text = text

        # Sort abbreviations by length descending to match longer tokens first (e.g. 's.s.' before 'ss')
        sorted_abbrs = sorted(self._dict.keys(), key=len, reverse=True)

        for abbr in sorted_abbrs:
            expansion = self._dict[abbr]

            # Construct regex pattern ensuring boundary protection:
            # (?<![a-zA-Z0-9]) matches if not preceded by alphanumeric character
            # (?![a-zA-Z0-9]) matches if not followed by alphanumeric character
            escaped_abbr = re.escape(abbr)
            pattern = rf"(?<![a-zA-Z0-9]){escaped_abbr}(?![a-zA-Z0-9])"

            match = re.search(pattern, current_text, flags=re.IGNORECASE)
            if match:
                # Perform replacement with exact casing handled
                current_text = re.sub(pattern, expansion, current_text, flags=re.IGNORECASE)
                changes.append(f"Expanded abbreviation: {abbr} → {expansion}")

        return current_text, changes


# Global singleton instance
abbreviation_manager = AbbreviationManager()
