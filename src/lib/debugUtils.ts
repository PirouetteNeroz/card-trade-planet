
/**
 * Safely converts any value to a string that can be displayed in React
 * @param value Any value that needs to be safely rendered
 * @returns A string representation of the value
 */
export function safeDisplayValue(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return "[Object cannot be stringified]";
    }
  }
  
  return String(value);
}

/**
 * Console logs the structure of an object with a label
 * @param label Description of what is being logged
 * @param obj The object to log
 */
export function logObject(label: string, obj: any): void {
  console.log(`${label}:`, obj);
  if (obj && typeof obj === "object") {
    console.log(`${label} structure:`, Object.keys(obj));
    Object.entries(obj).forEach(([key, value]) => {
      const valueType = typeof value;
      const valuePreview = valueType === "object" && value !== null 
        ? `[${valueType}: ${Object.keys(value).join(", ")}]` 
        : value;
      console.log(`  - ${key}: ${valuePreview}`);
    });
  }
}
