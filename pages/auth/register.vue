<script setup lang="ts">
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { useToast } from '#imports';

const auth = getAuth();
const db = getFirestore();
const router = useRouter();
const toast = useToast();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isStudent = ref('');
const gradeLevel = ref('');
const course = ref('');
const errorMessage = ref('');

const grades = ref(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']);
const courses = ref(['ABM', 'HUMMS', 'STEM', 'TVL']);

const register = async () => {
  errorMessage.value = '';

  if (!name.value.trim()) {
    errorMessage.value = 'Name is required!';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match!';
    return;
  }

  if (isStudent.value === 'yes') {
    if (!gradeLevel.value) {
      errorMessage.value = 'Grade Level is required!';
      return;
    }

    if ((gradeLevel.value === 'Grade 11' || gradeLevel.value === 'Grade 12') && !course.value) {
      errorMessage.value = 'Course is required for Grade 11 and 12!';
      return;
    }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value.trim());
    const user = userCredential.user;

    if (!user) throw new Error('User registration failed.');

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name: name.value.trim(),
      email: user.email,
      isStudent: isStudent.value === 'yes',
      gradeLevel: isStudent.value === 'yes' ? gradeLevel.value : '',
      course: isStudent.value === 'yes' && (gradeLevel.value === 'Grade 11' || gradeLevel.value === 'Grade 12') ? course.value : '',
      role: 'user',
      emailVerified: false,
      createdAt: new Date(),
    });

    await sendEmailVerification(user);

    // ✅ Show toast notification for verification email
    toast.add({
      title: 'Registration Successful!',
      description: 'Check your email (including spam) for the verification link.',
      icon: 'i-heroicons-envelope',
      color: 'success',
    });

    setTimeout(async () => {
      await signOut(auth);
      router.push('/auth/login');
    }, 3000);
  } catch (error: any) {
    console.error('Registration Error:', error);
    errorMessage.value =
      error.code === 'auth/email-already-in-use' ? 'This email is already registered. Please log in instead.' :
      error.code === 'auth/weak-password' ? 'Password must be at least 6 characters!' :
      'An error occurred. Please try again.';
  }
};
</script>

<template>
  <NavbarGuest />
  <div class="flex justify-center items-center min-h-screen">
    <div class="bg-white dark:bg-zinc-900 border-red-200 shadow-lg border p-12 rounded-lg w-full max-w-md">
      <h2 class="text-2xl font-semibold text-center text-red-600 dark:text-red-400 mb-4">Register</h2>

      <input v-model="name" type="text" placeholder="Full Name" class="w-full p-3 mb-4 border rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" />

      <input v-model="email" type="email" placeholder="Email" class="w-full p-3 mb-4 border rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" />

      <!-- Student Status -->
      <div class="mb-4">
        <label class="block text-zinc-800 dark:text-zinc-200 mb-2">Are you a student?</label>
        <div class="flex gap-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="isStudent" value="yes" class="w-5 h-5">
            <span class="text-zinc-800 dark:text-zinc-200">Yes</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" v-model="isStudent" value="no" class="w-5 h-5">
            <span class="text-zinc-800 dark:text-zinc-200">No</span>
          </label>
        </div>
      </div>

      <!-- Grade Level (only if "Yes" is selected) -->
      <select v-if="isStudent === 'yes'" v-model="gradeLevel" class="w-full p-3 mb-4 border rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
        <option value="" disabled selected>Select Grade Level</option>
        <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
      </select>

      <!-- Course (only for Grade 11 & 12) -->
      <select
        v-if="isStudent === 'yes'"
        v-model="course"
        :disabled="!['Grade 11', 'Grade 12'].includes(gradeLevel)"
        class="w-full p-3 mb-4 border rounded-md text-zinc-800 dark:text-zinc-200"
        :class="{'bg-zinc-200 dark:bg-zinc-600': !['Grade 11', 'Grade 12'].includes(gradeLevel)}"
      >
        <option value="" disabled selected>Select Course</option>
        <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
      </select>

      <input v-model="password" type="password" placeholder="Password" class="w-full p-3 mb-4 border rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="w-full p-3 mb-4 border rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" />

      <button @click="register" class="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400">
        Register
      </button>

      <p v-if="errorMessage" class="mt-4 text-red-500 text-center">{{ errorMessage }}</p>

      <div class="text-center mt-4">
        <NuxtLink to="/auth/login" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300">
          Already have an account? Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
