/**
 * GET /api/admin/media/folders
 * List folders
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'READ')

  const query = getQuery(event)
  const parentId = query.parentId as string | undefined

  const where: Record<string, unknown> = {}
  if (parentId === 'null' || parentId === '') {
    where.parentId = null
  } else if (parentId) {
    where.parentId = parentId
  }

  const folders = await prisma.mediaFolder.findMany({
    where,
    include: {
      _count: {
        select: { children: true, files: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return folders.map(f => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
    _count: f._count,
  }))
})
