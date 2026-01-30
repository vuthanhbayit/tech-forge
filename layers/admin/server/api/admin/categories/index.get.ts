/**
 * GET /api/admin/categories
 * List all categories with optional filters
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'categories', 'READ')

  const query = getQuery(event)
  const parentId = query.parentId as string | undefined
  const includeChildren = query.includeChildren === 'true'
  const onlyActive = query.onlyActive === 'true'
  const excludeId = query.excludeId as string | undefined

  const where: Record<string, unknown> = {}

  // Exclude a category and all its descendants (for parent selection)
  if (excludeId) {
    const excludeIds = await getDescendantIds(excludeId)
    excludeIds.push(excludeId)
    where.id = { notIn: excludeIds }
  }

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
          parent: {
            select: { id: true, name: true },
          },
          _count: {
            select: { products: true },
          },
        }
      : {
          parent: {
            select: { id: true, name: true },
          },
          _count: {
            select: { products: true, children: true },
          },
        },
    orderBy: { rank: 'asc' },
  })

  return categories
})
