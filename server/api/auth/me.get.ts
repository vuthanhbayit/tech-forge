export default defineEventHandler(async event => {
  const user = await getSessionUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Chưa đăng nhập',
    })
  }

  // Format permissions
  const permissions =
    user.role?.permissions.map(rp => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.scope || rp.permission.scope,
    })) || []

  return {
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
