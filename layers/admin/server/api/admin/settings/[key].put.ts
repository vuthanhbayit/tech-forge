/**
 * PUT /api/admin/settings/:key
 * Update or create a setting
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Setting key is required' })
  }

  const body = await readBody(event)

  if (body.value === undefined) {
    throw createError({ statusCode: 400, message: 'Value is required' })
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: {
      value: body.value,
      group: body.group,
      isPublic: body.isPublic,
      metadata: body.metadata,
    },
    create: {
      key,
      value: body.value,
      group: body.group || null,
      isPublic: body.isPublic ?? false,
      metadata: body.metadata || null,
    },
  })

  return setting
})
