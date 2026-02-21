# Component Flow: DashboardDesignerView → DashboardDesignerWidget → GridstackWidget

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DashboardDesignerView                         │
│                    (Parent Container)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State Management:                                       │  │
│  │  - showPropertyGrid (ref)                                │  │
│  │  - propertyGridData (ref)                                │  │
│  │  - propertyUpdateFn (ref)                                 │  │
│  │                                                           │  │
│  │  Functions:                                               │  │
│  │  - openWidgetProperties(propertiesData, opts)            │  │
│  │  - closePropertyGrid()                                    │  │
│  │  - handlePropertyUpdate(key, value)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  provide('openWidgetProperties', openWidgetProperties)    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  <DashboardDesignerWidget                                │  │
│  │    v-model="layout"                                      │  │
│  │    :widget-components="widgetComponents"                 │  │
│  │    :content-widget-components="contentWidgetComponents"  │  │
│  │    :grid-defaults-by-type="contentGridDefaultsByType"    │  │
│  │    :grid-options="contentGridOptions" />                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  <PropertyGridWidget                                      │  │
│  │    :show="showPropertyGrid"                               │  │
│  │    :properties-data="propertyGridData"                    │  │
│  │    :on-update="handlePropertyUpdate"                      │  │
│  │    @close="closePropertyGrid" />                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ inject('openWidgetProperties')
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DashboardDesignerWidget                         │
│              (Layout Editor Component)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Injects:                                                 │  │
│  │  - openWidgetProperties (from parent)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │  - modelValue (layout structure)                          │  │
│  │  - widgetComponents: { IconValueWidget, GridstackWidget }│  │
│  │  - contentWidgetComponents: { IconValueWidget }          │  │
│  │  - gridDefaultsByType                                     │  │
│  │  - gridOptions                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Function: getWidgetProps(col, row, rowIndex, colIndex)  │  │
│  │  - Merges cellProps with openWidgetProperties            │  │
│  │  - For GridstackWidget: adds widgets, gridOptions, etc.  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Template:                                                │  │
│  │  <component                                               │  │
│  │    :is="widgetComponents[col.content.type]"              │  │
│  │    v-bind="getWidgetProps(...)" />                        │  │
│  │                                                           │  │
│  │  This renders widgets in grid cells:                      │  │
│  │  - IconValueWidget (direct)                               │  │
│  │  - GridstackWidget (nested)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ openWidgetProperties prop
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GridstackWidget                              │
│              (Nested Grid Component)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Injects:                                                 │  │
│  │  - openWidgetProperties (from DashboardDesignerView)     │  │
│  │    (REQUIRED - throws error if missing)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │  - widgets: Array of widget objects                       │  │
│  │  - updateWidget: (index, key, value) => void             │  │
│  │  - gridOptions: { column, cellHeight, etc. }             │  │
│  │  - widgetComponents: { IconValueWidget, ValueWidget }    │  │
│  │  - gridDefaultsByType                                     │  │
│  │  - editMode: boolean                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Function: getWidgetProps(w, index)                      │  │
│  │  - Adds openWidgetProperties to each child widget        │  │
│  │  - Uses parent's openWidgetProperties (injected)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Template:                                                │  │
│  │  <component                                               │  │
│  │    :is="contentWidgetComponents[w.type]"                  │  │
│  │    v-bind="getWidgetProps(w, i)" />                       │  │
│  │                                                           │  │
│  │  This renders child widgets:                              │  │
│  │  - IconValueWidget                                        │  │
│  │  - ValueWidget                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ openWidgetProperties prop
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              IconValueWidget / ValueWidget                      │
│                  (Leaf Widgets)                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │  - openWidgetProperties: function                        │  │
│  │    (passed from GridstackWidget → from DashboardDesigner)│  │
│  │  - Other widget-specific props                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  When clicked:                                            │  │
│  │  openWidgetProperties(propertiesData, {                   │  │
│  │    update: (key, value) => { ... },                        │  │
│  │    refresh: () => getPropertyGridData(...)                │  │
│  │  })                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PropertyGridWidget                           │
│              (Shared Property Editor)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Owned by: DashboardDesignerView                          │  │
│  │  (Single instance, shared by all widgets)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │  - show: boolean (from showPropertyGrid)                  │  │
│  │  - properties-data: object (from propertyGridData)        │  │
│  │  - on-update: function (from handlePropertyUpdate)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  When property is updated:                               │  │
│  │  on-update(key, value) → handlePropertyUpdate()          │  │
│  │  → propertyUpdateFn(key, value)                           │  │
│  │  → Updates widget data in parent component               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: PropertyGridWidget Integration

