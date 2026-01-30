/**
 * User types
 */

import type { AddressSummary } from './address'
import type { RoleOption } from './role'

// User for list view
export interface User {
  id: string
  email: string
  phone: string | null
  firstName: string | null
  lastName: string | null
  avatar: string | null
  isActive: boolean
  emailVerified: string | null
  lastLoginAt: string | null
  createdAt: string
  role: RoleOption | null
  _count: {
    orders: number
  }
}

// User for detail view
export interface UserDetail extends User {
  phoneVerified: string | null
  metadata: unknown
  updatedAt: string
  addresses: AddressSummary[]
  _count: {
    orders: number
    reviews: number
  }
}

// API responses
export interface UserListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Input types
export interface UserCreateInput {
  email: string
  password?: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  roleId?: string | null
  isActive?: boolean
}

export interface UserUpdateInput {
  email?: string
  password?: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  roleId?: string | null
  isActive?: boolean
}
