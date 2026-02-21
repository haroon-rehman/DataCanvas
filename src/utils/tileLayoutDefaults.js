/**
 * Shared defaults for tile/table layout: row id generation and default templates.
 */

export function generateRowId() {
  return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Default template: 1 row, 1 column, 100% height. Used by Tile Layout view and when widget mounts with empty model. */
export function getDefaultTemplate() {
  return {
    rows: [
      {
        id: generateRowId(),
        height: { kind: "percent", percent: "100%" },
        columns: [{ kind: "auto" }],      
      },
    ],
  };
}
