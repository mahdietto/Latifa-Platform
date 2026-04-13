export const FABLE_THEMES = [
  { value: "environnement", label: "Environnement", description: "Nature, quartier, village, ville, école" },
  { value: "sante", label: "Santé et bien-être", description: "Maladie, alimentation, soin, médecine, propreté corporelle" },
  { value: "solidarite", label: "Solidarité et citoyenneté", description: "Entraide, respect des autres et des règles sociales" },
  { value: "paix", label: "Paix et tolérance", description: "Respect des différences, vivre en paix, lutte contre la haine" },
  { value: "travail", label: "Travail et loisirs", description: "Métiers, professions, profiter de son temps libre" },
  { value: "cultures", label: "Cultures et découverte du monde", description: "Voyage, modes de vie, traditions, monuments, fêtes nationales" },
  { value: "media", label: "Média", description: "Média" },
  { value: "technologie", label: "Technologie", description: "Technologie" },
  { value: "initiative", label: "Initiative et projets", description: "Initiative et projets" },
] as const;

export type FableThemeValue = (typeof FABLE_THEMES)[number]["value"];

export function normalizeThemeValue(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildThemeOptions(extraValues: string[]) {
  const base = FABLE_THEMES.map((t) => ({ value: t.value, label: t.label }));
  const existing = new Set(base.map((t) => t.value));
  const extras = extraValues
    .map((v) => normalizeThemeValue(v))
    .filter((v) => v && !existing.has(v))
    .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " ") }));
  return [...base, ...extras];
}

export function getThemeLabel(value: string): string {
  return FABLE_THEMES.find((t) => t.value === value)?.label || value;
}
