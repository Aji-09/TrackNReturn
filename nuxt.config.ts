import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'netlify_edge'
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@nuxt/ui','nuxt-vuefire','@nuxtjs/cloudinary' ],
  css: ["~/assets/css/main.css"],
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "tertiary",
        "info",
        "success",
        "warning",
        "error",
      ],
    },
  },
  
  vuefire: {
    auth: {
      enabled: true
    },
    config: {
      apiKey: "AIzaSyBXh-IZ7LIWWmQVjcH20jbv2O7ex-s978w",
      authDomain: "tnts-tracknreturns.firebaseapp.com",
      projectId: "tnts-tracknreturns",
      storageBucket: "tnts-tracknreturns.firebasestorage.app",
      messagingSenderId: "869293817790",
      appId: "1:869293817790:web:df0079c2e2a9db26e143ef",
      measurementId: "G-T85MEMP8VW",
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['~/types/middleware'],
      },
    },
  },
  
});
