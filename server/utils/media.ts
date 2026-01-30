/**
 * Media utilities for file validation and processing
 */
import sharp from 'sharp'
import { removeVietnameseTones, toKebabCase } from '@vt7/utils'
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  type MediaCategory,
} from '#shared/types'

/**
 * Get media category from mime type
 */
export function getMediaCategory(mimeType: string): MediaCategory {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document'
  return 'other'
}

/**
 * Validate file type
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType)
}

/**
 * Get max file size for a given mime type
 */
export function getMaxFileSize(mimeType: string): number {
  const category = getMediaCategory(mimeType)
  switch (category) {
    case 'image':
      return MAX_IMAGE_SIZE
    case 'video':
      return MAX_VIDEO_SIZE
    case 'document':
      return MAX_DOCUMENT_SIZE
    default:
      return MAX_IMAGE_SIZE // Default to smallest
  }
}

/**
 * Validate file size based on mime type
 */
export function isValidFileSize(size: number, mimeType: string): boolean {
  return size <= getMaxFileSize(mimeType)
}

interface ImageDimensions {
  width: number
  height: number
}

interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<ImageDimensions | null> {
  try {
    const metadata = await sharp(buffer).metadata()
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Process and optimize image
 * - Resize if larger than max dimensions
 * - Convert to WebP for optimal file size
 * - Strip metadata
 */
export async function processImage(
  buffer: Buffer,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {},
): Promise<ProcessedImage> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 85, format = 'webp' } = options

  let processor = sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate() // Auto-rotate based on EXIF

  // Convert to target format
  switch (format) {
    case 'webp':
      processor = processor.webp({ quality })
      break
    case 'jpeg':
      processor = processor.jpeg({ quality, mozjpeg: true })
      break
    case 'png':
      processor = processor.png({ compressionLevel: 9 })
      break
  }

  const result = await processor.toBuffer({ resolveWithObject: true })

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    format: result.info.format,
  }
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  buffer: Buffer,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {},
): Promise<Buffer> {
  const { width = 200, height = 200, quality = 80 } = options

  return sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality })
    .toBuffer()
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  }
  return map[mimeType] || 'bin'
}

/**
 * Generate unique filename in kebab-case
 */
export function generateFilename(originalName: string, mimeType: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = getExtensionFromMimeType(mimeType)

  // Remove extension, Vietnamese tones, convert to kebab-case
  const baseName = toKebabCase(
    removeVietnameseTones(originalName.replace(/\.[^/.]+$/, '')), // Remove extension first
  ).slice(0, 50) // Limit length

  return `${baseName}-${timestamp}-${random}.${ext}`
}
