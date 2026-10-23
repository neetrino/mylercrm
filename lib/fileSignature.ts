const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

function isWebp(buffer: Buffer): boolean {
  return buffer.length >= 12
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP';
}

function isGif(buffer: Buffer): boolean {
  const header = buffer.toString('ascii', 0, 6);
  return header === 'GIF87a' || header === 'GIF89a';
}

/** True when the bytes match the declared allowlisted MIME type. */
export function bufferMatchesMime(buffer: Buffer, mime: string): boolean {
  switch (mime) {
    case 'image/jpeg':
      return startsWith(buffer, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47]);
    case 'image/gif':
      return isGif(buffer);
    case 'image/webp':
      return isWebp(buffer);
    case 'application/pdf':
      return startsWith(buffer, [0x25, 0x50, 0x44, 0x46]);
    case 'application/msword':
      return startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0]);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]);
    default:
      return false;
  }
}

/** Safe object extension for an allowlisted MIME type. */
export function extensionForMime(mime: string): string | null {
  return MIME_EXTENSION[mime] ?? null;
}
