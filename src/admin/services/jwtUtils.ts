/** Decodes the payload of a JWT without verifying the signature. */
export function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns true if the token is missing, malformed, or past its `exp` claim. */
export function isTokenExpired(token: string | null): boolean {
  if (!token || token === 'undefined' || token === 'null') return true;
  const payload = decodePayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== 'number') return false; // no exp claim — treat as valid
  return Date.now() / 1000 > exp;
}

/** Returns remaining seconds until expiry, or 0 if already expired. */
export function secondsUntilExpiry(token: string | null): number {
  if (!token) return 0;
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== 'number') return Infinity;
  return Math.max(0, payload.exp - Date.now() / 1000);
}
