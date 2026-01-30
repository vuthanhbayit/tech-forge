/**
 * GET /api/admin/settings/:key
 * Get single setting by key
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'settings', 'READ')

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
