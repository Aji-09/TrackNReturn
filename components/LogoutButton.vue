<script setup lang="ts">
import { useFirebaseAuth } from 'vuefire';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const auth = useFirebaseAuth();
const router = useRouter();

const logout = async () => {
  if (!auth) return;

  try {
    await signOut(auth);
    router.push('/auth/login'); // Redirect after logout

    // Force UI to update without refreshing the page
    setTimeout(() => {
      location.reload(); // ✅ Ensures complete state reset
    }, 100);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<template>
  <UButton color="neutral" variant="outline" @click="logout">
    Logout
  </UButton>
</template>
