// Marketing copy + monogram per exam category. Not in the DB — the DB holds
// price/duration/grants; this is the human-facing framing that sits on top.
// Keyed by ExamCategory enum value (string at runtime).
export type CategoryMeta = {
  label: string;
  monogram: string; // 2–3 letters shown in the card avatar
  features: string[]; // 3 selling points shown as ticks
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  ASSAM_TET: {
    label: "Assam TET",
    monogram: "TET",
    features: ["Paper I & II mocks", "Sectional drills", "PYQ solutions"],
  },
  ADRE: {
    label: "ADRE",
    monogram: "AD",
    features: ["Grade III & IV mocks", "Assam GK focus", "Previous year papers"],
  },
  ASSAM_POLICE: {
    label: "Assam Police",
    monogram: "PO",
    features: ["SI & Constable mocks", "Physical test notes", "Reasoning drills"],
  },
  APSC: {
    label: "APSC",
    monogram: "AP",
    features: ["Prelims & Mains mocks", "CSAT practice", "Answer writing"],
  },
  OTHER: { label: "Other", monogram: "EX", features: [] },
};

export function catMeta(category: string): CategoryMeta {
  return (
    CATEGORY_META[category] ?? {
      label: category,
      monogram: category.slice(0, 2).toUpperCase(),
      features: [],
    }
  );
}

// stable display order for the unlock grid regardless of DB row order
export const CATEGORY_ORDER = ["ASSAM_TET", "ADRE", "ASSAM_POLICE", "APSC"];
