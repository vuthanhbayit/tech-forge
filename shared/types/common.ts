/**
 * Common types for API responses
 */

// Pagination info returned from API
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// API error response
export interface ApiError {
  statusCode: number
  message: string
}

// Success response with message
export interface ApiSuccessResponse {
  success: true
  message: string
}

// Timestamps for serialized responses (Date → string)
export interface Timestamps {
  createdAt: string
  updatedAt: string
}

// Soft delete timestamp
export interface SoftDelete {
  deletedAt: string | null
}

// Count result from Prisma _count
export type CountResult<K extends string> = {
  _count: Record<K, number>
}
