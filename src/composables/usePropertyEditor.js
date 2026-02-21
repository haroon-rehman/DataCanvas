import { ref, provide } from "vue";

/**
 * Property editor state and API for layout views. Call provide() so child widgets can open the editor.
 */
export function usePropertyEditor() {
  const show = ref(false);
  const schema = ref(null);
  const changeHandler = ref(null);

  function open(propertySchemaData, opts = {}) {
    schema.value = propertySchemaData;
    changeHandler.value = opts.update ?? null;
    show.value = true;
  }

  function close() {
    show.value = false;
  }

  function handleChange(key, value) {
    if (changeHandler.value) changeHandler.value(key, value);
  }

  provide("openPropertyEditor", open);

  return {
    show,
    schema,
    open,
    close,
    handleChange,
  };
}
