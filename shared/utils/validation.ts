/**
 * Shared validation utilities
 * Used by both server API routes and client-side forms
 */

import { REGEXP_EMAIL, REGEXP_VN_PHONE } from '@vt7/utils'

// =============================================================================
// Constants
// =============================================================================

export const MIN_PASSWORD_LENGTH = 8
export const MAX_EMAIL_LENGTH = 254 // RFC 5321

// =============================================================================
// Email Validation
// =============================================================================

export interface EmailValidationResult {
  valid: boolean
  error?: string
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email không được để trống' }
  }

  const trimmed = email.trim().toLowerCase()

  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email không được vượt quá ${MAX_EMAIL_LENGTH} ký tự` }
  }

  if (!REGEXP_EMAIL.test(trimmed)) {
    return { valid: false, error: 'Email không hợp lệ' }
  }

  return { valid: true }
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid
}

// =============================================================================
// Password Validation
// =============================================================================

export interface PasswordValidationResult {
  valid: boolean
  error?: string
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Mật khẩu không được để trống' }
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` }
  }

  return { valid: true }
}

export function isValidPassword(password: string): boolean {
  return validatePassword(password).valid
}

// =============================================================================
// Phone Validation (Vietnam)
// =============================================================================

export interface PhoneValidationResult {
  valid: boolean
  error?: string
  normalized?: string // Normalized format: 0xxxxxxxxx
}

export function validatePhoneVN(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Số điện thoại không được để trống' }
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')

  if (!REGEXP_VN_PHONE.test(cleaned)) {
    return { valid: false, error: 'Số điện thoại không hợp lệ (VN: 09x, 08x, 07x, 05x, 03x)' }
  }

  // Normalize to 0xxxxxxxxx format
  let normalized = cleaned
  if (cleaned.startsWith('+84')) {
    normalized = '0' + cleaned.slice(3)
  } else if (cleaned.startsWith('84') && cleaned.length === 11) {
    normalized = '0' + cleaned.slice(2)
  }

  return { valid: true, normalized }
}

export function isValidPhoneVN(phone: string): boolean {
  return validatePhoneVN(phone).valid
}

export function normalizePhoneVN(phone: string): string | null {
  const result = validatePhoneVN(phone)
  return result.valid ? (result.normalized ?? null) : null
}
