/**
 * GET /api/admin/categories/:id
 * Get single category by ID
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Category ID is required' })
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        orderBy: { rank: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  return category
})
