/**
 * Normalize color value for consistent display/storage:
 * - Hex format (#xxx or #xxxxxx): convert to uppercase (e.g. #f8f9fa → #F8F9FA)
 * - Color names: convert to title case (e.g. dark orange → Dark Orange)
 * - Gradients (linear-gradient, radial-gradient): leave unchanged
 * - rgb/rgba: leave unchanged
 */
export function normalizeColorValue(value) {
  if (value == null || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (/^linear-gradient\(|^radial-gradient\(/i.test(trimmed)) return value;

  if (trimmed.startsWith("#")) {
    return trimmed.toUpperCase();
  }

  if (/^rgb/i.test(trimmed)) return value;

  return trimmed
    .split(/\s+/)
    .map((word) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word,
    )
    .join(" ");
}
