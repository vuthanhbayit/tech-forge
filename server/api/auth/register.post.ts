interface RegisterBody {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export default defineEventHandler(async event => {
  const body = await readBody<RegisterBody>(event)

  // Validation
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email và mật khẩu là bắt buộc',
    })
  }

  if (body.password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
    })
  }

  // Check email exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'Email đã được sử dụng',
    })
  }

  // Check phone exists
  if (body.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: body.phone },
    })

    if (existingPhone) {
      throw createError({
        statusCode: 400,
        message: 'Số điện thoại đã được sử dụng',
      })
    }
  }

  // Get default customer role
  const defaultRole = await prisma.role.findFirst({
    where: { isDefault: true },
  })

  // Create user
  const passwordHash = await hashPassword(body.password)
  const user = await prisma.user.create({
    data: {
      id: generateId('user'),
      email: body.email.toLowerCase(),
      passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      roleId: defaultRole?.id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      createdAt: true,
    },
  })

  // Create session
  await createSession(user.id, event)

  return {
    success: true,
    user,
  }
})
