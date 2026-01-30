/**
 * POST /api/admin/media/folders
 * Create new folder
 */
import type { MediaFolderInput } from '#shared/types'

export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'CREATE')

  const body = await readBody<MediaFolderInput>(event)

  if (!body.name?.trim()) {
    throw validationError('Tên folder là bắt buộc')
  }

  const name = body.name.trim()
  const parentId = body.parentId || null

  // Check if parent exists
  if (parentId) {
    const parent = await prisma.mediaFolder.findUnique({
      where: { id: parentId },
    })
    if (!parent) {
      throw validationError('Folder cha không tồn tại')
    }
  }

  // Check for duplicate name in same parent
  const existing = await prisma.mediaFolder.findFirst({
    where: {
      name,
      parentId,
    },
  })

  if (existing) {
    throw conflictError('Folder với tên này đã tồn tại trong thư mục hiện tại', 'name')
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      id: generateId('mediaFolder'),
      name,
      parentId,
    },
    include: {
      _count: {
        select: { children: true, files: true },
      },
    },
  })

  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    createdAt: folder.createdAt.toISOString(),
    updatedAt: folder.updatedAt.toISOString(),
    _count: folder._count,
  }
})
