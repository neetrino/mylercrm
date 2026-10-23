'use client';

import { FileText } from 'lucide-react';
import Image from 'next/image';

type Attachment = {
  id: number;
  fileType: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

export function isImageFileName(fileName: string | null): boolean {
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
};

export function renderDocumentGrid(
files: Attachment[],
_type: string,
onOpen: (value: { urls: string[]; index: number }) => void,
onDelete: (id: number) => void,
) {
  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500">No files</p>;
  }
  const imageFiles = files.filter((f) => isImageFileName(f.fileName));
  return (
    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {files.map((file) => {
        const isImage = isImageFileName(file.fileName);
        if (isImage) {
          const imgIndex = imageFiles.findIndex((f) => f.id === file.id);
          return (
            <div
              key={file.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => imgIndex >= 0 && onOpen({ urls: imageFiles.map((f) => f.fileUrl), index: imgIndex })}
                className="relative block w-full aspect-square overflow-hidden bg-gray-100 text-left"
              >
                <Image
                  src={file.fileUrl}
                  alt={file.fileName || 'Preview'}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>
              <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
                <span
                  className="min-w-0 flex-1 truncate text-xs text-gray-600"
                  title={file.fileName || undefined}
                >
                  {file.fileName || 'Image'}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(file.id)}
                  className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        }
        return (
          <div
            key={file.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex aspect-square flex-col items-center justify-center gap-2 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <FileText className="h-16 w-16 shrink-0 text-red-500" strokeWidth={1.5} />
              <span className="text-center text-xs font-medium text-gray-600">
                PDF / Doc
              </span>
            </a>
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
              <span
                className="min-w-0 flex-1 truncate text-xs text-gray-600"
                title={file.fileName || undefined}
              >
                {file.fileName || 'File'}
              </span>
              <div className="flex shrink-0 gap-1">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => onDelete(file.id)}
                  className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function renderImageGrid(
files: Attachment[],
_type: string,
onOpen: (value: { urls: string[]; index: number }) => void,
onDelete: (id: number) => void,
) {
  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500">No images</p>;
  }
  return (
    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {files.map((file, idx) => (
        <div
          key={file.id}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => onOpen({ urls: files.map((f) => f.fileUrl), index: idx })}
            className="relative block w-full aspect-square overflow-hidden bg-gray-100 text-left"
          >
            <Image
              src={file.fileUrl}
              alt={file.fileName || 'Image'}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </button>
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
            <span
              className="min-w-0 flex-1 truncate text-xs text-gray-600"
              title={file.fileName || undefined}
            >
              {file.fileName || 'Image'}
            </span>
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
