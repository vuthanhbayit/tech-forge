/**
 * GET /api/admin/roles/:id
 * Get single role with permissions
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'roles', 'READ')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Role ID is required' })
  }

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
  })

  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }

  return role
})
