/**
 * S3 utilities for file upload/delete
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { MediaCategory } from '#shared/types'

// Lazy initialization
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    const config = useRuntimeConfig()
    s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      endpoint: config.s3.endpoint || undefined,
      forcePathStyle: !!config.s3.endpoint, // For S3-compatible services
    })
  }
  return s3Client
}

function getS3Config() {
  const config = useRuntimeConfig()
  return {
    bucket: config.s3.bucket,
    cdnUrl: config.s3.cdnUrl || `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com`,
  }
}

/**
 * Generate S3 key based on file type
 */
export function generateS3Key(category: MediaCategory, filename: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = filename.split('.').pop() || ''
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)

  return `media/${category}/${year}/${month}/${timestamp}_${random}_${safeName}`
}

/**
 * Upload file to S3
 */
export async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const client = getS3Client()
  const { bucket, cdnUrl } = getS3Config()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    }),
  )

  return `${cdnUrl}/${key}`
}

/**
 * Extract S3 key from CDN URL with validation
 */
function extractS3Key(url: string, cdnUrl: string): string {
  try {
    const urlObj = new URL(url)
    const cdnUrlObj = new URL(cdnUrl)

    // Validate URL belongs to our CDN
    if (urlObj.origin !== cdnUrlObj.origin) {
      throw new Error(`URL origin "${urlObj.origin}" does not match CDN origin "${cdnUrlObj.origin}"`)
    }

    // Extract key (remove leading slash)
    const key = urlObj.pathname.slice(1)
    if (!key) {
      throw new Error('Empty S3 key extracted from URL')
    }

    return key
  } catch (error) {
    // Fallback to simple string replacement if URL parsing fails
    const key = url.replace(`${cdnUrl}/`, '')
    if (!key || key === url) {
      throw new Error(`Failed to extract S3 key from URL: ${url}`)
    }
    return key
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(url: string): Promise<void> {
  const client = getS3Client()
  const { bucket, cdnUrl } = getS3Config()

  const key = extractS3Key(url, cdnUrl)

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}

/**
 * Delete multiple files from S3
 */
export async function deleteMultipleFromS3(urls: string[]): Promise<void> {
  await Promise.all(urls.map(url => deleteFromS3(url)))
}
