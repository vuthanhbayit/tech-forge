export default defineEventHandler(async event => {
  await deleteSession(event)

  return {
    success: true,
    message: 'Đăng xuất thành công',
  }
})
