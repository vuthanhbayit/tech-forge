/**
 * DELETE /api/admin/roles/:id
 * Delete a role
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Role ID is required' })
  }

  // Check if role exists
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  })

  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }

  // Prevent deleting system roles
  if (role.isSystem) {
    throw createError({ statusCode: 400, message: 'Không thể xóa role hệ thống' })
  }

  // Prevent deleting roles with users
  if (role._count.users > 0) {
    throw createError({
      statusCode: 400,
      message: `Không thể xóa role có ${role._count.users} người dùng`,
    })
  }

  // Delete role (RolePermission will be cascade deleted)
  await prisma.role.delete({
    where: { id },
  })

  return { success: true, message: 'Đã xóa role thành công' }
})
