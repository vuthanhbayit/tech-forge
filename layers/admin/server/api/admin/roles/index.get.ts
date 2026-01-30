/**
 * GET /api/admin/roles
 * List all roles with user count
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'roles', 'READ')

  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true, permissions: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return roles
})
