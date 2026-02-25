/**
 * Utilities for validating and generating unique widget names.
 * Ensures two widgets of the same type in a dashboard cannot have the same name.
 */

/** Collect uniqueName values from IconValueWidgets in a flat widgets array (GridLayout). */
export function collectIconValueUniqueNames(widgets) {
  const names = new Set();
  if (!Array.isArray(widgets)) return names;
  for (const w of widgets) {
    if (w?.type === "IconValueWidget" && w?.uniqueName) {
      names.add(String(w.uniqueName).trim());
    }
  }
  return names;
}

/** Collect uniqueName values from IconValueWidgets in a layout (TileLayout, recursive). */
export function collectIconValueUniqueNamesFromLayout(layout) {
  const names = new Set();
  if (!layout?.rows) return names;
  for (const row of layout.rows) {
    for (const col of row.columns || []) {
      const content = col?.content;
      if (content?.type === "IconValueWidget" && content?.props?.uniqueName) {
        names.add(String(content.props.uniqueName).trim());
      }
      if (content?.type === "TileLayoutWidget" && content?.props?.rows) {
        const nested = collectIconValueUniqueNamesFromLayout({
          rows: content.props.rows,
        });
        nested.forEach((n) => names.add(n));
      }
    }
  }
  return names;
}

/** Generate a unique IconValue name that does not collide with existing names. */
export function generateUniqueIconValueName(existingNames) {
  const set = existingNames instanceof Set ? existingNames : new Set(existingNames || []);
  let name;
  let attempts = 0;
  do {
    name = `IconValue${Math.floor(Math.random() * 1e9)}`;
    attempts++;
    if (attempts > 100) break; // fallback to avoid infinite loop
  } while (set.has(name));
  return name;
}
