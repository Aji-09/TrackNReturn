<script setup lang="ts">
import { useFirestore, useCollection } from "vuefire";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { ref } from "vue";

const db = useFirestore();
const lostItems = useCollection(collection(db, "lost_items"));

const deleting = ref<string | null>(null);
const showModal = ref(false);
const selectedItemId = ref<string | null>(null);

// Format date from Firestore timestamp
const formatDate = (timestamp: any) => {
  return timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : "N/A";
};

// Open modal for confirmation
const confirmDelete = (id: string) => {
  selectedItemId.value = id;
  showModal.value = true;
};

// Delete lost item
const deleteItem = async () => {
  if (!selectedItemId.value) return;
  deleting.value = selectedItemId.value;
  showModal.value = false; // Close modal

  await deleteDoc(doc(db, "lost_items", selectedItemId.value));

  deleting.value = null;
  selectedItemId.value = null;
};

definePageMeta({
  layout: "admin"
});
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Lost Item Management</h1>

    <div v-if="lostItems.length === 0" class="text-center text-zinc-500 dark:text-zinc-400">
      No lost items found.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm">
        <thead>
          <tr class="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <th class="p-3 text-left">Image</th>
            <th class="p-3 text-left">Item Name</th>
            <th class="p-3 text-left">Description</th>
            <th class="p-3 text-left">Lost Found Date</th>
            <th class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lostItems" :key="item.id" class="border-t border-zinc-300 dark:border-zinc-700">
            <td class="p-3">
              <!-- Check if imageUrl exists, if not display a placeholder image -->
              <img :src="item.imageUrl || '/path/to/placeholder/image.jpg'" alt="Item Image" class="w-16 h-16 rounded-md object-cover" />
            </td>
            <td class="p-3">{{ item.name }}</td>
            <td class="p-3">{{ item.description }}</td>
            <td class="p-3">{{ formatDate(item.createdAt) }}</td>
            <td class="p-3">
              <button
                @click="confirmDelete(item.id)"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Confirm Deletion</h2>
        <p class="text-zinc-700 dark:text-zinc-300 mb-6">Are you sure you want to delete this item?</p>

        <div class="flex justify-center gap-4">
          <button
            @click="showModal = false"
            class="px-4 py-2 border border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            @click="deleteItem"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
