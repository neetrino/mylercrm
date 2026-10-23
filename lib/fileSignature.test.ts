import { describe, expect, it } from 'vitest';
import { bufferMatchesMime, extensionForMime } from './fileSignature';

describe('bufferMatchesMime', () => {
  it('accepts a JPEG signature and rejects HTML declared as JPEG', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    const html = Buffer.from('<html><script>alert(1)</script></html>');
    expect(bufferMatchesMime(jpeg, 'image/jpeg')).toBe(true);
    expect(bufferMatchesMime(html, 'image/jpeg')).toBe(false);
  });

  it('accepts a PDF signature', () => {
    const pdf = Buffer.from('%PDF-1.7');
    expect(bufferMatchesMime(pdf, 'application/pdf')).toBe(true);
  });
});

describe('extensionForMime', () => {
  it('maps allowlisted types and rejects unknown types', () => {
    expect(extensionForMime('image/png')).toBe('png');
    expect(extensionForMime('text/html')).toBeNull();
  });
});
