/**
 * GET /api/admin/roles
 * List all roles with user count
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

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
