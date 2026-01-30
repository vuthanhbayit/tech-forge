/**
 * POST /api/admin/media/upload
 * Upload file to S3
 */
import type { MediaUploadResult } from '#shared/types'
import { bytesToSize } from '@vt7/utils'

export default defineEventHandler(async event => {
  await requirePermission(event, 'media', 'CREATE')

  const user = await getSessionUser(event)
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw validationError('Không có file được upload')
  }

  const results: MediaUploadResult[] = []

  for (const file of formData) {
    if (file.name !== 'file' || !file.data || !file.type) {
      continue
    }

    const buffer = file.data
    const mimeType = file.type
    const originalName = file.filename || 'unnamed'

    // Validate file type
    if (!isAllowedMimeType(mimeType)) {
      throw validationError(`Loại file không được hỗ trợ: ${mimeType}`)
    }

    // Validate file size
    if (!isValidFileSize(buffer.length, mimeType)) {
      const maxSize = getMaxFileSize(mimeType)
      throw validationError(`File quá lớn. Tối đa ${bytesToSize(maxSize)}`)
    }

    const category = getMediaCategory(mimeType)
    let processedBuffer = buffer
    let width: number | null = null
    let height: number | null = null
    let thumbnailUrl: string | null = null
    let finalMimeType = mimeType

    // Process images
    if (category === 'image') {
      const processed = await processImage(buffer, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
        format: 'webp',
      })
      processedBuffer = processed.buffer
      width = processed.width
      height = processed.height
      finalMimeType = 'image/webp'

      // Generate thumbnail
      const thumbnailBuffer = await generateThumbnail(buffer, {
        width: 200,
        height: 200,
        quality: 80,
      })
      const thumbnailKey = generateS3Key(category, `thumb_${originalName}`)
      thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailKey, 'image/webp')
    }

    // Generate filename and upload
    const filename = generateFilename(originalName, finalMimeType)
    const s3Key = generateS3Key(category, filename)
    const url = await uploadToS3(processedBuffer, s3Key, finalMimeType)

    // Get folderId from form data
    const folderIdField = formData.find(f => f.name === 'folderId')
    const folderId = folderIdField?.data?.toString() || null

    // Save to database
    const media = await prisma.media.create({
      data: {
        id: generateId('media'),
        filename,
        originalName,
        mimeType: finalMimeType,
        size: processedBuffer.length,
        url,
        thumbnailUrl,
        width,
        height,
        folderId: folderId || null,
        uploadedById: user?.id || null,
      },
    })

    results.push({
      id: media.id,
      filename: media.filename,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      mimeType: media.mimeType,
      size: media.size,
      width: media.width,
      height: media.height,
    })
  }

  if (results.length === 0) {
    throw validationError('Không có file hợp lệ được upload')
  }

  return results
})
