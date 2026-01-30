/**
 * DELETE /api/admin/settings/:key
 * Delete a setting
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

  await prisma.setting.delete({
    where: { key },
  })

  return { success: true, message: 'Đã xóa setting thành công' }
})
