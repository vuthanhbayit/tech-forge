/**
 * PUT /api/admin/users/:id
 * Update user
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

  const body = await readBody(event)

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id, deletedAt: null },
  })
  if (!existingUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
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

  // Validate role exists (if provided)
  if (body.roleId) {
    const role = await prisma.role.findUnique({
      where: { id: body.roleId },
    })
    if (!role) {
      throw createError({ statusCode: 400, message: 'Role not found' })
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
