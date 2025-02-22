<template>
  <UModal>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Claim Item</h2>
      </template>

      <UForm :state="formState" :schema="validationSchema" @submit="handleSubmit">
        <UFormField label="Full Name" name="fullName">
          <UInput v-model="formState.fullName" placeholder="Enter your full name" />
        </UFormField>

        <UFormField label="Contact Information" name="contactInfo">
          <UInput v-model="formState.contactInfo" placeholder="Enter your email or phone number" />
        </UFormField>

        <UFormField label="Additional Details" name="details">
          <UTextarea v-model="formState.details" placeholder="Provide any additional information" />
        </UFormField>

        <div class="flex justify-end mt-4">
          <UButton type="submit" color="secondary">Submit Claim</UButton>
          <UButton type="button" color="primary" class="ml-2" @click="emit('close')">Cancel</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useToast } from '#imports';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { object, string } from 'yup';
import type { FormSubmitEvent } from '@nuxt/ui';

const props = defineProps<{ itemId: string }>();
const emit = defineEmits(['close']);
const toast = useToast();
const db = getFirestore();

// Define the form state
const formState = reactive({
  fullName: '',
  contactInfo: '',
  details: ''
});

// Define validation schema
const validationSchema = object({
  fullName: string().required('Full Name is required'),
  contactInfo: string().required('Contact Information is required'),
  details: string()
});

// Handle form submission
const handleSubmit = async (event: FormSubmitEvent<typeof formState>) => {
  try {
    await addDoc(collection(db, 'claims'), {
      itemId: props.itemId,
      fullName: formState.fullName,
      contactInfo: formState.contactInfo,
      details: formState.details,
      createdAt: Timestamp.now()
    });

    toast.add({ title: 'Claim submitted successfully!', color: 'success' });

    // Close modal after submission
    emit('close');
  } catch (error) {
    console.error('Error submitting claim:', error);
    toast.add({ title: 'Failed to submit claim. Try again.', color: 'warning' });
  }
};
</script>
