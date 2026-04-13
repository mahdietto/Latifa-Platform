const CUSTOM_ORIGINS_KEY = "custom_fable_origins_values";
const HIDDEN_ORIGINS_KEY = "hidden_fable_origins_values";
const FABLE_ORIGINS_MAP_KEY = "fable_origin_map";

export const DEFAULT_ORIGINS = [
  { value: "africain", label: "Africain" },
  { value: "chinoise", label: "Chinoise" },
  { value: "canadienne", label: "Canadienne" },
] as const;

export function normalizeOriginValue(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomOrigins(): string[] {
  return readStringArray(CUSTOM_ORIGINS_KEY);
}

export function setCustomOrigins(values: string[]) {
  localStorage.setItem(CUSTOM_ORIGINS_KEY, JSON.stringify(values));
}

export function getHiddenOrigins(): string[] {
  return readStringArray(HIDDEN_ORIGINS_KEY);
}

export function setHiddenOrigins(values: string[]) {
  localStorage.setItem(HIDDEN_ORIGINS_KEY, JSON.stringify(values));
}

export function buildOriginOptions(extraValues: string[], customValues: string[], hiddenValues: string[]) {
  const base = DEFAULT_ORIGINS.map((o) => ({ value: o.value, label: o.label }));
  const existing = new Set(base.map((o) => o.value));
  const extras = [...extraValues, ...customValues]
    .map((v) => normalizeOriginValue(v))
    .filter((v) => v && !existing.has(v))
    .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " ") }));
  return [...base, ...extras].filter((o) => !hiddenValues.includes(o.value));
}

export function getFableOriginMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FABLE_ORIGINS_MAP_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setFableOrigin(fableId: string, origin: string) {
  const next = { ...getFableOriginMap(), [fableId]: normalizeOriginValue(origin) };
  localStorage.setItem(FABLE_ORIGINS_MAP_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("fable-origins-updated"));
}
