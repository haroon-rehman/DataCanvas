/**
 * Nested column sizing: percentages defined in config are applied as pixel widths
 * computed from the parent grid item's rendered width.
 *
 * Use when a grid cell contains a nested column layout (e.g. [50, 50]): we measure
 * the cell with ResizeObserver, compute px widths (floor + remainder to last),
 * and expose a grid-template-columns string or width array.
 */

import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  type Ref,
  type ComputedRef,
} from "vue";

/** Result for one cell: pixel width and template string for CSS grid. */
export interface NestedColumnSizingResult {
  cellWidthPx: number;
  gridTemplateColumnsPx: string;
  widthsPx: number[];
}

/**
 * Normalize percentage array so values sum to 100 (proportional scale).
 * If sum is 0 or invalid, returns equal split over length.
 */
export function normalizePercentArray(pct: number[]): number[] {
  if (!Array.isArray(pct) || pct.length === 0) return [];
  const parsed = pct.map((v) => Math.max(0, Number(v) || 0));
  const sum = parsed.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const equal = 100 / parsed.length;
    return parsed.map(() => equal);
  }
  if (Math.abs(sum - 100) < 1e-6) return parsed;
  const scale = 100 / sum;
  return parsed.map((v) => v * scale);
}

/**
 * Compute pixel widths from cell width and percentage column definition.
 * - Math.floor for each column except the last; last gets remainder so total === cellWidthPx.
 * - If cellWidthPx <= 0 or pct invalid, returns empty widths and empty template.
 */
export function computeNestedColumnPxWidths(
  cellWidthPx: number,
  nestedColumnsPct: number[],
): { widthsPx: number[]; gridTemplateColumnsPx: string } {
  if (cellWidthPx <= 0 || !Array.isArray(nestedColumnsPct) || nestedColumnsPct.length === 0) {
    return { widthsPx: [], gridTemplateColumnsPx: "" };
  }
  const pct = normalizePercentArray(nestedColumnsPct);
  if (pct.length === 0) return { widthsPx: [], gridTemplateColumnsPx: "" };

  const n = pct.length;
  const widthsPx: number[] = [];
  let used = 0;
  for (let i = 0; i < n - 1; i++) {
    const w = Math.floor((cellWidthPx * pct[i]) / 100);
    widthsPx.push(w);
    used += w;
  }
  widthsPx.push(Math.max(0, cellWidthPx - used));

  const gridTemplateColumnsPx = widthsPx.map((w) => `${w}px`).join(" ");
  return { widthsPx, gridTemplateColumnsPx };
}

/**
 * Single-cell: observe one element ref and a percentage array, return computed pixel sizing.
 * Recomputes when width or nestedColumnsPct changes. Uses ResizeObserver; updates batched with rAF.
 */
export function useNestedColumnSizing(
  elementRef: Ref<HTMLElement | null | undefined>,
  nestedColumnsPct: Ref<number[]> | ComputedRef<number[]>,
): Ref<NestedColumnSizingResult> {
  const result = ref<NestedColumnSizingResult>({
    cellWidthPx: 0,
    gridTemplateColumnsPx: "",
    widthsPx: [],
  });

  let rafId: number | null = null;
  let observer: ResizeObserver | null = null;

  function update() {
    const el = elementRef.value;
    const pct = nestedColumnsPct.value;
    if (!el || !Array.isArray(pct) || pct.length === 0) {
      result.value = { cellWidthPx: 0, gridTemplateColumnsPx: "", widthsPx: [] };
      return;
    }
    const cellWidthPx = el.getBoundingClientRect().width;
    if (cellWidthPx <= 0) {
      result.value = { cellWidthPx: 0, gridTemplateColumnsPx: "", widthsPx: [] };
      return;
    }
    const { widthsPx, gridTemplateColumnsPx } = computeNestedColumnPxWidths(
      cellWidthPx,
      pct,
    );
    result.value = {
      cellWidthPx,
      gridTemplateColumnsPx,
      widthsPx,
    };
  }

  function scheduleUpdate() {
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      update();
    });
  }

  function attachObserver(el: HTMLElement) {
    if (observer) observer.disconnect();
    observer = new ResizeObserver(scheduleUpdate);
    observer.observe(el);
    scheduleUpdate();
  }

  function disconnectObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  watch(
    elementRef,
    (el) => {
      disconnectObserver();
      if (el && el instanceof HTMLElement) attachObserver(el);
      else result.value = { cellWidthPx: 0, gridTemplateColumnsPx: "", widthsPx: [] };
    },
    { immediate: true },
  );

  watch(nestedColumnsPct, scheduleUpdate, { deep: true });

  onBeforeUnmount(disconnectObserver);

  return result;
}

