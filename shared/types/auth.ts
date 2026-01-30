/**
 * Auth types
 */

import type { AuthPermission } from './permission'

// Current authenticated user
export interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatar: string | null
  role?: string
  permissions: AuthPermission[]
}

// Login
export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: true
  user: AuthUser
}

// Register
export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface RegisterResponse {
  success: true
  message: string
}

// Auth me
export interface AuthMeResponse {
  user: AuthUser
}
