<template>
    <div class="flex flex-col lg:flex-row justify-center items-center lg:items-start min-h-screen p-6 gap-8 lg:gap-16">
      <!-- Report Found Item Card -->
      <div class="w-full max-w-lg lg:max-w-xl border border-zinc-300 dark:border-zinc-700 p-9 rounded-xl shadow-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
        <h2 class="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-5">Report Found Item</h2>
  
        <div class="space-y-4 text-center">
          <UForm :state="formState" :schema="validationSchema" @submit="handleSubmit" class="space-y-4">
            <UFormField label="Item Name" name="itemName">
              <UInput v-model="formState.itemName" size="xl" placeholder="Enter item name" class="w-full rounded-md" />
            </UFormField>
  
            <UFormField label="Item Description" name="itemDescription">
              <UTextarea v-model="formState.itemDescription" size="xl" placeholder="Enter item description" class="w-full rounded-md" />
            </UFormField>
  
            <UFormField label="Location Found" name="locationFound">
              <UInput v-model="formState.locationFound" size="xl" placeholder="Enter location where item was found" class="w-full rounded-md" />
            </UFormField>
  
            <!-- File Upload -->
            <div class="border border-zinc-300 dark:border-zinc-700 p-4 rounded-md bg-primary">
              <label class="block text-white">Upload Image</label>
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
  
            <!-- Image Review Card -->
            <div v-if="uploadedImageUrl" class="border border-zinc-300 dark:border-zinc-700 p-4 rounded-md bg-secondary mt-4">
              <h3 class="text-xl font-semibold text-center text-zinc-900 dark:text-white mb-3">Uploaded Image Preview</h3>
              <div class="flex justify-center">
                <img :src="uploadedImageUrl" alt="Uploaded Image" class="max-w-full h-auto rounded-md" />
              </div>
              <div class="text-center mt-4">
                <button @click="removeSelectedFile" class="text-error font-bold">Remove Image</button>
              </div>
            </div>
  
            <!-- Submit Report Button -->
            <div class="flex justify-center mt-6">
              <UButton :disabled="uploading" type="submit" size="xl" color="primary">
                Submit Report
              </UButton>
            </div>
          </UForm>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from "vue";
  import { useCurrentUser } from "vuefire";
  import { useCloudinary } from "~/composables/useCloudinary";
  import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
  import { object, string } from "yup";
  import { useRouter } from "vue-router"; // Import the router
  
  const db = getFirestore();
  const user = useCurrentUser();
  const toast = useToast();
  const router = useRouter(); // Create a router instance
  const { uploadImage } = useCloudinary();
  
  // Form state
  const formState = reactive({
    itemName: "",
    itemDescription: "",
    locationFound: "",
    imageUrl: "",
  });
  
  // Validation schema
  const validationSchema = object({
    itemName: string().required("Item name is required"),
    itemDescription: string().required("Item description is required"),
    locationFound: string().required("Location found is required"),
  });
  
  // File upload handling
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
  
    // Upload image to Cloudinary
    await handleImageUpload(file);
  };
  
  const removeSelectedFile = () => {
    selectedFileName.value = null;
    uploadedImageUrl.value = null;
    formState.imageUrl = "";
    if (fileInput.value) fileInput.value.value = "";
  };
  
  // Handle image upload and update form state
  const handleImageUpload = async (file: File) => {
    uploading.value = true;
    try {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        uploadedImageUrl.value = uploadedUrl;
        formState.imageUrl = uploadedUrl;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      uploading.value = false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user.value) {
      toast.add({ title: "Error", description: "You must be logged in to report a found item.", color: "error" });
      return;
    }
  
    try {
      // Adding a new report to Firestore
      const newItemDocRef = await addDoc(collection(db, "found_items"), {
        ...formState,
        userId: user.value.uid,  // Link to the current user
        reportedAt: Timestamp.now(),  // Timestamp for when the item is reported
      });
  
      toast.add({ title: "Success", description: "Item reported successfully!", color: "success" });
  
      // Redirect to the found-items page
      router.push("/found-items"); // Redirect after successful submission
    } catch (error) {
      console.error("Error reporting item:", error);
      toast.add({ title: "Error", description: "Failed to report item. Please try again.", color: "error" });
    }
  };
  definePageMeta({
    layout: 'user'
  })
  </script>
  