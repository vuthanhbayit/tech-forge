/**
 * DELETE /api/admin/categories/:id
 * Delete a category
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // TODO: Check permission (categories:delete)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Category ID is required' })
  }

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, products: true },
      },
    },
  })

  if (!category) {
    throw createError({ statusCode: 404, message: 'Category not found' })
  }

  // Prevent deletion if has children
  if (category._count.children > 0) {
    throw createError({
      statusCode: 400,
      message: `Không thể xóa danh mục có ${category._count.children} danh mục con`,
    })
  }

  // Prevent deletion if has products
  if (category._count.products > 0) {
    throw createError({
      statusCode: 400,
      message: `Không thể xóa danh mục có ${category._count.products} sản phẩm`,
    })
  }

  await prisma.category.delete({
    where: { id },
  })

  return { success: true, message: 'Đã xóa danh mục thành công' }
})
