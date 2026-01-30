/**
 * Error helpers for consistent API error responses
 */
import type { ErrorCode, FieldError } from '#shared/types'

interface ErrorOptions {
  code?: ErrorCode
  errors?: FieldError[]
}

/**
 * Create validation error (400)
 */
export function validationError(message: string, errors?: FieldError[]) {
  return createError({
    statusCode: 400,
    message,
    data: { code: 'VALIDATION_ERROR' as ErrorCode, errors },
  })
}

/**
 * Create not found error (404)
 */
export function notFoundError(resource: string) {
  return createError({
    statusCode: 404,
    message: `Không tìm thấy ${resource}`,
    data: { code: 'RESOURCE_NOT_FOUND' as ErrorCode },
  })
}

/**
 * Create conflict error (409) - for duplicate resources
 */
export function conflictError(message: string, field?: string) {
  return createError({
    statusCode: 409,
    message,
    data: {
      code: 'RESOURCE_CONFLICT' as ErrorCode,
      errors: field ? [{ field, message }] : undefined,
    },
  })
}

/**
 * Create permission denied error (403)
 */
export function permissionError(message = 'Bạn không có quyền thực hiện thao tác này') {
  return createError({
    statusCode: 403,
    message,
    data: { code: 'PERMISSION_DENIED' as ErrorCode },
  })
}

/**
 * Create authentication error (401)
 */
export function authError(message = 'Vui lòng đăng nhập') {
  return createError({
    statusCode: 401,
    message,
    data: { code: 'AUTHENTICATION_ERROR' as ErrorCode },
  })
}
