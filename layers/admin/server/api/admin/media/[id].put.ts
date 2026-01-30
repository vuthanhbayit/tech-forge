/**
 * PUT /api/admin/media/:id
 * Update media metadata
 */
import type { MediaUpdateInput } from '#shared/types'

export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'UPDATE')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw validationError('ID là bắt buộc')
  }

  const body = await readBody<MediaUpdateInput>(event)

  // Check if media exists
  const existing = await prisma.media.findUnique({
    where: { id },
  })

  if (!existing) {
    throw notFoundError('media')
  }

  // Validate folderId if provided
  if (body.folderId) {
    const folder = await prisma.mediaFolder.findUnique({
      where: { id: body.folderId },
    })
    if (!folder) {
      throw validationError('Folder không tồn tại')
    }
  }

  // Update
  const updated = await prisma.media.update({
    where: { id },
    data: {
      filename: body.filename?.trim() || undefined,
      alt: body.alt !== undefined ? body.alt : undefined,
      folderId: body.folderId !== undefined ? body.folderId : undefined,
    },
  })

  return {
    id: updated.id,
    filename: updated.filename,
    alt: updated.alt,
    folderId: updated.folderId,
    updatedAt: updated.updatedAt.toISOString(),
  }
})
