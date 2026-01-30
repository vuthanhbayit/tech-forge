/**
 * PUT /api/admin/categories/:id
 * Update a category
 */
export default defineEventHandler(async event => {
  const session = await requirePermission(event, 'categories', 'UPDATE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Category ID is required' })
  }

  const body = await readBody(event)

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  })

  if (!existingCategory) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  // Validate name if provided
  if (body.name !== undefined && !body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên danh mục không được để trống' })
  }

  // Check slug uniqueness if changed
  if (body.slug && body.slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: body.slug },
    })
    if (slugExists) {
      throw createError({ statusCode: 400, message: 'Slug đã tồn tại' })
    }
  }

  // Validate parent if provided (prevent circular reference)
  if (body.parentId !== undefined) {
    if (body.parentId === id) {
      throw createError({ statusCode: 400, message: 'Danh mục không thể là cha của chính nó' })
    }

    if (body.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: body.parentId },
      })
      if (!parent) {
        throw createError({ statusCode: 400, message: 'Danh mục cha không tồn tại' })
      }

      // Check for circular reference (parent can't be a descendant)
      let currentParent = parent
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          throw createError({ statusCode: 400, message: 'Không thể tạo tham chiếu vòng tròn' })
        }
        const nextParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId },
        })
        if (!nextParent) break
        currentParent = nextParent
      }
    }
  }

  // Build update data
  const updateData: Record<string, unknown> = {}

  if (body.name !== undefined) updateData.name = body.name.trim()
  if (body.slug !== undefined) updateData.slug = body.slug.trim() || generateSlug(body.name || existingCategory.name)
  if (body.description !== undefined) updateData.description = body.description?.trim() || null
  if (body.image !== undefined) updateData.image = body.image || null
  if (body.parentId !== undefined) updateData.parentId = body.parentId || null
  if (body.rank !== undefined) updateData.rank = body.rank
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.specTemplate !== undefined) updateData.specTemplate = body.specTemplate || null
  if (body.metadata !== undefined) updateData.metadata = body.metadata || null

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      parent: true,
      children: {
        orderBy: { rank: 'asc' },
      },
    },
  })

  // Emit event for subscribers (cache invalidation, etc.)
  serverEvents.emit('category:updated', {
    id: category.id,
    changes: updateData,
    _meta: { userId: session.id },
  })

  return category
})
