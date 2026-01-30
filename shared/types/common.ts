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

// Error codes for API responses
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

// Field-level validation error
export interface FieldError {
  field: string
  message: string
}

// API error response
export interface ApiError {
  statusCode: number
  message: string
  code?: ErrorCode
  errors?: FieldError[]
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
