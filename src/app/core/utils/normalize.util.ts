const PHONE_CONTACT_TYPES = new Set(['phone', 'mobile', 'whatsapp']);

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizePhone(value: string): string {
  return onlyDigits(value);
}

export function maybeNormalizeContactValue(type: string, value: string): string {
  if (PHONE_CONTACT_TYPES.has(type)) {
    return normalizePhone(value);
  }

  return value.trim();
}
