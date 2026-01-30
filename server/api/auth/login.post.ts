interface LoginBody {
  email: string
  password: string
}

export default defineEventHandler(async event => {
  const body = await readBody<LoginBody>(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email và mật khẩu là bắt buộc',
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  })

  if (!user || !user.passwordHash) {
    throw createError({
      statusCode: 401,
      message: 'Email hoặc mật khẩu không đúng',
    })
  }

  if (!user.isActive) {
    throw createError({
      statusCode: 401,
      message: 'Tài khoản đã bị vô hiệu hóa',
    })
  }

  if (user.deletedAt) {
    throw createError({
      statusCode: 401,
      message: 'Tài khoản không tồn tại',
    })
  }

  const isValidPassword = await verifyPassword(body.password, user.passwordHash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Email hoặc mật khẩu không đúng',
    })
  }

  // Create session
  await createSession(user.id, event)

  // Format permissions
  const permissions =
    user.role?.permissions.map(rp => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.scope || rp.permission.scope,
    })) || []

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role?.name,
      permissions,
    },
  }
})
