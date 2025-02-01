<script setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { ref } from 'vue';

const text = ref('');

function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}

</script>

<template>
  <div>
    <InputText v-model="text" style="margin-right: 1rem;"/>
    <Button label="Submit"/>
     
    {{ text }}
    <Button label="Toggle Dark Mode" @click="toggleDarkMode()"></Button>
    <p>haha</p>
  </div>
</template>                