/**
 * Shared utility for generating unique widget identifiers.
 * Tracks counters per widget type to ensure unique identifiers across the application.
 */

const widgetCounters = new Map()

/**
 * Generates a unique identifier for a widget type.
 * Format: TypeName### where ### is an incremental number starting from 1.
 * 
 * @param {string} widgetType - The widget type name (e.g., 'IconValueWidget', 'ValueWidget', 'GridLayoutWidget')
 * @returns {string} - Unique identifier (e.g., 'IconValueWidget1', 'IconValueWidget2')
 */
export function generateWidgetIdentifier(widgetType) {
  const currentCount = widgetCounters.get(widgetType) || 0
  const nextCount = currentCount + 1
  widgetCounters.set(widgetType, nextCount)
  return `${widgetType}${nextCount}`
}

/**
 * Resets the counter for a specific widget type (useful for testing or reset scenarios).
 * 
 * @param {string} widgetType - The widget type name to reset
 */
export function resetWidgetIdentifierCounter(widgetType) {
  widgetCounters.delete(widgetType)
}

/**
 * Resets all widget identifier counters.
 */
export function resetAllWidgetIdentifierCounters() {
  widgetCounters.clear()
}

/**
 * Gets the current counter value for a widget type (without incrementing).
 * 
 * @param {string} widgetType - The widget type name
 * @returns {number} - Current counter value (0 if never used)
 */
export function getWidgetIdentifierCounter(widgetType) {
  return widgetCounters.get(widgetType) || 0
}
