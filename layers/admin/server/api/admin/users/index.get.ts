/**
 * GET /api/admin/users
 * List users with pagination, search, and filter
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'users', 'READ')

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const search = (query.search as string) || ''
  const roleId = (query.roleId as string) || ''
  const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined

  const where = {
    ...withoutDeleted(),
    ...searchFilter(search, ['email', 'firstName', 'lastName', 'phone']),
    ...(roleId && { roleId }),
    ...(isActive !== undefined && { isActive }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...paginate(page, limit),
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    pagination: buildPaginationInfo(page, limit, total),
  }
})
