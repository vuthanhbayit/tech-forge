/**
 * GET /api/admin/categories
 * List all categories with optional filters
 */
export default defineEventHandler(async event => {
  // Check authentication
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // TODO: Check permission (categories:read)

  const query = getQuery(event)
  const parentId = query.parentId as string | undefined
  const includeChildren = query.includeChildren === 'true'
  const onlyActive = query.onlyActive === 'true'

  const where: Record<string, unknown> = {}

  if (parentId === 'null' || parentId === '') {
    where.parentId = null // Root categories only
  } else if (parentId) {
    where.parentId = parentId
  }

  if (onlyActive) {
    where.isActive = true
  }

  const categories = await prisma.category.findMany({
    where,
    include: includeChildren
      ? {
          children: {
            orderBy: { rank: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        }
      : {
          _count: {
            select: { products: true, children: true },
          },
        },
    orderBy: { rank: 'asc' },
  })

  return categories
})
