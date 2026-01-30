/**
 * PUT /api/admin/users/:id
 * Update user
 */
export default defineEventHandler(async event => {
  // Check users:UPDATE permission
  const session = await requirePermission(event, 'users', 'UPDATE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'User ID is required' })
  }

  const body = await readBody(event)

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    include: { role: true },
  })
  if (!existingUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Cannot edit super_admin user (unless you are super_admin)
  if (existingUser.role?.name === 'super_admin' && session.role?.name !== 'super_admin') {
    throw createError({ statusCode: 403, message: 'Không thể chỉnh sửa Super Admin' })
  }

  // Validate email format if provided
  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({ statusCode: 400, message: 'Invalid email format' })
    }

    // Check if email is taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: body.email.toLowerCase(),
        id: { not: id },
      },
    })
    if (emailTaken) {
      throw createError({ statusCode: 400, message: 'Email already exists' })
    }
  }

  // Check if phone is taken by another user (if provided)
  if (body.phone) {
    const phoneTaken = await prisma.user.findFirst({
      where: {
        phone: body.phone,
        id: { not: id },
      },
    })
    if (phoneTaken) {
      throw createError({ statusCode: 400, message: 'Phone number already exists' })
    }
  }

  // Validate and check permission for role change
  if (body.roleId !== undefined && body.roleId !== existingUser.roleId) {
    // Need roles:UPDATE permission to change user's role
    if (!hasPermission(session, 'roles', 'UPDATE')) {
      throw createError({ statusCode: 403, message: 'Bạn không có quyền thay đổi role của người dùng' })
    }

    if (body.roleId) {
      const targetRole = await prisma.role.findUnique({
        where: { id: body.roleId },
      })
      if (!targetRole) {
        throw createError({ statusCode: 400, message: 'Role not found' })
      }

      // Cannot assign super_admin role (unless you are super_admin)
      if (targetRole.name === 'super_admin' && session.role?.name !== 'super_admin') {
        throw createError({ statusCode: 403, message: 'Không thể gán role Super Admin' })
      }
    }
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {}

  if (body.email !== undefined) updateData.email = body.email.toLowerCase()
  if (body.phone !== undefined) updateData.phone = body.phone || null
  if (body.firstName !== undefined) updateData.firstName = body.firstName || null
  if (body.lastName !== undefined) updateData.lastName = body.lastName || null
  if (body.avatar !== undefined) updateData.avatar = body.avatar || null
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.roleId !== undefined) updateData.roleId = body.roleId || null
  if (body.metadata !== undefined) updateData.metadata = body.metadata

  // Hash new password if provided
  if (body.password) {
    if (body.password.length < 6) {
      throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' })
    }
    updateData.passwordHash = await hashPassword(body.password)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  })

  return user
})
