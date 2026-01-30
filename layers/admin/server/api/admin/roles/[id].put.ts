/**
 * PUT /api/admin/roles/:id
 * Update a role
 */
export default defineEventHandler(async event => {
  const session = await getSessionUser(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Role ID is required' })
  }

  const body = await readBody(event)

  // Check if role exists
  const existingRole = await prisma.role.findUnique({
    where: { id },
  })

  if (!existingRole) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }

  // Prevent modifying system roles (except permissions)
  if (existingRole.isSystem && (body.name || body.displayName || body.description !== undefined)) {
    throw createError({ statusCode: 400, message: 'Không thể sửa role hệ thống' })
  }

  // Check name uniqueness if changed
  if (body.name && body.name !== existingRole.name) {
    const nameExists = await prisma.role.findUnique({
      where: { name: body.name },
    })
    if (nameExists) {
      throw createError({ statusCode: 400, message: 'Tên role đã tồn tại' })
    }
  }

  // Build update data
  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name.trim()
  if (body.displayName !== undefined) updateData.displayName = body.displayName.trim()
  if (body.description !== undefined) updateData.description = body.description?.trim() || null
  if (body.isDefault !== undefined) updateData.isDefault = body.isDefault

  // Update role
  if (Object.keys(updateData).length > 0) {
    await prisma.role.update({
      where: { id },
      data: updateData,
    })
  }

  // Update permissions if provided
  if (body.permissionIds !== undefined) {
    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    })

    // Add new permissions
    if (body.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: body.permissionIds.map((permissionId: string) => ({
          roleId: id,
          permissionId,
        })),
      })
    }
  }

  // Return updated role with permissions
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
  })

  return role
})
