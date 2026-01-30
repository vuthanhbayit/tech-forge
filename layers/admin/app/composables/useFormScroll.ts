import type { FormErrorEvent } from '@nuxt/ui'

/**
 * Composable to handle form error scrolling
 * Scrolls to the first field with validation error
 */
export function useFormScroll() {
  /**
   * Scroll to the first field with error
   * @param errors - Array of form errors from FormErrorEvent
   */
  function scrollToError(errors: FormErrorEvent['errors']) {
    if (!errors.length) return

    const firstError = errors[0]
    if (!firstError?.name) return

    const firstErrorName = firstError.name

    // Find the form field - UFormField wraps content with name for matching
    // Try multiple selectors to find the field
    const errorField =
      // Try finding by input/textarea/select name attribute
      document.querySelector(
        `input[name="${firstErrorName}"], textarea[name="${firstErrorName}"], select[name="${firstErrorName}"]`,
      ) ||
      // Try finding by label's for attribute
      document.querySelector(`label[for="${firstErrorName}"]`)?.closest('[class*="formField"]') ||
      // Try finding form field wrapper that contains error message for this field
      document.querySelector(`[id="${firstErrorName}"]`)

    if (errorField) {
      errorField.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      // Focus the input after scroll
      setTimeout(() => {
        const input = errorField.matches('input, textarea, select')
          ? (errorField as HTMLElement)
          : (errorField.querySelector('input, textarea, select, [tabindex]') as HTMLElement)
        input?.focus()
      }, 300)
    }
  }

  return {
    scrollToError,
  }
}
