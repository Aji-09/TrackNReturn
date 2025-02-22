<template>
  <div class="flex flex-col lg:flex-row justify-center items-center lg:items-start min-h-screen p-6 gap-8 lg:gap-16">
    <!-- Lost Item Details Card -->
    <div class="w-full max-w-lg lg:max-w-xl border border-zinc-300 dark:border-zinc-700 p-9 rounded-xl shadow-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
      <h2 class="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-5">Lost Item Details</h2>

      <div class="space-y-4 text-center">
        <h3 class="text-xl font-semibold text-zinc-900 dark:text-white">{{ item.name }}</h3>

        <div v-if="item.imageUrl" class="flex justify-center">
          <img
            :src="item.imageUrl"
            alt="Item Image"
            class="w-48 h-48 object-cover rounded-lg shadow-md transition-transform hover:scale-105"
          />
        </div>

        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          <strong class="text-zinc-800 dark:text-white">Reported By:</strong> {{ item.reportedBy }}
        </p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          <strong class="text-zinc-800 dark:text-white">Location:</strong> {{ item.location }}
        </p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          <strong class="text-zinc-800 dark:text-white">Description:</strong> {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Claim Verification Form Card -->
    <div class="w-full max-w-sm lg:max-w-lg border border-zinc-300 dark:border-zinc-700 p-6 rounded-xl shadow-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
      <h2 class="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-5">Claim This Item</h2>

      <UForm :state="formState" :schema="validationSchema" @submit="handleSubmit" class="space-y-4">
        <UFormField label="Full Name" name="fullName">
          <UInput v-model="formState.fullName" size="xl" placeholder="Enter your full name" class="w-full rounded-md" />
        </UFormField>

        <UFormField label="Contact Information" name="contactInfo">
          <UInput v-model="formState.contactInfo" size="xl" placeholder="Enter your email or phone number" class="w-full rounded-md" />
        </UFormField>

        <UFormField label="Additional Details" name="details">
          <UTextarea v-model="formState.details" size="xl" placeholder="Describe how this item belongs to you" class="w-full rounded-md" :style="{ minHeight: '120px' }" />
        </UFormField>

        <!-- File Upload -->
        <div class="border border-zinc-300 dark:border-zinc-700 p-4 rounded-md bg-primary">
          <label class="block text-white">Upload Proof</label>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center gap-3">
              <UButton @click="triggerFileInput" size="xl" icon="i-heroicons-photo" color="secondary">Upload</UButton>
              <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" accept="image/*" />
            </div>

            <div v-if="selectedFileName" class="flex items-center gap-2 text-sm text-white">
              {{ selectedFileName }}
              <button @click="removeSelectedFile" class="text-error font-bold">X</button>
            </div>
            <div v-else class="text-sm text-white">No file chosen</div>
          </div>
        </div>

        <p v-if="uploading" class="text-sm text-warning">Uploading...</p>
        <p v-if="uploadedImageUrl" class="text-sm text-success">Image uploaded!</p>

        <!-- Submit Claim Button -->
        <div class="flex justify-center mt-6">
          <UButton :disabled="uploading" type="submit" size="xl" color="primary">
            Submit Claim
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { object, string } from "yup";
import { useCurrentUser } from "vuefire";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const db = getFirestore();
const user = useCurrentUser();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const itemId = route.params.id as string;

// Lost Item Details
const item = ref({
  name: (route.query.name as string) ?? "Unknown Item",
  reportedBy: (route.query.reportedBy as string) ?? "Unknown",
  location: (route.query.location as string) ?? "Unknown Location",
  description: (route.query.description as string) ?? "No description available",
  imageUrl: (route.query.imageUrl as string) ?? "",
});

// Form State
const formState = reactive({
  fullName: "",
  contactInfo: "",
  details: "",
  imageUrl: "",
});

// Validation Schema
const validationSchema = object({
  fullName: string().required("Full Name is required"),
  contactInfo: string().required("Contact Information is required"),
  details: string().optional(),
});

// Cloudinary Upload Config
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dqwbka5al/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "claim-items";

// File Upload Handling
const selectedFileName = ref<string | null>(null);
const uploading = ref(false);
const uploadedImageUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  selectedFileName.value = file.name;

  // Upload Image to Cloudinary
  await uploadImage(file);
};

const removeSelectedFile = () => {
  selectedFileName.value = null;
  uploadedImageUrl.value = null;
  formState.imageUrl = "";
  if (fileInput.value) fileInput.value.value = "";
};

// Upload to Cloudinary
const uploadImage = async (file: File) => {
  uploading.value = true;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
    const data = await response.json();
    
    if (data.secure_url) {
      uploadedImageUrl.value = data.secure_url;
      formState.imageUrl = data.secure_url;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
  } finally {
    uploading.value = false;
  }
};

// Form Submission
const handleSubmit = async () => {
  if (!user.value) {
    toast.add({ title: "Error", description: "You must be logged in to claim an item.", color: "error" });
    return;
  }

  try {
    await addDoc(collection(db, "claims"), {
      itemId,
      userId: user.value.uid,
      ...formState,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    toast.add({ title: "Success", description: "Claim submitted successfully!", color: "success" });

    router.push("/user/claims");
  } catch (error) {
    console.error("Error submitting claim:", error);
    toast.add({ title: "Error", description: "Failed to submit claim. Please try again.", color: "error" });
  }
};

definePageMeta({ layout: "user" });
</script>
