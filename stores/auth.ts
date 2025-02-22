import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = getAuth()
  const db = getFirestore()

  // Wait for authentication state
  const user = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe() // Stop listening after first response
      resolve(user)
    })
  })

  // If not authenticated, block access to protected routes
  if (!user) {
    if (to.path.startsWith('/admin') || to.path.startsWith('/user')) {
      return navigateTo('/login')
    }
    return
  }

  // Fetch user role from Firestore
  try {
    const userRef = doc(db, 'users', (user as any).uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      console.error('User document not found')
      return navigateTo('/login')
    }

    const role = userSnap.data()?.role || 'user' // Default to 'user'

    // Redirect based on role
    if (role === 'admin' && !to.path.startsWith('/admin')) {
      return navigateTo('/admin/dashboard')
    } else if (role === 'user' && !to.path.startsWith('/user')) {
      return navigateTo('/user/dashboard')
    }
  } catch (error) {
    console.error('Error fetching user role:', error)
    return navigateTo('/login')
  }
})
