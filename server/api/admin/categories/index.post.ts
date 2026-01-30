/**
 * POST /api/admin/categories
 * Create a new category
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // TODO: Check permission (categories:create)

  const body = await readBody(event)

  // Validate required fields
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên danh mục là bắt buộc' })
  }

  // Generate slug if not provided
  const slug = body.slug?.trim() || generateSlug(body.name)

  // Check slug uniqueness
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  })

  if (existingCategory) {
    throw createError({ statusCode: 400, message: 'Slug đã tồn tại' })
  }

  // Validate parent exists if provided
  if (body.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: body.parentId },
    })
    if (!parent) {
      throw createError({ statusCode: 400, message: 'Danh mục cha không tồn tại' })
    }
  }

  // Get max rank for ordering
  const maxRankResult = await prisma.category.aggregate({
    where: { parentId: body.parentId || null },
    _max: { rank: true },
  })
  const nextRank = (maxRankResult._max.rank || 0) + 1

  const category = await prisma.category.create({
    data: {
      id: generateId('category'),
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      image: body.image || null,
      parentId: body.parentId || null,
      rank: body.rank ?? nextRank,
      isActive: body.isActive ?? true,
      specTemplate: body.specTemplate || null,
      metadata: body.metadata || null,
    },
    include: {
      parent: true,
    },
  })

  return category
})