### 1. **Initialization (DashboardDesignerView)**
```
DashboardDesignerView
├── Creates PropertyGridWidget state
│   ├── showPropertyGrid = ref(false)
│   ├── propertyGridData = ref(null)
│   └── propertyUpdateFn = ref(null)
│
├── Provides openWidgetProperties function via provide()
│   └── This function updates state and shows PropertyGridWidget
│
└── Renders PropertyGridWidget component
    └── Single instance shared by all widgets
```

### 2. **Propagation (DashboardDesignerWidget)**
```
DashboardDesignerWidget
├── Injects openWidgetProperties (from parent)
│
└── Passes to widgets via getWidgetProps()
    └── Merges openWidgetProperties into widget props
        └── All widgets receive it (IconValueWidget, GridstackWidget, etc.)
```

### 3. **Nested Usage (GridstackWidget)**
```
GridstackWidget
├── Injects openWidgetProperties (from DashboardDesignerView)
│   └── REQUIRED - throws error if not provided
│
└── Passes to child widgets via getWidgetProps()
    └── Child widgets (IconValueWidget, ValueWidget) receive it
```

### 4. **Widget Interaction (Leaf Widgets)**
```
IconValueWidget / ValueWidget
├── Receives openWidgetProperties as prop
│
└── When clicked:
    └── Calls openWidgetProperties(propertiesData, {
          update: (key, value) => { ... },
          refresh: () => getPropertyGridData(...)
        })
    └── This bubbles up to DashboardDesignerView
    └── DashboardDesignerView updates state
    └── PropertyGridWidget shows with widget's properties
```

### 5. **Property Update Flow**
```
User edits property in PropertyGridWidget
    ↓
PropertyGridWidget emits @update(key, value)
    ↓
DashboardDesignerView.handlePropertyUpdate(key, value)
    ↓
propertyUpdateFn(key, value)  // Function provided by widget
    ↓
Widget's update function executes
    ├── For GridstackWidget children: props.updateWidget(index, key, value)
    └── For direct widgets: Updates layout model
    ↓
Widget re-renders with new property value
```

## Key Points

1. **Single PropertyGridWidget Instance**
   - Owned by DashboardDesignerView
   - Shared by all widgets (direct and nested)
   - Always rendered, controlled by `show` prop

2. **Provide/Inject Pattern**
   - DashboardDesignerView provides `openWidgetProperties`
   - DashboardDesignerWidget injects and passes to widgets
   - GridstackWidget injects and passes to child widgets
   - All widgets use the same PropertyGridWidget instance

3. **Decoupling**
   - GridstackWidget no longer owns PropertyGridWidget
   - GridstackWidget requires parent to provide it (throws if missing)
   - DashboardDesignerWidget warns if not provided (but doesn't break)

4. **Update Mechanism**
   - Each widget provides its own `update` function when calling `openWidgetProperties`
   - PropertyGridWidget calls this function when properties change
   - Widgets handle their own state updates

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **DashboardDesignerView** | • Owns PropertyGridWidget<br>• Provides openWidgetProperties<br>• Manages PropertyGridWidget state |
| **DashboardDesignerWidget** | • Layout editing (rows/columns)<br>• Renders widgets in grid cells<br>• Passes openWidgetProperties to widgets |
| **GridstackWidget** | • Nested grid layout<br>• Manages child widgets<br>• Passes openWidgetProperties to children |
| **PropertyGridWidget** | • Property editing UI<br>• Shared by all widgets<br>• Updates widget properties via callbacks |
