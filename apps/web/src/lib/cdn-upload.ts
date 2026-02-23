/**
 * CDN asset upload — uploads generated images to R2/S3-compatible storage.
 * Falls back to returning the original URL when CDN_* env vars are not set.
 * 
 * Compatible with: Cloudflare R2, Backblaze B2, AWS S3, Tigris, Fly.io Tigris
 */

import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!process.env.CDN_ENDPOINT || !process.env.CDN_ACCESS_KEY_ID || !process.env.CDN_SECRET_ACCESS_KEY) {
    return null;
  }
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.CDN_ENDPOINT,
      region: process.env.CDN_REGION ?? 'auto',
      credentials: {
        accessKeyId: process.env.CDN_ACCESS_KEY_ID,
        secretAccessKey: process.env.CDN_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function uploadToCdn(
  key: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.CDN_BUCKET;
  const publicBase = process.env.CDN_PUBLIC_URL;

  if (!client || !bucket) {
    // No CDN configured — return data as base64 data URL fallback
    return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const base = publicBase ?? `${process.env.CDN_ENDPOINT}/${bucket}`;
  return `${base}/${key}`;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<{ url: string; fields?: Record<string, string> }> {
  const client = getS3Client();
  const bucket = process.env.CDN_BUCKET;

  if (!client || !bucket) {
    throw new Error('CDN not configured');
  }

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn }
  );

  return { url };
}
