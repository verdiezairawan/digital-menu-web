export type RawMaterialUnit = "kg" | "g" | "ltr" | "ml" | "pcs";

export type RawMaterial = {
  id: string;
  name: string;
  category: string;
  unit: RawMaterialUnit;
  unitCost: number;
  stock: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export const EMPTY_RAW_MATERIALS: RawMaterial[] = [];

export type RawMaterialInput = {
  name: string;
  category?: string;
  unit: RawMaterialUnit;
  unitCost?: number;
  stock?: number;
  notes?: string;
};

export const RAW_MATERIAL_UNITS: Array<{ value: RawMaterialUnit; label: string }> = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "ltr", label: "ltr" },
  { value: "ml", label: "ml" },
  { value: "pcs", label: "pcs" },
];

const STORAGE_KEY = "dm:raw-materials:v1";
const STORE_EVENT_NAME = "dm:raw-materials:changed";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toUnit(value: unknown): RawMaterialUnit | null {
  if (value === "kg" || value === "g" || value === "ltr" || value === "ml" || value === "pcs") {
    return value;
  }
  return null;
}

function normalizeRawMaterial(value: unknown): RawMaterial | null {
  if (!isRecord(value)) return null;

  const unit = toUnit(value.unit);
  if (!unit) return null;

  const id = toString(value.id).trim();
  const name = toString(value.name).trim();

  if (!id || !name) return null;

  const now = Date.now();

  return {
    id,
    name,
    category: toString(value.category).trim(),
    unit,
    unitCost: Math.max(0, toNumber(value.unitCost)),
    stock: Math.max(0, toNumber(value.stock)),
    notes: toString(value.notes).trim(),
    createdAt: toNumber(value.createdAt, now),
    updatedAt: toNumber(value.updatedAt, now),
  };
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

let cachedRaw: string | null | undefined;
let cachedMaterials: RawMaterial[] = EMPTY_RAW_MATERIALS;

function safeGetLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseRawMaterials(raw: string | null): RawMaterial[] {
  if (!raw) return EMPTY_RAW_MATERIALS;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_RAW_MATERIALS;

    const normalized = parsed
      .map(normalizeRawMaterial)
      .filter((item): item is RawMaterial => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return normalized.length > 0 ? normalized : EMPTY_RAW_MATERIALS;
  } catch {
    return EMPTY_RAW_MATERIALS;
  }
}

export function readRawMaterials(): RawMaterial[] {
  const raw = safeGetLocalStorage(STORAGE_KEY);
  if (raw === cachedRaw) return cachedMaterials;

  cachedRaw = raw;
  cachedMaterials = parseRawMaterials(raw);
  return cachedMaterials;
}

export function writeRawMaterials(items: RawMaterial[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(STORE_EVENT_NAME));
  } catch {
    // ignore write errors (private mode, quota, etc.)
  }
}

export function addRawMaterial(input: RawMaterialInput): RawMaterial {
  const now = Date.now();
  const material: RawMaterial = {
    id: createId(),
    name: input.name.trim(),
    category: input.category?.trim() ?? "",
    unit: input.unit,
    unitCost: Math.max(0, input.unitCost ?? 0),
    stock: Math.max(0, input.stock ?? 0),
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  const current = readRawMaterials();
  writeRawMaterials([material, ...current]);
  return material;
}

export function subscribeRawMaterials(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => onStoreChange();

  window.addEventListener(STORE_EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORE_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function refreshRawMaterials() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORE_EVENT_NAME));
}

export function getRawMaterialsServerSnapshot(): RawMaterial[] {
  return EMPTY_RAW_MATERIALS;
}
