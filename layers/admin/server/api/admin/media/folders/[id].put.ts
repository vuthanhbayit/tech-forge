/**
 * PUT /api/admin/media/folders/:id
 * Rename folder
 */
import type { MediaFolderInput } from '#shared/types'

export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'UPDATE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw validationError('ID là bắt buộc')
  }

  const body = await readBody<MediaFolderInput>(event)

  if (!body.name?.trim()) {
    throw validationError('Tên folder là bắt buộc')
  }

  const name = body.name.trim()

  // Check if folder exists
  const existing = await prisma.mediaFolder.findUnique({
    where: { id },
  })

  if (!existing) {
    throw notFoundError('folder')
  }

  // Check for duplicate name in same parent
  const duplicate = await prisma.mediaFolder.findFirst({
    where: {
      name,
      parentId: existing.parentId,
      id: { not: id },
    },
  })

  if (duplicate) {
    throw conflictError('Folder với tên này đã tồn tại trong thư mục hiện tại', 'name')
  }

  const updated = await prisma.mediaFolder.update({
    where: { id },
    data: { name },
    include: {
      _count: {
        select: { children: true, files: true },
      },
    },
  })

  return {
    id: updated.id,
    name: updated.name,
    parentId: updated.parentId,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    _count: updated._count,
  }
})
