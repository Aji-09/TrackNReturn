<script setup lang="ts">
import { useFirestore, useCollection, useCurrentUser } from "vuefire";
import {
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { computed, ref } from "vue";

const db = useFirestore();
const currentUser = useCurrentUser();
const usersCollection = useCollection(
  query(collection(db, "users"), orderBy("role"))
); // Order users by role for consistency

const users = computed(() => {
  console.log("Fetched users:", usersCollection.value); // Debugging log
  return usersCollection.value || [];
});

const updatedRoles = ref<Record<string, string>>({});

// Update Role
const saveRole = async (userId: string) => {
  if (updatedRoles.value[userId]) {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: updatedRoles.value[userId],
      });
      alert("User role updated successfully.");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    }
  }
};

// Delete User
const deleteUser = async (userId: string) => {
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone!"
    )
  ) {
    try {
      await deleteDoc(doc(db, "users", userId));
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  }
};

// Block or Unblock User
const blockUser = async (userId: string, currentRole: string) => {
  const action = currentRole === "blocked" ? "unblock" : "block";
  const confirmationMessage = `Are you sure you want to ${action} this user? ${
    action === "block" ? "They will lose access!" : "They will regain access!"
  }`;

  if (confirm(confirmationMessage)) {
    try {
      const newRole = action === "block" ? "blocked" : "user";
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      });
      alert(`User has been ${action === "block" ? "blocked" : "unblocked"}.`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Failed to ${action} user.`);
    }
  }
};

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <div
    class="p-6 max-w-4xl mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-lg shadow-lg"
  >
    <h1
      class="text-3xl font-bold mb-8 text-center text-red-600 dark:text-red-400"
    >
      User Management
    </h1>

    <ul v-if="users.length" class="space-y-4">
      <li
        v-for="user in users"
        :key="user.id"
        class="border border-zinc-300 dark:border-zinc-700 rounded-lg shadow p-5 bg-white dark:bg-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <!-- User Info -->
        <div class="flex items-center gap-4 w-full sm:w-auto">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            alt="User Photo"
            class="w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-600 object-cover"
          />

          <div
            v-else
            class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border border-zinc-300 dark:border-zinc-600"
          >
            <Icon
              name="heroicons:user-circle"
              class="w-10 h-10 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <p
              v-if="currentUser?.uid === user.id"
              class="text-xs text-green-600 dark:text-green-400 font-bold mt-1"
            >
              Your Account
            </p>
            <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {{ user.name }}
            </h2>
            <p class="text-sm mb-1 text-zinc-600 dark:text-zinc-300">
              <strong class="text-zinc-400">Email:</strong> {{ user.email }}
            </p>
            <p class="text-sm text-zinc-400">
              <strong>Role: </strong>
              <span
                :class="{
                  'text-green-600 dark:text-green-400': user.role === 'admin',
                  'text-blue-600 dark:text-blue-400': user.role === 'user',
                  'text-red-600 dark:text-red-400': user.role === 'blocked',
                }"
              >
                {{ user.role }}
              </span>
            </p>
            <!-- Label & Firebase Account Management Link for Current Admin -->

            <p v-if="currentUser?.uid === user.id" class="text-xs mt-1">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                class="text-red-600 dark:text-red-400 underline"
              >
                Go to Firebase to manage your account.
              </a>
            </p>
          </div>
        </div>

        <!-- Actions (Hidden for Current Admin) -->
        <div
          v-if="currentUser?.uid !== user.id"
          class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto"
        >
          <span class="text-zinc-700 dark:text-zinc-300 text-xs"
            >Change Role:</span
          >
          <select
            v-model="updatedRoles[user.id]"
            class="px-3 py-2 border border-zinc-400 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 w-full sm:w-auto"
          >
            <option disabled value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            @click="saveRole(user.id)"
            class="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg shadow hover:bg-red-700 dark:hover:bg-red-400 transition w-full sm:w-auto"
          >
            Save
          </button>

          <!-- Block or Unblock User Button -->
          <button
            @click="blockUser(user.id, user.role)"
            class="px-4 py-2 rounded-lg"
            :class="{
              'bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-400 text-white w-full':
                user.role !== 'blocked',
              'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 text-white w-full':
                user.role === 'blocked',
            }"
          >
            {{ user.role === "blocked" ? "Unblock" : "Block" }}
          </button>

          <!-- Delete User Button -->
          <button
            @click="deleteUser(user.id)"
            class="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow hover:bg-gray-900 dark:hover:bg-gray-600 transition w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>

    <p v-else class="text-center text-red-600 dark:text-red-400 text-lg mt-4">
      No users found.
    </p>
  </div>
</template>
