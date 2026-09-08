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
