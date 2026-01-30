/**
 * GET /api/admin/settings
 * List all settings, optionally grouped
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'settings', 'READ')

  const query = getQuery(event)
  const group = query.group as string | undefined
  const grouped = query.grouped === 'true'

  const where: Record<string, unknown> = {}
  if (group) {
    where.group = group
  }

  const settings = await prisma.setting.findMany({
    where,
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  })

  if (!grouped) {
    return settings
  }

  // Group by group field
  const groupedSettings: Record<string, typeof settings> = {}
  for (const setting of settings) {
    const key = setting.group || 'general'
    if (!groupedSettings[key]) {
      groupedSettings[key] = []
    }
    groupedSettings[key].push(setting)
  }

  return groupedSettings
})
