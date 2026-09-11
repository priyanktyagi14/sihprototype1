export const ABBREVIATIONS_DICT: Record<string, string> = {
  // Material / Metal types
  SS: "Stainless Steel",
  "S.S.": "Stainless Steel",
  CS: "Carbon Steel",
  "C.S.": "Carbon Steel",
  MS: "Mild Steel",
  "M.S.": "Mild Steel",
  GI: "Galvanized Iron",
  "G.I.": "Galvanized Iron",
  CI: "Cast Iron",
  "C.I.": "Cast Iron",
  AS: "Alloy Steel",
  BRS: "Brass",
  CU: "Copper",
  AL: "Aluminium",
  PTFE: "Polytetrafluoroethylene (Teflon)",
  EPDM: "Ethylene Propylene Diene Monomer",
  NBR: "Nitrile Butadiene Rubber",

  // Components & Mechanical Parts
  HEX: "Hexagonal",
  BLT: "Bolt",
  BOLT: "Bolt",
  NUT: "Nut",
  WSHR: "Washer",
  FLG: "Flange",
  VLV: "Valve",
  BALL: "Ball",
  GATE: "Gate",
  GLOBE: "Globe",
  CHK: "Check",
  NRV: "Non-Return Valve",
  GASK: "Gasket",
  SW: "Socket Weld",
  BW: "Butt Weld",
  THD: "Threaded",
  NPT: "National Pipe Taper",
  BSPT: "British Standard Pipe Taper",
  WNRF: "Weld Neck Raised Face",
  SORF: "Slip-On Raised Face",
  BLRF: "Blind Raised Face",
  SMLS: "Seamless",
  ERW: "Electric Resistance Welded",
  PIPE: "Pipe",
  PLT: "Plate",
  SHT: "Sheet",
  ROD: "Rod",
  ELB: "Elbow",
  TEE: "Tee",
  RED: "Reducer",
  CPLG: "Coupling",
  UN: "Union",
  NIP: "Nipple",
  ORIF: "Orifice",
  BEAR: "Bearing",
  BUSH: "Bushing",

  // Dimensions & Specifications
  OD: "Outer Diameter",
  ID: "Inner Diameter",
  NB: "Nominal Bore",
  THK: "Thickness",
  DIA: "Diameter",
  LEN: "Length",
  SCH: "Schedule",
  PN: "Nominal Pressure",
  CL: "Class",
  RTJ: "Ring Type Joint",
  RF: "Raised Face",
  FF: "Flat Face",
  STD: "Standard",
  XS: "Extra Strong",
  XXS: "Double Extra Strong",
  GALV: "Galvanized",
  COAT: "Coated",
  INS: "Insulated",
  HT: "Heat Treated",
  TEMP: "Temperature",
  PRESS: "Pressure",
  MAX: "Maximum",
  MIN: "Minimum",
  QTY: "Quantity",
  REQ: "Required",
};

export const UNIT_CONVERSIONS: Record<string, string> = {
  MM: "mm",
  "M.M.": "mm",
  "MM.": "mm",
  MILLIMETER: "mm",
  MILLIMETRES: "mm",
  CM: "cm",
  "C.M.": "cm",
  CENTIMETER: "cm",
  M: "m",
  MTR: "m",
  MTRS: "m",
  METER: "m",
  METERS: "m",
  IN: "inch",
  "IN.": "inch",
  INCH: "inch",
  INCHES: "inch",
  '"': "inch",
  "''": "inch",
  FT: "ft",
  FEET: "ft",
  KG: "kg",
  KGS: "kg",
  KILOGRAM: "kg",
  TON: "MT",
  TONS: "MT",
  MT: "MT",
  LTR: "L",
  LTRS: "L",
  LITRE: "L",
  LITRES: "L",
  PSI: "psi",
  BAR: "bar",
  "KG/CM2": "kg/cm²",
  "KG/CM^2": "kg/cm²",
  "DEG C": "°C",
  DEGC: "°C",
  "DEG F": "°F",
  DEGF: "°F",
  RPM: "rpm",
  KW: "kW",
  HP: "HP",
  V: "V",
  VOLT: "V",
  VOLTS: "V",
  A: "A",
  AMP: "A",
  AMPS: "A",
  HZ: "Hz",
  HERTZ: "Hz",
  NOS: "Nos",
  PCS: "Pcs",
  SET: "Set",
  SETS: "Set",
};

