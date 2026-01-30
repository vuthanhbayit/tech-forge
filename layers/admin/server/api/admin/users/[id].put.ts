import { validateEmail, validatePassword, validatePhoneVN } from '#shared/utils'

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
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      throw createError({ statusCode: 400, message: emailValidation.error })
    }

    // Check if email is taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: body.email.toLowerCase(),
        id: { not: id },
      },
    })
    if (emailTaken) {
      throw createError({ statusCode: 400, message: 'Email đã được sử dụng' })
    }
  }

  // Validate and check if phone is taken by another user (if provided)
  if (body.phone) {
    const phoneValidation = validatePhoneVN(body.phone)
    if (!phoneValidation.valid) {
      throw createError({ statusCode: 400, message: phoneValidation.error })
    }

    const phoneTaken = await prisma.user.findFirst({
      where: {
        phone: phoneValidation.normalized,
        id: { not: id },
      },
    })
    if (phoneTaken) {
      throw createError({ statusCode: 400, message: 'Số điện thoại đã được sử dụng' })
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
  if (body.phone !== undefined) updateData.phone = body.phone ? validatePhoneVN(body.phone).normalized : null
  if (body.firstName !== undefined) updateData.firstName = body.firstName || null
  if (body.lastName !== undefined) updateData.lastName = body.lastName || null
  if (body.avatar !== undefined) updateData.avatar = body.avatar || null
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.roleId !== undefined) updateData.roleId = body.roleId || null
  if (body.metadata !== undefined) updateData.metadata = body.metadata

  // Hash new password if provided
  if (body.password) {
    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      throw createError({ statusCode: 400, message: passwordValidation.error })
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
