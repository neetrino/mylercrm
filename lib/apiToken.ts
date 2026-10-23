const BEARER_PREFIX = 'Bearer ';

type HeaderSource = {
  headers: { get(name: string): string | null };
};

function timingSafeEqualStrings(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length === rightBytes.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) {
    diff |= (leftBytes[i] ?? 0) ^ (rightBytes[i] ?? 0);
  }
  return diff === 0;
}

/** True only when the header is `Bearer <API_TOKEN>` and the token matches in constant time. */
export function bearerTokenMatches(authHeader: string | null, expected: string | undefined): boolean {
  if (!authHeader || !expected || !authHeader.startsWith(BEARER_PREFIX)) {
    return false;
  }
  const provided = authHeader.slice(BEARER_PREFIX.length);
  if (!provided) {
    return false;
  }
  return timingSafeEqualStrings(provided, expected);
}

/** External API gate. Does not accept a session cookie. */
export function isAuthorizedBearer(request: HeaderSource): boolean {
  return bearerTokenMatches(request.headers.get('authorization'), process.env.API_TOKEN);
}
