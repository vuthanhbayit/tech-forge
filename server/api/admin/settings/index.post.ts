/**
 * POST /api/admin/settings
 * Bulk upsert settings
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  // Expect body to be an array of settings or an object { key: value }
  let settingsToUpsert: Array<{ key: string; value: unknown; group?: string; isPublic?: boolean }>

  if (Array.isArray(body)) {
    settingsToUpsert = body
  } else if (typeof body === 'object' && body !== null) {
    // Convert { key: value } format to array
    settingsToUpsert = Object.entries(body).map(([key, value]) => ({
      key,
      value,
    }))
  } else {
    throw createError({ statusCode: 400, message: 'Invalid body format' })
  }

  if (settingsToUpsert.length === 0) {
    throw createError({ statusCode: 400, message: 'No settings provided' })
  }

  // Validate all settings have key and value
  for (const setting of settingsToUpsert) {
    if (!setting.key) {
      throw createError({ statusCode: 400, message: 'Setting key is required' })
    }
    if (setting.value === undefined) {
      throw createError({ statusCode: 400, message: `Value is required for key: ${setting.key}` })
    }
  }

  // Upsert all settings in a transaction
  const results = await prisma.$transaction(
    settingsToUpsert.map(setting =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          group: setting.group,
          isPublic: setting.isPublic,
        },
        create: {
          key: setting.key,
          value: setting.value,
          group: setting.group || null,
          isPublic: setting.isPublic ?? false,
        },
      })
    )
  )

  return results
})
