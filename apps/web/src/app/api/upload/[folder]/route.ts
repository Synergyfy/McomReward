import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

// When true, uploaded files are written to the local filesystem (public/uploads/<folder>)
// instead of being sent to Cloudinary. Intended for local development.
const LOCAL_FILE_UPLOAD = process.env.NEXT_PUBLIC_LOCAL_FILE_UPLOAD === 'true';

// Root directory for local uploads (Next serves everything under public/ at the site root).
const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

// Configure Cloudinary
const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Sanitize a folder/segment so it can be safely used as a filesystem path.
function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizeFolder(folder: string): string {
  return folder
    .split('/')
    .map(sanitizeSegment)
    .filter(Boolean)
    .join('/');
}

function sanitizeBaseName(name: string): string {
  const ext = path.extname(name);
  const base = path.basename(name, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
  return base || 'file';
}

async function saveLocally(file: File, folder: string): Promise<NextResponse> {
  const safeFolder = sanitizeFolder(folder);
  const ext = path.extname(file.name);
  const fileName = `${Date.now()}-${sanitizeBaseName(file.name)}${ext}`;

  const targetDir = safeFolder
    ? path.join(LOCAL_UPLOAD_ROOT, safeFolder)
    : LOCAL_UPLOAD_ROOT;

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, fileName), Buffer.from(await file.arrayBuffer()));

  const publicPath = safeFolder ? `/uploads/${safeFolder}/${fileName}` : `/uploads/${fileName}`;

  return NextResponse.json({
    secure_url: publicPath,
    public_id: safeFolder ? `${safeFolder}/${fileName}` : fileName,
  });
}

async function uploadToCloudinary(file: File, folder: string): Promise<NextResponse> {
  // Check for Cloudinary configuration
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    return NextResponse.json(
      { error: 'Cloudinary configuration is missing. Check environment variables.' },
      { status: 500 }
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Invalid file type. Only images are allowed.' },
      { status: 400 }
    );
  }

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File size exceeds the 5MB limit.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64Image}`;

  const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ folder: string }> }) {
  try {
    const { folder } = await params;

    if (!folder) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (LOCAL_FILE_UPLOAD) {
      return await saveLocally(file, folder);
    }

    return await uploadToCloudinary(file, folder);
  } catch (error) {
    let message = 'An unknown error occurred';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
