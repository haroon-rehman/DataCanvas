# Z-Index Reference: Component Layering

## Overview

This document lists all z-index values used across the dashboard components to ensure proper layering of UI elements.

## Z-Index Hierarchy (Lowest to Highest)

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Base Grid Elements (z-index: 1)                 │
├─────────────────────────────────────────────────────────────┤
│  • DashboardDesignerWidget: .grid-cell                      │
│    z-index: 1                                               │
│    Purpose: Base layer for grid cells                       │
│                                                             │
│  • GridstackWidget: .grid-overlay-wrapper                   │
│    z-index: 1                                               │
│    Purpose: Grid overlay container (dashed grid lines)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Action Buttons (z-index: 10)                     │
├─────────────────────────────────────────────────────────────┤
│  • DashboardDesignerWidget: .row-action-buttons            │
│    z-index: 10                                              │
│    Purpose: Row settings gear button (top-left of first cell)│
│                                                             │
│  • DashboardDesignerWidget: .cell-action-buttons            │
│    z-index: 10                                              │
│    Purpose: Cell settings gear + Add Widget plus buttons   │
│             (top-right of each cell)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Bootstrap Offcanvas Default (z-index: 1045)      │
├─────────────────────────────────────────────────────────────┤
│  • Bootstrap 5 default offcanvas z-index                    │
│    Note: Our offcanvases override this with 1060           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Offcanvas Backdrops (z-index: 1059)              │
├─────────────────────────────────────────────────────────────┤
│  • GridstackWidget: .gridstack-offcanvas-backdrop          │
│    z-index: 1059 !important                                 │
│    Purpose: Backdrop for GridstackWidget's Add Widget      │
│             offcanvas                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: All Offcanvases (z-index: 1060)                  │
├─────────────────────────────────────────────────────────────┤
│  • DashboardDesignerWidget: .offcanvas-row-editor          │
│    z-index: 1060 !important                                 │
│    Purpose: Row Settings offcanvas                         │
│                                                             │
│  • DashboardDesignerWidget: .offcanvas-column-editor        │
│    z-index: 1060 !important                                 │
│    Purpose: Column/Cell Settings offcanvas                 │
│                                                             │
│  • DashboardDesignerWidget: .offcanvas-widgets-selector    │
│    z-index: 1060 !important                                 │
│    Purpose: Widgets Selector offcanvas (Add Widget)        │
│                                                             │
│  • GridstackWidget: .gridstack-add-widget-offcanvas        │
│    z-index: 1060 !important                                 │
│    Purpose: GridstackWidget's Add Widget offcanvas         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 6: PropertyGridWidget (z-index: 2000)               │
├─────────────────────────────────────────────────────────────┤
│  • PropertyGridWidget: .property-grid-offcanvas            │
│    z-index: 2000 !important                                 │
│    Purpose: Property editor offcanvas (highest priority)    │
│                                                             │
│  • PropertyGridWidget: .property-grid-backdrop             │
│    z-index: 1999 !important                                 │
│    Purpose: PropertyGridWidget backdrop                     │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Z-Index Values by Component

### DashboardDesignerWidget.vue

| Element | Z-Index | Location | Purpose |
|---------|---------|----------|---------|
| `.grid-cell` | `1` | CSS (line 1748) | Base layer for grid cells |
| `.row-action-buttons` | `10` | CSS (line 1813) | Row settings gear button |
| `.cell-action-buttons` | `10` | CSS (line 1829) | Cell settings + Add Widget buttons |
| `.offcanvas-row-editor` | `1060 !important` | CSS (line 1942) + inline style | Row Settings offcanvas |
| `.offcanvas-column-editor` | `1060 !important` | CSS (line 1942) + inline style | Column Settings offcanvas |
| `.offcanvas-widgets-selector` | `1060 !important` | CSS (line 1942) + inline style | Widgets Selector offcanvas |

**Inline Styles:**
- Row Editor: `zIndex: 1060` (line 1143)
- Column Editor: `zIndex: 1060` (line 1357)
- Widgets Selector: `zIndex: 1060` (line 1651)

### GridstackWidget.vue

| Element | Z-Index | Location | Purpose |
|---------|---------|----------|---------|
| `.grid-overlay-wrapper` | `1` | CSS (line 564) | Grid overlay container |
| `.gridstack-add-widget-offcanvas` | `1060 !important` | CSS (line 611) + inline style | Add Widget offcanvas |
| `.gridstack-offcanvas-backdrop` | `1059 !important` | CSS (line 615) + inline style | Offcanvas backdrop |

