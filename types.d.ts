// types.d.ts
import { NuxtConfig } from '@nuxt/schema';

declare module '@nuxt/schema' {
  interface NuxtConfig {
    ui?: {
      // Define the expected properties for 'ui'
    };
  }
}
