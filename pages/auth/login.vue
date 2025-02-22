<script setup lang="ts">
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";
import { useToast } from "#imports";

const auth = getAuth();
const db = getFirestore();
const router = useRouter();
const toast = useToast();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showResendButton = ref(false);
const loading = ref(false);

const login = async () => {
  errorMessage.value = "";
  showResendButton.value = false;
  loading.value = true;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value.trim()
    );
    const user = userCredential.user;

    if (!user) throw new Error("User authentication failed.");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User data not found in Firestore.");
    }

    const userData = userDoc.data();
    const role = userData.role || "user";

    if (role !== "admin" && !user.emailVerified) {
      errorMessage.value = "Please verify your email before logging in.";
      showResendButton.value = true;
      await signOut(auth);

      // ✅ Show toast notification with highlighted spam folder text
      toast.add({
        title: "Email Not Verified!",
        description: () =>
          h("span", [
            "Please check your inbox and ",
            h("strong", "spam folder"),
            " for the verification email.",
          ]),
        icon: "i-heroicons-envelope",
        color: "warning",
      });

      return;
    }

    router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  } catch (error: any) {
    console.error("Login Error:", error);
    errorMessage.value =
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password"
        ? "Invalid email or password."
        : "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);

      // ✅ Show toast notification with highlighted spam folder text
      toast.add({
        title: "Email Not Verified!",
        description: () =>
          h("span", [
            "Please check your inbox and ",
            h("strong", { class: "bg" }, "spam folder"),
            " for the verification email.",
          ]),
        icon: "i-heroicons-envelope",
        color: "warning",
      });

      showResendButton.value = false;
    }
  } catch {
    errorMessage.value =
      "Failed to send verification email. Please try again later.";
  }
};
</script>

<template>
  <NavbarGuest />
  <div class="flex justify-center items-center min-h-screen">
    <div
      class="bg-white dark:bg-zinc-900 border-red-200 shadow-lg border p-12 rounded-lg w-full max-w-md"
    >
      <h2
        class="text-2xl font-semibold text-center text-red-600 dark:text-red-400 mb-4"
      >
        Login
      </h2>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full p-3 mb-4 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-3 mb-4 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-50 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
      />

      <button
        @click="login"
        :disabled="loading"
        class="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400"
      >
        {{ loading ? "Logging in..." : "Login" }}
      </button>

      <p v-if="errorMessage" class="mt-4 text-red-500 text-center">
        {{ errorMessage }}
      </p>

      <button
        v-if="showResendButton"
        @click="resendVerificationEmail"
        class="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline block mx-auto"
      >
        Resend Verification Email
      </button>

      <div class="text-center mt-4">
        <NuxtLink
          to="/auth/register"
          class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
        >
          Don't have an account? Register
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
