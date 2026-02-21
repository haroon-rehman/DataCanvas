import { ref, provide } from "vue";

/**
 * Widgets selector state and API for layout views. Call provide() so child widgets can open the selector.
 */
export function useWidgetsSelector() {
  const show = ref(false);
  const data = ref(null); // { widgetsByGroup, selectedRegionInfo, onAddWidget? }

  function open(widgetsByGroup, selectedRegionInfo, onAddWidget) {
    data.value = { widgetsByGroup, selectedRegionInfo, onAddWidget };
    show.value = true;
  }

  function close() {
    show.value = false;
    data.value = null;
  }

  function handleSelected(widgetType) {
    const d = data.value;
    if (d?.onAddWidget) {
      d.onAddWidget(widgetType);
    }
    close();
  }

  provide("openWidgetsSelector", open);
  provide("closeWidgetsSelector", close);
  provide("onWidgetSelected", handleSelected);

  return {
    show,
    data,
    open,
    close,
    handleSelected,
  };
}
