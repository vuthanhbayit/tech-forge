/**
 * GET /api/admin/permissions
 * List all permissions, grouped by resource
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const query = getQuery(event)
  const grouped = query.grouped !== 'false'

  const permissions = await prisma.permission.findMany({
    orderBy: [{ group: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
  })

  if (!grouped) {
    return permissions
  }

  // Group by resource
  const groupedPermissions: Record<string, typeof permissions> = {}
  for (const perm of permissions) {
    const key = perm.group || perm.resource
    if (!groupedPermissions[key]) {
      groupedPermissions[key] = []
    }
    groupedPermissions[key].push(perm)
  }

  return groupedPermissions
})
