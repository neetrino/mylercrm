import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { attachmentService } from '@/services/attachment.service';
import { FileType } from '@prisma/client';
import { putObject } from '@/lib/r2';
import { handleRouteError } from '@/lib/apiErrorResponse';
import { bufferMatchesMime, extensionForMime } from '@/lib/fileSignature';
import crypto from 'crypto';

// Максимальный размер файла: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Разрешённые типы файлов
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const apartmentId = parseInt(idParam);

    if (isNaN(apartmentId)) {
      return NextResponse.json(
        { error: 'Invalid apartment ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('fileType') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!fileType || !['AGREEMENT', 'FLOORPLAN', 'IMAGE', 'PROGRESS_IMAGE'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const isImage = fileType === 'IMAGE' || fileType === 'PROGRESS_IMAGE';
    const isDocument = fileType === 'AGREEMENT' || fileType === 'FLOORPLAN';
    const isDocumentSection = isDocument; // Agreement/Floorplans принимают и PDF, и скриншоты (image)

    if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    if (isDocumentSection) {
      const allowed = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Allowed: PDF, DOC, DOCX, or image (JPEG, PNG, GIF, WebP)' },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!bufferMatchesMime(buffer, file.type)) {
      return NextResponse.json({ error: 'File content does not match its type' }, { status: 400 });
    }
    const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');

    const timestamp = Date.now();
    const extension = extensionForMime(file.type) ?? 'bin';
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80);
    const key = `apartments/${apartmentId}/${fileType.toLowerCase()}/${timestamp}_${baseName}.${extension}`;

    const { url: fileUrl } = await putObject(key, buffer, file.type);

    // Сохраняем в БД с MD5 хешем
    const attachment = await attachmentService.create(
      apartmentId,
      fileType as FileType,
      fileUrl,
      file.name,
      file.size,
      md5Hash
    );

    return NextResponse.json({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      fileType: attachment.fileType,
      md5Hash: attachment.md5Hash,
      createdAt: attachment.createdAt.toISOString(),
    });
  } catch (error) {
    return handleRouteError(request, '[API] Error uploading attachment', error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const apartmentId = parseInt(idParam);

    if (isNaN(apartmentId)) {
      return NextResponse.json(
        { error: 'Invalid apartment ID' },
        { status: 400 }
      );
    }

    const attachments = await attachmentService.getByApartmentId(apartmentId);

    return NextResponse.json(attachments);
  } catch (error) {
    return handleRouteError(request, '[API] Error fetching attachments', error);
  }
}
