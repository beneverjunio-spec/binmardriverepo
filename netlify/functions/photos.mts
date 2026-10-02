import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';

function imageType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (Buffer.from(bytes.subarray(0, 4)).toString() === 'RIFF' && Buffer.from(bytes.subarray(8, 12)).toString() === 'WEBP') return 'webp';
  return null;
}

export default async (request: Request) => {
  const url = new URL(request.url);
  try {
    if (url.pathname.startsWith('/uploads/') && request.method === 'GET') {
      const key = url.pathname.slice('/uploads/'.length);
      if (!/^[\da-f-]{36}\/[\da-f-]{36}\.(jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
      const data = await getStore('vehicle-photos').get(key, { type: 'arrayBuffer' });
      if (!data) return new Response('Not found', { status: 404 });
      const extension = key.split('.').pop();
      return new Response(data, { headers: {
        'Content-Type': extension === 'jpg' ? 'image/jpeg' : `image/${extension}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      } });
    }
    if (url.pathname !== '/api/listings/upload' || request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
    const identity = await getUser();
    if (!identity) return Response.json({ error: 'Please sign in before uploading photos.' }, { status: 401 });
    const form = await request.formData();
    const files = form.getAll('photos');
    if (!files.length || files.length > 12 || files.some(file => !(file instanceof File))) {
      return Response.json({ error: 'Select between 1 and 12 photos.' }, { status: 400 });
    }
    const photos = files as File[];
    if (photos.reduce((total, file) => total + file.size, 0) > 4_500_000) {
      return Response.json({ error: 'Upload fewer or smaller photos (4.5 MB maximum per upload).' }, { status: 413 });
    }
    const validated = await Promise.all(photos.map(async file => {
      const data = await file.arrayBuffer();
      return { data, extension: imageType(new Uint8Array(data)) };
    }));
    if (validated.some(photo => !photo.extension)) return Response.json({ error: 'Use JPEG, PNG, or WebP photos.' }, { status: 400 });
    const store = getStore('vehicle-photos');
    const images = await Promise.all(validated.map(async photo => {
      const key = `${identity.id}/${crypto.randomUUID()}.${photo.extension}`;
      await store.set(key, photo.data);
      return `/uploads/${key}`;
    }));
    return Response.json({ success: true, images }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Photo storage is temporarily unavailable. Please try again.' }, { status: 503 });
  }
};

export const config: Config = { path: ['/api/listings/upload', '/uploads/*'] };
