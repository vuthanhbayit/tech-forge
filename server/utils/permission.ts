import type { H3Event } from 'h3'
import type { PermissionAction, PermissionScope } from '@prisma/client'

interface SessionUser {
  id: string
  role: {
    name: string
    permissions: {
      permission: {
        resource: string
        action: PermissionAction
        scope: PermissionScope
      }
    }[]
  } | null
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: SessionUser | null,
  resource: string,
  action: PermissionAction,
  scope: PermissionScope = 'ALL',
): boolean {
  if (!user?.role) return false

  // Super admin has all permissions
  if (user.role.name === 'super_admin') return true

  const permissions = user.role.permissions

  // Check for exact permission
  const hasExact = permissions.some(
    p =>
      p.permission.resource === resource &&
      p.permission.action === action &&
      (p.permission.scope === scope || p.permission.scope === 'ALL'),
  )
  if (hasExact) return true

  // Check for MANAGE permission (implies all actions)
  const hasManage = permissions.some(
    p =>
      p.permission.resource === resource &&
      p.permission.action === 'MANAGE' &&
      (p.permission.scope === scope || p.permission.scope === 'ALL'),
  )

  return hasManage
}

/**
 * Require a specific permission, throw 403 if not authorized
 */
export async function requirePermission(
  event: H3Event,
  resource: string,
  action: PermissionAction,
  scope: PermissionScope = 'ALL',
): Promise<SessionUser> {
  const user = await getSessionUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (!hasPermission(user, resource, action, scope)) {
    throw createError({
      statusCode: 403,
      message: `Bạn không có quyền ${action.toLowerCase()} ${resource}`,
    })
  }

  return user as SessionUser
}

/**
 * Check if user can assign a specific role
 * - Super admin can assign any role
 * - Others need roles:UPDATE permission and cannot assign roles with higher permissions
 */
export function canAssignRole(user: SessionUser | null, targetRoleName: string | null): boolean {
  if (!user?.role) return false

  // Super admin can assign any role
  if (user.role.name === 'super_admin') return true

  // Cannot assign super_admin role
  if (targetRoleName === 'super_admin') return false

  // Need roles:UPDATE or roles:MANAGE permission
  return hasPermission(user, 'roles', 'UPDATE') || hasPermission(user, 'roles', 'MANAGE')
}
