<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebaseApp } from 'vuefire';

// Firebase & Firestore setup
const app = useFirebaseApp();
const db = getFirestore(app);

const CLOUD_NAME = 'dqwbka5al'; // Replace with your Cloudinary Cloud Name
const UPLOAD_PRESET = 'lost-items'; // Replace with your Upload Preset

const imageUrl = ref<string | null>(null);
const itemName = ref('');
const description = ref('');

const uploadImage = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    imageUrl.value = data.secure_url;

    console.log('Image uploaded:', data.secure_url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const saveToFirestore = async () => {
  if (!imageUrl.value || !itemName.value) {
    alert('Please upload an image and enter item details.');
    return;
  }

  try {
    await addDoc(collection(db, 'lost_items'), {
      name: itemName.value,
      description: description.value,
      imageUrl: imageUrl.value,
      createdAt: Timestamp.fromDate(new Date()),
    });

    alert('Lost item saved successfully!');
    itemName.value = '';
    description.value = '';
    imageUrl.value = null;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
};
</script>
