/**
 * GET /api/admin/media/:id
 * Get media detail
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'READ')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw validationError('ID là bắt buộc')
  }

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!media) {
    throw notFoundError('media')
  }

  return {
    id: media.id,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType,
    size: media.size,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    width: media.width,
    height: media.height,
    alt: media.alt,
    folderId: media.folderId,
    folder: media.folder,
    uploadedBy: media.uploadedBy,
    metadata: media.metadata,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  }
})