/**
 * Multi-cell: observe multiple grid cell refs and per-key percentage arrays.
 * Returns reactive Record<key, NestedColumnSizingResult>. Uses one ResizeObserver
 * with batched rAF so many cells don't thrash layout.
 */
export function useNestedColumnSizingMulti(
  cellRefs: Ref<Record<string, HTMLElement | null>>,
  nestedColumnsPctByKey: Ref<Record<string, number[]>> | ComputedRef<Record<string, number[]>>,
): Ref<Record<string, NestedColumnSizingResult>> {
  const results = ref<Record<string, NestedColumnSizingResult>>({});
  let rafId: number | null = null;
  const observer = new ResizeObserver(() => scheduleUpdate());

  function scheduleUpdate() {
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const refs = cellRefs.value;
      const pctByKey = nestedColumnsPctByKey.value;
      const next: Record<string, NestedColumnSizingResult> = {};
      for (const key of Object.keys(refs)) {
        const el = refs[key];
        const pct = pctByKey[key];
        if (!el || !Array.isArray(pct) || pct.length === 0) {
          next[key] = { cellWidthPx: 0, gridTemplateColumnsPx: "", widthsPx: [] };
          continue;
        }
        const cellWidthPx = el.getBoundingClientRect().width;
        if (cellWidthPx <= 0) {
          next[key] = { cellWidthPx: 0, gridTemplateColumnsPx: "", widthsPx: [] };
          continue;
        }
        const { widthsPx, gridTemplateColumnsPx } = computeNestedColumnPxWidths(
          cellWidthPx,
          pct,
        );
        next[key] = { cellWidthPx, gridTemplateColumnsPx, widthsPx };
      }
      results.value = next;
    });
  }

  function syncObserver() {
    const refs = cellRefs.value;
    observer.disconnect();
    Object.values(refs).forEach((el) => {
      if (el && el instanceof HTMLElement) observer.observe(el);
    });
    scheduleUpdate();
  }

  watch(cellRefs, syncObserver, { immediate: true, deep: true });
  watch(nestedColumnsPctByKey, scheduleUpdate, { deep: true });

  onMounted(scheduleUpdate);
  onBeforeUnmount(() => {
    observer.disconnect();
    if (rafId != null) cancelAnimationFrame(rafId);
  });

  return results;
}

/**
 * Observe multiple element refs and return their current widths (getBoundingClientRect().width).
 * Used when parent only needs to pass cellWidthPx to nested TableLayoutWidget; the child
 * computes its own pixel grid template from its column specs.
 */
export function useCellWidths(
  cellRefs: Ref<Record<string, HTMLElement | null>>,
): Ref<Record<string, number>> {
  const widths = ref<Record<string, number>>({});
  let rafId: number | null = null;
  const observer = new ResizeObserver(() => scheduleUpdate());

  function scheduleUpdate() {
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const refs = cellRefs.value;
      const next: Record<string, number> = {};
      for (const key of Object.keys(refs)) {
        const el = refs[key];
        next[key] =
          el && el instanceof HTMLElement ? el.getBoundingClientRect().width : 0;
      }
      widths.value = next;
    });
  }

  function syncObserver() {
    const refs = cellRefs.value;
    observer.disconnect();
    Object.values(refs).forEach((el) => {
      if (el && el instanceof HTMLElement) observer.observe(el);
    });
    scheduleUpdate();
  }

  watch(cellRefs, syncObserver, { immediate: true, deep: true });
  onMounted(scheduleUpdate);
  onBeforeUnmount(() => {
    observer.disconnect();
    if (rafId != null) cancelAnimationFrame(rafId);
  });

  return widths;
}
