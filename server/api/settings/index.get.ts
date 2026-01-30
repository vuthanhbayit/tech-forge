/**
 * GET /api/settings
 * Get public settings (no authentication required)
 */
export default defineEventHandler(async () => {
  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
    select: {
      key: true,
      value: true,
      group: true,
    },
  })

  // Convert to key-value object for easier consumption
  const result: Record<string, unknown> = {}
  for (const setting of settings) {
    result[setting.key] = setting.value
  }

  return result
})
