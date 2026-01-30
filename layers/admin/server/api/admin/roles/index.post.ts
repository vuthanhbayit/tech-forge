/**
 * POST /api/admin/roles
 * Create a new role
 */
export default defineEventHandler(async event => {
  await requirePermission(event, 'roles', 'CREATE')

  const body = await readBody(event)

  // Validate required fields
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên role là bắt buộc' })
  }

  if (!body.displayName?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên hiển thị là bắt buộc' })
  }

  // Check name uniqueness
  const existingRole = await prisma.role.findUnique({
    where: { name: body.name.trim() },
  })

  if (existingRole) {
    throw createError({ statusCode: 400, message: 'Tên role đã tồn tại' })
  }

  const role = await prisma.role.create({
    data: {
      id: generateId('role'),
      name: body.name.trim(),
      displayName: body.displayName.trim(),
      description: body.description?.trim() || null,
      isSystem: false,
      isDefault: body.isDefault ?? false,
    },
  })

  // Add permissions if provided
  if (body.permissionIds?.length > 0) {
    await prisma.rolePermission.createMany({
      data: body.permissionIds.map((permissionId: string) => ({
        roleId: role.id,
        permissionId,
      })),
    })
  }

  // Return role with permissions
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return roleWithPermissions
})
