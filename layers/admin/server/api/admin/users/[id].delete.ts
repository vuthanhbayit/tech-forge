/**
 * DELETE /api/admin/users/:id
 * Soft delete user
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: {
      role: true,
    },
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Prevent deleting super_admin
  if (user.role?.name === 'super_admin') {
    throw createError({ statusCode: 400, message: 'Cannot delete super admin user' })
  }

  // Prevent self-deletion
  if (user.id === session.id) {
    throw createError({ statusCode: 400, message: 'Cannot delete your own account' })
  }

  // Soft delete user
  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  })

  // Delete all sessions of the user
  await prisma.session.deleteMany({
    where: { userId: id },
  })

  return { success: true, message: 'User deleted successfully' }
})