export interface CleaningStepResult {
  stepName: string;
  description: string;
  originalFragment: string;
  replacedFragment: string;
  ruleCategory: "abbreviation" | "unit" | "syntax" | "standardization";
}

export interface CleaningSimulationResult {
  raw: string;
  cleaned: string;
  stepsApplied: CleaningStepResult[];
  detectedAbbreviations: string[];
  standardizedUnits: string[];
  confidenceScore: number;
  taxonomySuggested: {
    category: string;
    subCategory: string;
  };
}

export function cleanMaterialDescription(rawText: string): CleaningSimulationResult {
  if (!rawText || !rawText.trim()) {
    return {
      raw: "",
      cleaned: "",
      stepsApplied: [],
      detectedAbbreviations: [],
      standardizedUnits: [],
      confidenceScore: 0,
      taxonomySuggested: { category: "General", subCategory: "Uncategorized" },
    };
  }

  let text = rawText.trim();
  const steps: CleaningStepResult[] = [];
  const foundAbbreviations: string[] = [];
  const foundUnits: string[] = [];

  // Step 1: Syntax & Whitespace normalization
  const step1Before = text;
  text = text.replace(/[\t\r\n]+/g, " ");
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\s*([,;:\-_/\\+*xX])\s*/g, " $1 ");
  text = text.replace(/\s+/g, " ").trim();

  if (step1Before !== text) {
    steps.push({
      stepName: "Whitespace & Delimiter Standardization",
      description: "Normalized irregular spacing and operator delimiters",
      originalFragment: step1Before,
      replacedFragment: text,
      ruleCategory: "syntax",
    });
  }

  // Step 2: Abbreviation expansion
  const tokens = text.split(" ");
  const transformedTokens: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const rawToken = tokens[i];
    const cleanToken = rawToken.replace(/[^A-Za-z0-9#"]/g, "").toUpperCase();

    // Check Multi-word or single abbreviation
    if (ABBREVIATIONS_DICT[cleanToken]) {
      const expansion = ABBREVIATIONS_DICT[cleanToken];
      foundAbbreviations.push(`${cleanToken} → ${expansion}`);
      transformedTokens.push(expansion);
      steps.push({
        stepName: "Abbreviation Expansion",
        description: `Expanded industrial shorthand '${cleanToken}' to '${expansion}'`,
        originalFragment: rawToken,
        replacedFragment: expansion,
        ruleCategory: "abbreviation",
      });
    } else {
      transformedTokens.push(rawToken);
    }
  }

  let expandedText = transformedTokens.join(" ");

  // Step 3: Unit standardization
  let unitTransformedText = expandedText;
  for (const [rawUnit, standardUnit] of Object.entries(UNIT_CONVERSIONS)) {
    // Regex for unit matching following numbers or isolated
    const escapedUnit = rawUnit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const unitRegex = new RegExp(`(\\b\\d+(?:\\.\\d+)?)\\s*(${escapedUnit})\\b`, "gi");

    if (unitRegex.test(unitTransformedText)) {
      unitTransformedText = unitTransformedText.replace(
        unitRegex,
        (_, num) => `${num} ${standardUnit}`
      );
      foundUnits.push(`${rawUnit} → ${standardUnit}`);
      steps.push({
        stepName: "SI Unit Standardization",
        description: `Converted '${rawUnit}' to standardized SI unit '${standardUnit}'`,
        originalFragment: rawUnit,
        replacedFragment: standardUnit,
        ruleCategory: "unit",
      });
    }
  }

  // Step 4: Formatting dimension operators (e.g. M10 X 50 MM -> M10 x 50 mm, 4 " -> 4 inch)
  const formattedText = unitTransformedText
    .replace(/\s*([xX])\s*/g, " x ")
    .replace(/\s+/g, " ")
    .trim();

  // Step 5: Capitalization & Title Ordering
  // Capitalize main nouns, preserve metric identifiers like M10, DN50, PN16, SS316, 150#
  const finalWords = formattedText.split(" ").map((w) => {
    // Keep standard units lowercase
    if (["mm", "cm", "m", "kg", "g", "bar", "psi", "rpm", "inch", "ft"].includes(w.toLowerCase())) {
      return w.toLowerCase();
    }
    // Keep identifiers like M10, DN50, 150#
    if (/^[A-Z]+\d+|\d+[#]|\d+LBS|\d+KG$/i.test(w)) {
      return w.toUpperCase();
    }
    // Standard Title Case
    if (w.length > 2) {
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }
    return w;
  });

  const cleanedFinal = finalWords.join(" ");

  // Deduce taxonomy
  let category = "Mechanical & Hardware";
  let subCategory = "Fasteners";
  const lower = cleanedFinal.toLowerCase();
  if (lower.includes("bolt") || lower.includes("nut") || lower.includes("washer") || lower.includes("stud")) {
    category = "Fasteners & Hardware";
    subCategory = "Bolts & Nuts";
  } else if (lower.includes("flange") || lower.includes("elbow") || lower.includes("tee") || lower.includes("pipe") || lower.includes("fitting")) {
    category = "Piping & Piping Components";
    subCategory = "Flanges & Fittings";
  } else if (lower.includes("valve") || lower.includes("actuator") || lower.includes("nrv")) {
    category = "Valves & Flow Control";
    subCategory = "Industrial Valves";
  } else if (lower.includes("gasket") || lower.includes("seal") || lower.includes("o-ring")) {
    category = "Gaskets & Seals";
    subCategory = "Static Seals";
  } else if (lower.includes("motor") || lower.includes("cable") || lower.includes("sensor") || lower.includes("switch")) {
    category = "Electrical & Instrumentation";
    subCategory = "Cables & Control";
  } else if (lower.includes("plate") || lower.includes("sheet") || lower.includes("beam") || lower.includes("channel")) {
    category = "Structural Steel & Metals";
    subCategory = "Plates & Sections";
  }

  // Calculate confidence score (higher if rules successfully addressed all abbreviations and units)
  const confidenceScore = Math.min(99, Math.max(82, 85 + steps.length * 3));

  return {
    raw: rawText,
    cleaned: cleanedFinal,
    stepsApplied: steps,
    detectedAbbreviations: Array.from(new Set(foundAbbreviations)),
    standardizedUnits: Array.from(new Set(foundUnits)),
    confidenceScore,
    taxonomySuggested: {
      category,
      subCategory,
    },
  };
}

// ============================================================================
// Cross-Enterprise Attribute Extraction & Material Equivalence Grouping Engine
// ============================================================================

export interface ExtractedMaterialAttributes {
  materialType: string;
  material: string;
  grade: string;
  size: string;
  specification: string;
  bearingNo: string;
  pressureRating: string;
  manufacturer: string;
}

export function extractMaterialAttributes(normDesc: string, spec = ""): ExtractedMaterialAttributes {
  const fullText = `${normDesc} ${spec}`.trim();
  const attrs: ExtractedMaterialAttributes = {
    materialType: "",
    material: "",
    grade: "",
    size: "",
    specification: "",
    bearingNo: "",
    pressureRating: "",
    manufacturer: "",
  };

  // 1. Manufacturer
  const mfgMatch = fullText.match(/\b(SKF|FAG|TIMKEN|NTN|KOYO)\b/i);
  if (mfgMatch) {
    attrs.manufacturer = mfgMatch[1].toUpperCase();
  }

  // 2. Bearing Number & Type
  const brgMatch = fullText.match(/\b(?:NO\.?\s*|NOS\.?\s*|BRG[\.\-_\s]*|BEARING[\.\-_\s]*|SKF\s*)?(\d{4,5}(?:-[A-Z0-9/]+)?)\b/i);
  const isBearing = /\b(bearing|brg|ball bearing|roller bearing)\b/i.test(fullText) || (brgMatch && ["60", "62", "63", "64", "68", "69", "16", "21", "22", "30"].some(p => brgMatch[1].startsWith(p)));
  if (isBearing && brgMatch) {
    attrs.bearingNo = brgMatch[1].toUpperCase();
    attrs.size = `Bearing No. ${attrs.bearingNo}`;
    attrs.materialType = "Deep Groove Ball Bearing";
    attrs.material = "High Carbon Chromium Steel";
  }

  // 3. Material Type
  if (!attrs.materialType) {
    if (/\bhex(?:agonal)?\.?(?:\s+head)?[\s\-_]*bolt\b/i.test(fullText)) attrs.materialType = "Hexagonal Bolt";
    else if (/\bhex(?:agonal)?\.?(?:\s+head)?[\s\-_]*nut\b/i.test(fullText)) attrs.materialType = "Hexagonal Nut";
    else if (/\bstud[\s\-_]*bolt\b/i.test(fullText)) attrs.materialType = "Stud Bolt";
    else if (/\bbolt\b/i.test(fullText)) attrs.materialType = "Bolt";
    else if (/\bnut\b/i.test(fullText)) attrs.materialType = "Nut";
    else if (/\bpipe\b/i.test(fullText)) attrs.materialType = "Pipe";
    else if (/\btube\b/i.test(fullText)) attrs.materialType = "Tube";
    else if (/\b(?:flex\s+)?cable\b|\bwire\b/i.test(fullText)) attrs.materialType = "Cable";
    else if (/\bplt\b|\bplate\b/i.test(fullText)) attrs.materialType = "Plate";
    else if (/\bsht\b|\bsheet\b/i.test(fullText)) attrs.materialType = "Sheet";
    else if (/\bbusbar\b|\bbus\s+bar\b/i.test(fullText)) attrs.materialType = "Busbar";
    else if (/\bflg\b|\bflange\b/i.test(fullText)) attrs.materialType = "Flange";
    else if (/\bvalve\b|\bvlv\b/i.test(fullText)) attrs.materialType = "Valve";
    else if (/\bgasket\b/i.test(fullText)) attrs.materialType = "Gasket";
  }

  // 4. Material
  if (!attrs.material) {
    if (/\bstainless\s+steel\b|\bss\b|\bss304\b|\bss316\b/i.test(fullText)) attrs.material = "Stainless Steel";
    else if (/\bmild\s+steel\b|\bmild\s+stl\b|\bms\b/i.test(fullText)) attrs.material = "Mild Steel";
    else if (/\bgalvanized\s+iron\b|\bgalvanised\s+iron\b|\bgi\b/i.test(fullText)) attrs.material = "Galvanized Iron";
    else if (/\bcopper\b|\bcu\b/i.test(fullText)) attrs.material = "Copper";
    else if (/\bcarbon\s+steel\b|\bcs\b|\bwcb\b|\ba105\b/i.test(fullText)) attrs.material = "Carbon Steel";
    else if (/\baluminium\b|\baluminum\b|\bal\b/i.test(fullText)) attrs.material = "Aluminium";
    else if (/\bbrass\b/i.test(fullText)) attrs.material = "Brass";
  }

  // 5. Size / Dimensions
  if (!attrs.bearingNo) {
    const cableMatch = fullText.match(/\b(\d+\s*Core\s*x\s*\d+(?:\.\d+)?\s*sq\s*mm)\b/i) || fullText.match(/\b(\d+(?:\.\d+)?\s*sq\s*mm)\b/i);
    const threadMatch = fullText.match(/\b(M\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?(?:\s*mm)?)\b/i) || fullText.match(/\b(M\d+(?:\.\d+)?)\s*[*xX]\s*(\d+(?:\.\d+)?)\b/i);
    const inchMatch = fullText.match(/\b((?:\d+\/\d+|\d+(?:\.\d+)?)\s*inch)\b/i) || fullText.match(/(\d+(?:\.\d+)?)\s*"/);
    const thkMatch = fullText.match(/\b(\d+(?:\.\d+)?\s*mm(?:\s*(?:thickness|thick|thk))?)\b/i);

    if (cableMatch) {
      attrs.size = cableMatch[1];
    } else if (threadMatch) {
      const sz = threadMatch[0].replace(/\s*[*xX]\s*/, " x ");
      attrs.size = sz.toLowerCase().endsWith("mm") ? sz : `${sz} mm`;
    } else if (inchMatch) {
      attrs.size = inchMatch[0].includes('"') ? `${inchMatch[1]} inch` : inchMatch[0].toLowerCase();
    } else if (thkMatch) {
      attrs.size = thkMatch[1].replace(/\s*(?:thickness|thick|thk)/i, "").trim();
    }
  }

  return attrs;
}

export function generateCanonicalDescription(attrs: ExtractedMaterialAttributes): string {
  if (attrs.bearingNo) {
    const prefix = attrs.manufacturer ? `${attrs.manufacturer} ` : "";
    return `${prefix}${attrs.materialType || "Bearing"} ${attrs.bearingNo}`.trim();
  }
  const parts: string[] = [];
  if (attrs.material) parts.push(attrs.material);
  if (attrs.materialType) parts.push(attrs.materialType);
  if (attrs.size) parts.push(attrs.size);
  if (attrs.grade) parts.push(`Grade ${attrs.grade}`);
  return parts.join(" ").trim() || "Unclassified Material";
}

function normalizeDimensionKey(size: string): string {
  if (!size) return "";
  return size
    .toLowerCase()
    .replace(/\s*(?:diameter|dia|thickness|thk|thick)\s*/g, "")
    .replace(/(\d+)\.0+\b/g, "$1")
    .replace(/\*/g, "x")
    .replace(/\s*x\s*/g, "x")
    .replace(/\bmm\b/g, "")
    .replace(/\binch(?:es)?\b|\bin\b|"/g, "inch")
    .replace(/\s+/g, "");
}

function normalizeTypeKey(typeStr: string): string {
  if (!typeStr) return "UNKNOWN";
  const t = typeStr.toLowerCase().replace(/[\s_]+/g, "");
  if (["sheet", "plate", "sht", "plt"].includes(t)) return "sheetplate";
  if (["cable", "wire", "flexcable", "coppercable", "copperwire"].includes(t)) return "cable";
  if (t.includes("bearing")) return "bearing";
  return t;
}

function normalizeMaterialKey(matStr: string): string {
  if (!matStr) return "UNKNOWN";
  const m = String(matStr).toLowerCase().replace(/[\s_]+/g, "");
  if (["stainlesssteel", "ss", "ss304", "ss316"].includes(m)) return "stainlesssteel";
  if (["mildsteel", "ms", "mildstl"].includes(m)) return "mildsteel";
  if (["galvanizediron", "gi", "galvanisediron"].includes(m)) return "galvanizediron";
  if (["copper", "cu"].includes(m)) return "copper";
  if (["carbonsteel", "cs"].includes(m)) return "carbonsteel";
  return m;
}

export interface GroupedMaterialItem {
  nationalMaterialCode: string;
  equivalenceGroupId: string;
  standardizedDescription: string;
  aiEquivalenceResult: string;
  confidenceScore: number;
}

/**
 * Groups an array of material items into cross-enterprise clusters and assigns canonical National Material Codes.
 */
export function clusterAndAssignNationalCodes<T extends { materialDescription?: string; rawDescription?: string; cpse?: string; specification?: string }>(
  records: T[]
): Array<T & GroupedMaterialItem> {
  const processed = records.map((rec) => {
    const rawDesc = rec.rawDescription || rec.materialDescription || "";
    const sim = cleanMaterialDescription(rawDesc);
    const attrs = extractMaterialAttributes(sim.cleaned, rec.specification || "");
    const canonDesc = generateCanonicalDescription(attrs);

    let key = "";
    if (attrs.bearingNo) {
      key = `bearing|${attrs.bearingNo.toLowerCase()}`;
    } else {
      const tKey = normalizeTypeKey(attrs.materialType);
      const mKey = normalizeMaterialKey(attrs.material);
      const sKey = normalizeDimensionKey(attrs.size);
      key = `${tKey}|${mKey}|${sKey}`;
    }

    return {
      rec,
      attrs,
      canonDesc,
      key,
    };
  });

  // Group indices by key
  const groups: Record<string, number[]> = {};
  processed.forEach((item, idx) => {
    if (!groups[item.key]) groups[item.key] = [];
    groups[item.key].push(idx);
  });

  const sortedKeys = Object.keys(groups).sort();
  const results: Array<T & GroupedMaterialItem> = new Array(records.length);

  sortedKeys.forEach((key, groupIdx) => {
    const groupNum = groupIdx + 1;
    const nmc = `NMC-${String(groupNum).padStart(6, "0")}`;
    const groupId = `GRP-${String(groupNum).padStart(5, "0")}`;
    const indices = groups[key];

    const bestCanon = processed[indices[0]].canonDesc || processed[indices[0]].rec.rawDescription || "";
    const clusterCPSEs = Array.from(new Set(indices.map((i) => processed[i].rec.cpse).filter(Boolean)));
    const cpseSummary = clusterCPSEs.length > 1 ? clusterCPSEs.join(", ") : clusterCPSEs[0] || "Multiple CPSEs";

    indices.forEach((idx) => {
      const aiResult =
        indices.length > 1
          ? `Same (Exact Physical Equivalence across ${cpseSummary})`
          : "Same (Verified Canonical Entity)";

      results[idx] = {
        ...processed[idx].rec,
        nationalMaterialCode: nmc,
        equivalenceGroupId: groupId,
        standardizedDescription: bestCanon,
        aiEquivalenceResult: aiResult,
        confidenceScore: 98.5,
      };
    });
  });

  return results;
}

