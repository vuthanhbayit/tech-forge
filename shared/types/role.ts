/**
 * Role types
 */

import type { Permission } from './permission'

// Base role info
export interface RoleBase {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  isDefault: boolean
}

// Role for list view
export interface Role extends RoleBase {
  _count: {
    users: number
    permissions: number
  }
}

// Role for detail/edit view
export interface RoleDetail extends RoleBase {
  permissions: Array<{
    permission: Permission
  }>
}

// Role for select options
export interface RoleOption {
  id: string
  name: string
  displayName: string
}

// Input for create/update
export interface RoleInput {
  name: string
  displayName: string
  description?: string | null
  isDefault?: boolean
  permissionIds?: string[]
}
