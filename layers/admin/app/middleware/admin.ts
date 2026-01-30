export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser, isAdmin } = useAuth()

  // Fetch user if not loaded yet
  if (!user.value) {
    await fetchUser()
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }

  // Redirect to home if not admin
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
