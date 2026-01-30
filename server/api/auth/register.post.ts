import { validateEmail, validatePassword, validatePhoneVN } from '#shared/utils'

interface RegisterBody {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export default defineEventHandler(async event => {
  const body = await readBody<RegisterBody>(event)

  // Validate email
  const emailValidation = validateEmail(body.email)
  if (!emailValidation.valid) {
    throw createError({
      statusCode: 400,
      message: emailValidation.error,
    })
  }

  // Validate password
  const passwordValidation = validatePassword(body.password)
  if (!passwordValidation.valid) {
    throw createError({
      statusCode: 400,
      message: passwordValidation.error,
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

  // Validate and check phone exists
  let normalizedPhone: string | undefined
  if (body.phone) {
    const phoneValidation = validatePhoneVN(body.phone)
    if (!phoneValidation.valid) {
      throw createError({
        statusCode: 400,
        message: phoneValidation.error,
      })
    }
    normalizedPhone = phoneValidation.normalized

    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
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
      phone: normalizedPhone,
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
