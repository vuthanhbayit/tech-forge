/**
 * POST /api/admin/users
 * Create a new user (admin creates user)
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  // Validate required fields
  if (!body.email) {
    throw createError({ statusCode: 400, message: 'Email is required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({ statusCode: 400, message: 'Invalid email format' })
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  })
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Email already exists' })
  }

  // Check if phone already exists (if provided)
  if (body.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: body.phone },
    })
    if (existingPhone) {
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

  // Hash password if provided
  let passwordHash: string | null = null
  if (body.password) {
    if (body.password.length < 6) {
      throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' })
    }
    passwordHash = await hashPassword(body.password)
  }

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      phone: body.phone || null,
      passwordHash,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      avatar: body.avatar || null,
      isActive: body.isActive ?? true,
      roleId: body.roleId || null,
      metadata: body.metadata || null,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      avatar: true,
      isActive: true,
      createdAt: true,
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