**Inline Styles:**
- Add Widget Offcanvas: `zIndex: 1060` (line 488)
- Offcanvas Backdrop: `z-index: 1059` (line 544)

### PropertyGridWidget.vue

| Element | Z-Index | Location | Purpose |
|---------|---------|----------|---------|
| `.property-grid-offcanvas` | `2000 !important` | CSS + inline style | Property editor offcanvas |
| `.property-grid-backdrop` | `1999 !important` | CSS + inline style | Offcanvas backdrop |

**Inline Styles:**
- PropertyGridWidget Offcanvas: `zIndex: 2000` (line 78)
- PropertyGridWidget Backdrop: `z-index: 1999` (line 185)

**Note:** PropertyGridWidget uses z-index 2000 to ensure it appears above all other offcanvases (Row Editor, Column Editor, Widgets Selector, GridstackWidget Add Widget).

### DashboardDesignerView.vue

| Element | Z-Index | Location | Purpose |
|---------|---------|----------|---------|
| (No explicit z-index) | N/A | - | Container component |

## Bootstrap Default Z-Index Values

Bootstrap 5 uses these default z-index values:

| Component | Z-Index |
|-----------|---------|
| Offcanvas backdrop | `1040` |
| Offcanvas | `1045` |
| Modal backdrop | `1050` |
| Modal | `1055` |
| Popover | `1070` |
| Tooltip | `1080` |

## Why These Values?

### z-index: 1 (Base Layer)
- Grid cells and overlays need to be above the canvas but below interactive elements
- Creates a base stacking context for grid content

### z-index: 10 (Action Buttons)
- Buttons need to be above grid cells for clickability
- Low enough to stay below offcanvases

### z-index: 1059 (Backdrop)
- Just below offcanvas (1060) to create proper layering
- Ensures backdrop appears above grid overlays but below offcanvas content

### z-index: 1060 (Offcanvases)
- Above Bootstrap's default offcanvas (1045) to ensure they appear above grid overlays
- High enough to be above all grid elements and buttons
- Below PropertyGridWidget (2000) to allow property editing to take priority

### z-index: 2000 (PropertyGridWidget)
- Highest z-index to ensure property editor always appears above all other offcanvases
- Allows users to edit widget properties even when other offcanvases are open
- Backdrop uses 1999 (one below offcanvas)

## Stacking Context Notes

1. **Grid Cells** (z-index: 1)
   - Create a stacking context for cell content
   - Action buttons (z-index: 10) are children of cells but appear above

2. **Offcanvases** (z-index: 1060)
   - Rendered at component root level
   - Use `!important` to override Bootstrap defaults
   - Must be above all grid overlays and buttons

3. **PropertyGridWidget**
   - Rendered at DashboardDesignerView level
   - Uses Bootstrap default (1045)
   - Doesn't conflict because it's outside the grid stacking context

## Visual Layering Order

```
┌─────────────────────────────────────────┐
│  All Offcanvases (1060)                 │  ← Custom (above Bootstrap)
│  • Row Editor                            │
│  • Column Editor                         │
│  • Widgets Selector                      │
│  • GridstackWidget Add Widget            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  PropertyGridWidget (2000)              │  ← Highest priority
│  (Rendered at DashboardDesignerView)     │
│  • Property editor offcanvas             │
│  • Backdrop (1999)                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Offcanvas Backdrop (1059)              │  ← GridstackWidget only
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Action Buttons (10)                    │  ← Row/Cell buttons
│  • Row settings gear                     │
│  • Cell settings gear                    │
│  • Add Widget plus                       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Base Grid Elements (1)                 │  ← Grid cells & overlays
│  • Grid cells                            │
│  • Grid overlay (dashed lines)           │
└─────────────────────────────────────────┘
```

## Maintenance Notes

- **All offcanvases use 1060** for consistency
- **Backdrop uses 1059** (one below offcanvas)
- **Action buttons use 10** (above grid, below offcanvases)
- **Grid elements use 1** (base layer)

If adding new overlays or modals:
- Use z-index: 1061+ for elements that must appear above offcanvases
- Use z-index: 9 or below for elements that should appear below buttons
- Avoid values between 11-1058 to prevent conflicts
