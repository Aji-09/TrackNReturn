<template>
  <div class="max-w-lg mx-auto p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
    <h1 class="text-2xl font-semibold text-center text-zinc-900 dark:text-zinc-50 mb-6">
      Report Lost Item
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Item Name
        </label>
        <input
          v-model="itemName"
          type="text"
          id="name"
          required
          class="mt-1 block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label for="description" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          v-model="description"
          id="description"
          required
          rows="3"
          class="mt-1 block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm"
        ></textarea>
      </div>

      <div>
        <label for="location" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Location Found
        </label>
        <input
          v-model="location"
          type="text"
          id="location"
          required
          class="mt-1 block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label for="contact" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Contact Information
        </label>
        <input
          v-model="contact"
          type="text"
          id="contact"
          required
          class="mt-1 block w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm"
        />
      </div>

      <!-- Image Upload Section -->
      <div class="mt-4">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Upload Image (Optional)
        </label>
        <div class="mt-2 flex items-center space-x-2">
          <input type="file" id="image" @change="handleImageUpload" accept="image/*" class="hidden" />
          <UButton @click="triggerFileInput" variant="outline" class="p-4" :disabled="uploading">
            <span v-if="uploading">Uploading...</span>
            <span v-else>Upload Image</span>
          </UButton>
        </div>

        <p v-if="imagePreview" class="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          Image preview:
        </p>
        <img v-if="imagePreview" :src="imagePreview" alt="Image preview" class="mt-2 max-w-full h-auto rounded-md" />
      </div>

      <!-- Report Lost Item Button -->
      <div class="mt-6 flex justify-center w-full">
        <UButton type="submit" :disabled="loading || uploading" class="w-full p-4">
          {{ loading ? "Submitting..." : "Report Lost Item" }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFirebaseAuth } from "vuefire";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const router = useRouter();
const auth = useFirebaseAuth();
const user = auth?.currentUser;

const itemName = ref("");
const description = ref("");
const location = ref("");
const contact = ref("");
const imagePreview = ref<string | null>(null);
const imageUrl = ref<string | null>(null);
const loading = ref(false);
const uploading = ref(false);
const uploadError = ref<string | null>(null);

const db = getFirestore();
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dqwbka5al/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "lost-items";

const handleImageUpload = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  if (!file) return;

  // Show image preview
  const reader = new FileReader();
  reader.onloadend = () => {
    imagePreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);

  // Upload image to Cloudinary
  uploading.value = true;
  uploadError.value = null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.secure_url) {
      imageUrl.value = data.secure_url;
    } else {
      uploadError.value = "Image upload failed. Please try again.";
    }
  } catch (error) {
    uploadError.value = "Error uploading image. Please try again.";
    console.error("Error uploading image:", error);
  } finally {
    uploading.value = false;
  }
};

const triggerFileInput = () => {
  const fileInput = document.getElementById("image") as HTMLInputElement;
  fileInput.click();
};

const handleSubmit = async () => {
  if (!user) return;

  // Prevent form submission while image is still uploading
  if (uploading.value) {
    alert("Please wait for the image to finish uploading before submitting.");
    return;
  }

  loading.value = true;

  try {
    // Add to Firestore
    await addDoc(collection(db, "lost_items"), {
      name: itemName.value,
      description: description.value,
      location: location.value,
      contact: contact.value,
      reportedBy: user.email || "Anonymous",
      userId: user.uid,
      imageUrl: imageUrl.value || "",
      createdAt: serverTimestamp(),
    });

    router.push("/user/lost-items");
  } catch (e) {
    console.error("Error adding document:", e);
  } finally {
    loading.value = false;
  }
};

definePageMeta({
  layout: "user",
});
</script>
