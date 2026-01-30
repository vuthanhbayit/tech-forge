import { removeVietnameseTones, toKebabCase } from '@vt7/utils'

/**
 * Generate URL-friendly slug from Vietnamese text
 */
export function generateSlug(text: string): string {
  const withoutTones = removeVietnameseTones(text)
  return toKebabCase(withoutTones)
}
