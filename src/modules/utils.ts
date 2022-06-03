// Used in some cases where linter complains about extracting from unknown type
export function extractFromUnknownObject(obj: unknown, key: string): unknown {
  if (isObject(obj)) {
    return obj[key as keyof typeof obj];
  }
  return null;
}

// Check if the unknown is an object
export function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}
