/**
 * Composable for handling API errors with toast notifications
 */
export interface ApiError {
  data?: {
    message?: string
  }
}

export function useApiError() {
  const toast = useToast()

  function handleError(error: unknown, defaultMessage: string) {
    const err = error as ApiError
    toast.add({
      title: 'Lỗi',
      description: err.data?.message || defaultMessage,
      color: 'error',
    })
  }

  function showSuccess(message: string, title = 'Thành công') {
    toast.add({
      title,
      description: message,
      color: 'success',
    })
  }

  return {
    handleError,
    showSuccess,
  }
}
