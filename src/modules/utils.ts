export function extractFromUnknownObject(obj: unknown, key: string) {
  if (isObject(obj)) {
    return obj[key as keyof typeof obj];
  }
  return null;
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}
