import type { ErrorCode, FieldError } from '#shared/types'

/**
 * Composable for handling API errors with toast notifications
 */
export interface ApiErrorResponse {
  statusCode?: number
  data?: {
    message?: string
    code?: ErrorCode
    errors?: FieldError[]
  }
}

export function useApiError() {
  const toast = useToast()

  /**
   * Handle API error and show toast notification
   * Returns field errors if available (for form validation)
   */
  function handleError(error: unknown, defaultMessage: string): FieldError[] | undefined {
    const err = error as ApiErrorResponse
    const message = err.data?.message || defaultMessage
    const fieldErrors = err.data?.errors

    // Show main error message
    toast.add({
      title: 'Lỗi',
      description: message,
      color: 'error',
    })

    // Return field errors for form validation display
    return fieldErrors
  }

  /**
   * Show success toast notification
   */
  function showSuccess(message: string, title = 'Thành công') {
    toast.add({
      title,
      description: message,
      color: 'success',
    })
  }

  /**
   * Show warning toast notification
   */
  function showWarning(message: string, title = 'Cảnh báo') {
    toast.add({
      title,
      description: message,
      color: 'warning',
    })
  }

  return {
    handleError,
    showSuccess,
    showWarning,
  }
}
