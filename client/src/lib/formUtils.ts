export function normalizeFormPayload<T extends Record<string, any>>(
  formData: T
): Partial<T> {
  const normalized: any = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        continue;
      }
      normalized[key] = trimmed;
    } else if (value !== null && value !== undefined) {
      normalized[key] = value;
    }
  }

  return normalized;
}
