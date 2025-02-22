<template>
    <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg mt-10">
      <h1 class="text-2xl font-bold text-red-600 dark:text-red-400 text-center mb-6">
        Found This Item?
      </h1>
      <p class="text-sm text-zinc-700 dark:text-zinc-300 text-center mb-4">
        If you found this lost item, please upload a matching photo and fill out the details below.
      </p>
  
      <form @submit.prevent="submitFoundItem">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your Name</label>
          <input v-model="finderName" type="text" class="w-full px-4 py-2 mt-1 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" required />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contact Info</label>
          <input v-model="contactInfo" type="text" class="w-full px-4 py-2 mt-1 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="Email or phone number" required />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Additional Notes</label>
          <textarea v-model="notes" rows="3" class="w-full px-4 py-2 mt-1 border rounded-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" placeholder="Describe where and when you found the item..."></textarea>
        </div>
  
        <!-- Image Upload Section -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload Photo</label>
          <input type="file" @change="handleFileUpload" accept="image/*" class="w-full mt-2" />
        </div>
  
        <!-- Preview uploaded image -->
        <div v-if="imageUrl" class="mt-4">
          <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Preview:</p>
          <img :src="imageUrl" alt="Uploaded Image" class="mt-2 rounded-lg shadow-md w-full h-48 object-cover" />
        </div>
  
        <button type="submit" :disabled="uploading" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200 mt-4">
          {{ uploading ? "Uploading..." : "Submit Found Item" }}
        </button>
      </form>
  
      <div v-if="successMessage" class="text-green-500 text-center mt-4">
        {{ successMessage }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { getFirestore, doc, updateDoc, collection, addDoc } from "firebase/firestore";
  import { useCloudinary } from "@/composables/useCloudinary"; // Cloudinary composable
  
  // Firebase setup
  const db = getFirestore();
  const router = useRouter();
  const route = useRoute();
  const { uploadImage } = useCloudinary();
  
  // Form data
  const finderName = ref("");
  const contactInfo = ref("");
  const notes = ref("");
  const imageUrl = ref<string | null>(null);
  const file = ref<File | null>(null);
  const uploading = ref(false);
  const successMessage = ref("");
  
  // Get the lost item ID from the route
  const itemId = ref(route.params.id as string);
  
  // Handle file selection
  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      file.value = target.files[0];
      imageUrl.value = URL.createObjectURL(target.files[0]); // Show preview
    }
  };
  
  // Submit the "found item" form
  const submitFoundItem = async () => {
    if (!finderName.value || !contactInfo.value) {
      alert("Please fill out all required fields.");
      return;
    }
  
    uploading.value = true;
    let uploadedImageUrl = null;
  
    try {
      // Upload to Cloudinary if file exists
      if (file.value) {
        uploadedImageUrl = await uploadImage(file.value);
      }
  
      // Add found report to Firestore
      await addDoc(collection(db, "founds"), {
        itemId: itemId.value,
        finderName: finderName.value,
        contactInfo: contactInfo.value,
        notes: notes.value,
        imageUrl: uploadedImageUrl || null,
        reportedAt: new Date(),
      });
  
      // Optionally update the lost item's status in Firestore
      await updateDoc(doc(db, "lost_items", itemId.value), { status: "found" });
  
      successMessage.value = "Your report has been submitted successfully!";
      uploading.value = false;
  
      // Redirect after a short delay
      setTimeout(() => router.push("/user/dashboard"), 2000);
    } catch (error) {
      console.error("Error submitting found item report:", error);
      alert("An error occurred. Please try again.");
      uploading.value = false;
    }
  };
  definePageMeta({
    layout: 'user'
  })
  </script>
  