/**
 * Permission types
 */

export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE'
export type PermissionScope = 'OWN' | 'ALL'

// Permission for API responses
export interface Permission {
  id: string
  resource: string
  action: PermissionAction
  scope: PermissionScope
  name: string
  description: string | null
  group: string | null
}

// Simplified permission for auth context
export interface AuthPermission {
  resource: string
  action: string
  scope: string
}

// Grouped permissions response
export type GroupedPermissions = Record<string, Permission[]>
