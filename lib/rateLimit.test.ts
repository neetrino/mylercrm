import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getClientIp } from './rateLimit';

describe('getClientIp', () => {
  it('prefers x-real-ip over a client-supplied forwarded-for prefix', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        'x-real-ip': '9.9.9.9',
      },
    });
    expect(getClientIp(request)).toBe('9.9.9.9');
  });

  it('uses the closest forwarded hop when x-real-ip is absent', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(request)).toBe('5.6.7.8');
  });
});

describe('checkRateLimit (memory fallback)', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.resetModules();
  });

  it('allows requests under the limit for auth bucket', async () => {
    const { checkRateLimit } = await import('./rateLimit');
    const id = `test-auth-${Date.now()}`;
    const first = await checkRateLimit(id, 'auth');
    expect(first.success).toBe(true);
  });

  it('eventually rejects when exceeding auth limit (memory)', async () => {
    const { checkRateLimit } = await import('./rateLimit');
    const id = `burst-auth-${Date.now()}`;
    let lastSuccess = true;
    for (let i = 0; i < 35; i++) {
      const r = await checkRateLimit(id, 'auth');
      lastSuccess = r.success;
      if (!r.success) {
        break;
      }
    }
    expect(lastSuccess).toBe(false);
  });
});
