<template>
  <div class="max-w-3xl mx-auto bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg">
    <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">Profile</h2>

    <div class="flex items-center gap-4 mt-4">
      <!-- Profile Picture -->
      <div class="relative w-24 h-24">
        <img
          v-if="editableData.photoURL"
          :src="editableData.photoURL"
          alt="Profile Picture"
          class="w-24 h-24 rounded-full border-2 border-red-400 object-cover"
        />
        <div v-else class="w-24 h-24 rounded-full border-2 border-red-400 flex items-center justify-center bg-gray-200 dark:bg-zinc-700">
          <svg class="w-16 h-16 text-gray-500 dark:text-gray-400" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="M18 18c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8Zm0 2c-6.075 0-11 4.925-11 11a1 1 0 0 0 2 0c0-4.971 4.029-9 9-9s9 4.029 9 9a1 1 0 0 0 2 0c0-6.075-4.925-11-11-11Z"
            />
          </svg>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2">
          <p v-if="!isEditing.name" class="text-lg font-semibold">
            {{ editableData.name || "Your Name" }}
          </p>
          <input
            v-else
            v-model="editableData.name"
            class="border rounded px-2 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white w-40"
          />
          <button v-if="!isEditing.name" @click="toggleEdit('name')" class="text-zinc-500 hover:text-red-500">
            <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
          </button>
          <button v-else @click="saveData" :disabled="isSaving" class="text-white bg-red-500 px-3 py-1 rounded text-sm">
            {{ isSaving ? 'Saving...' : 'OK' }}
          </button>
        </div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{{ user?.email }}</p>

        <!-- Upload Profile Picture -->
        <UButton @click="uploadProfilePicture" color="primary" variant="outline" class="text-sm mt-2 px-2 py-2">
          Change Photo
        </UButton>
      </div>
    </div>

    <!-- Student-Specific Details (Shown Only If Role is 'student') -->
    <div v-if="editableData.role === 'student'" class="mt-6 space-y-3">
      <div class="flex items-center gap-2">
        <p><strong>Student ID:</strong></p>
        <span v-if="!isEditing.studentId">{{ editableData.studentId || "N/A" }}</span>
        <input v-else v-model="editableData.studentId" class="border rounded px-2 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white w-40" />
        <button v-if="!isEditing.studentId" @click="toggleEdit('studentId')" class="text-zinc-500 hover:text-red-500">
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
        </button>
        <button v-else @click="saveData" :disabled="isSaving" class="text-white bg-red-500 px-3 py-1 rounded text-sm">
          {{ isSaving ? 'Saving...' : 'OK' }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <p><strong>Grade Level:</strong></p>
        <span v-if="!isEditing.gradeLevel">{{ editableData.gradeLevel || "N/A" }}</span>
        <input v-else v-model="editableData.gradeLevel" class="border rounded px-2 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white w-40" />
        <button v-if="!isEditing.gradeLevel" @click="toggleEdit('gradeLevel')" class="text-zinc-500 hover:text-red-500">
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
        </button>
        <button v-else @click="saveData" :disabled="isSaving" class="text-white bg-red-500 px-3 py-1 rounded text-sm">
          {{ isSaving ? 'Saving...' : 'OK' }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <p><strong>Course:</strong></p>
        <span v-if="!isEditing.course">{{ editableData.course || "N/A" }}</span>
        <input v-else v-model="editableData.course" class="border rounded px-2 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white w-40" />
        <button v-if="!isEditing.course" @click="toggleEdit('course')" class="text-zinc-500 hover:text-red-500">
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5" />
        </button>
        <button v-else @click="saveData" :disabled="isSaving" class="text-white bg-red-500 px-3 py-1 rounded text-sm">
          {{ isSaving ? 'Saving...' : 'OK' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Firebase initialization
const auth = getAuth();
const db = getFirestore();
const user = ref(null);
const isSaving = ref(false);

// Editable user data
const editableData = ref({
  name: "Your Name",
  email: "",
  studentId: "N/A",
  gradeLevel: "N/A",
  course: "N/A",
  role: "",
  photoURL: "",
});

const isEditing = ref({
  name: false,
  studentId: false,
  gradeLevel: false,
  course: false,
});

// Constants for Cloudinary upload
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dqwbka5al/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "claim-items";

// Fetch user data from Firestore
const fetchUserData = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  user.value = currentUser;
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    editableData.value = {
      ...editableData.value,
      name: userData.name || "",
      email: currentUser.email || "",
      studentId: userData.studentId || "N/A",
      gradeLevel: userData.gradeLevel || "N/A",
      course: userData.course || "N/A",
      role: userData.role || "",
      photoURL: userData.photoURL || "",
    };
  }
};

// Save data to Firestore
const saveData = async () => {
  isSaving.value = true;
  Object.keys(isEditing.value).forEach((key) => (isEditing.value[key] = false)); // Exit edit mode

  const currentUser = auth.currentUser;
  if (!currentUser) {
    isSaving.value = false;
    return;
  }

  const userRef = doc(db, "users", currentUser.uid);
  setDoc(userRef, editableData.value, { merge: true })
    .catch((error) => console.error("Error saving data:", error))
    .finally(() => (isSaving.value = false));
};

// Toggle edit mode for fields
const toggleEdit = (field) => {
  isEditing.value[field] = !isEditing.value[field];
};

// Upload Profile Picture to Cloudinary
const uploadProfilePicture = async () => {
  try {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        editableData.value.photoURL = data.secure_url;
        saveData();
      } else {
        console.error("Error uploading image");
      }
    };

    fileInput.click();
  } catch (error) {
    console.error("Error uploading profile picture:", error);
  }
};

// Fetch user data on mount
onMounted(() => {
  onAuthStateChanged(auth, fetchUserData);
});
</script>
