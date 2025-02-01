<script setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';

import { ref } from 'vue';

const text = ref('');

function toggleDarkMode() {
    document.documentElement.classList.toggle('my-app-dark');
}

</script>

<template>
  <div class="block">
    <InputText v-model="text" style="margin-right: 1rem;"/>
    <Button label="Submit"/>
    {{ text }}

    <div ><ToggleSwitch @click="toggleDarkMode()"></ToggleSwitch></div>
  </div>
</template>                