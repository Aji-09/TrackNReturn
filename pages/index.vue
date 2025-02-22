<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Navbar for Guest Users -->
    <NavbarGuest />
    <!-- Centered Content Section -->
    <div
      class="flex-grow flex justify-center items-center px-4 sm:px-6 md:px-12"
    >
      <div class="text-center w-full max-w-2xl">
        <h1
          class="text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 dark:text-red-400 mb-8"
        >
          Welcome to TrackNReturn
        </h1>
        <p
          class="text-sm sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-8"
        >
          Your reliable lost and found management system.
        </p>
        <div class="flex justify-center items-center space-x-4">
          <!-- Login Button -->
          <NuxtLink to="/auth/login">
            <UButton size="xl" color="primary"> Login </UButton>
          </NuxtLink>
          <!-- Register Button -->
          <NuxtLink to="/auth/register">
            <UButton color="primary" size="xl" variant="outline">
              Register
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
