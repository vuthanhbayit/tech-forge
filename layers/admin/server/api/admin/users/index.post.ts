import { validateEmail, validatePassword, validatePhoneVN } from '#shared/utils'

/**
 * POST /api/admin/users
 * Create a new user (admin creates user)
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'users', 'CREATE')

  const body = await readBody(event)

  // Validate email
  const emailValidation = validateEmail(body.email)
  if (!emailValidation.valid) {
    throw createError({ statusCode: 400, message: emailValidation.error })
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  })
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Email already exists' })
  }

  // Validate and check if phone already exists (if provided)
  if (body.phone) {
    const phoneValidation = validatePhoneVN(body.phone)
    if (!phoneValidation.valid) {
      throw createError({ statusCode: 400, message: phoneValidation.error })
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: phoneValidation.normalized },
    })
    if (existingPhone) {
      throw createError({ statusCode: 400, message: 'Số điện thoại đã được sử dụng' })
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
    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      throw createError({ statusCode: 400, message: passwordValidation.error })
    }
    passwordHash = await hashPassword(body.password)
  }

  const user = await prisma.user.create({
    data: {
      id: generateId('user'),
      email: body.email.toLowerCase(),
      phone: body.phone ? validatePhoneVN(body.phone).normalized : null,
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
