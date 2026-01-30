export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser } = useAuth()

  // Fetch user if not loaded yet
  if (!user.value) {
    await fetchUser()
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }
})
