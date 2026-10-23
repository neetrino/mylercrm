import { afterEach, describe, expect, it } from 'vitest';
import { bearerTokenMatches, isAuthorizedBearer } from './apiToken';

const TOKEN = 'test-api-token-value';

describe('bearerTokenMatches', () => {
  it('accepts an exact bearer token', () => {
    expect(bearerTokenMatches(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
  });

  it('rejects a different token, a missing header, and a non-bearer scheme', () => {
    expect(bearerTokenMatches('Bearer wrong-token-value', TOKEN)).toBe(false);
    expect(bearerTokenMatches(null, TOKEN)).toBe(false);
    expect(bearerTokenMatches(`Basic ${TOKEN}`, TOKEN)).toBe(false);
    expect(bearerTokenMatches(`Bearer ${TOKEN}`, undefined)).toBe(false);
  });
});

describe('isAuthorizedBearer', () => {
  afterEach(() => {
    delete process.env.API_TOKEN;
  });

  it('reads API_TOKEN from the environment', () => {
    process.env.API_TOKEN = TOKEN;
    const request = new Request('http://localhost', {
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    expect(isAuthorizedBearer(request)).toBe(true);
  });
});
