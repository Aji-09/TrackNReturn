<template>
    <div>
      <component :is="navbarComponent" />
      <slot />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useFirebaseAuth } from 'vuefire'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  
  // Define userRole with an explicit type (string or null)
  const userRole = ref<string | null>(null)
  
  const auth = useFirebaseAuth() // VueFire's Firebase Auth wrapper
  
  onMounted(() => {
    const firebaseAuth = getAuth()
  
    onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult()
        userRole.value = (token.claims.role as string) || 'user' // Ensure role is always a string
      } else {
        userRole.value = null
      }
    })
  })
  
  // Dynamically select the correct Navbar component
  const navbarComponent = computed<string>(() => {
    if (!auth?.currentUser) return 'NavbarGuest'
    return userRole.value === 'admin' ? 'NavbarAdmin' : 'NavbarUser'
  })
  </script>
  