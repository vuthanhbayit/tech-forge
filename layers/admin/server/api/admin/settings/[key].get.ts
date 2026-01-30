/**
 * GET /api/admin/settings/:key
 * Get single setting by key
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

  const setting = await prisma.setting.findUnique({
    where: { key },
  })

  if (!setting) {
    throw createError({ statusCode: 404, message: 'Setting not found' })
  }

  return setting
})
