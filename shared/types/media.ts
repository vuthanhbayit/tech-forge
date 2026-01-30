/**
 * Media types
 */

// MediaFolder for list view
export interface MediaFolder {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  _count: {
    children: number
    files: number
  }
}

// MediaFolder for breadcrumb navigation
export interface MediaFolderBreadcrumb {
  id: string
  name: string
}

// Media file for list view
export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  alt: string | null
  folderId: string | null
  createdAt: string
}

// Media file for detail/edit view
export interface MediaDetail extends Media {
  uploadedBy: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  metadata: Record<string, unknown> | null
  updatedAt: string
}

// Combined folder and file item for File Explorer UI
export interface MediaItem {
  type: 'folder' | 'file'
  id: string
  name: string
  // Folder specific
  parentId?: string | null
  _count?: {
    children: number
    files: number
  }
  // File specific
  mimeType?: string
  size?: number
  url?: string
  thumbnailUrl?: string | null
  width?: number | null
  height?: number | null
  // Common
  createdAt: string
}

// Input types
export interface MediaFolderInput {
  name: string
  parentId?: string | null
}

export interface MediaUpdateInput {
  filename?: string
  alt?: string | null
  folderId?: string | null
}

// Upload response
export interface MediaUploadResult {
  id: string
  filename: string
  url: string
  thumbnailUrl: string | null
  mimeType: string
  size: number
  width: number | null
  height: number | null
}

// List query params
export interface MediaListQuery {
  folderId?: string | null
  search?: string
  mimeType?: string
  page?: number
  limit?: number
}

// List response with pagination
export interface MediaListResponse {
  items: MediaItem[]
  breadcrumbs: MediaFolderBreadcrumb[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// File type categories
export type MediaCategory = 'image' | 'video' | 'document' | 'other'

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
export const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES]

// Size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024 // 20MB
export const MAX_DOCUMENT_SIZE = 30 * 1024 * 1024 // 30MB
