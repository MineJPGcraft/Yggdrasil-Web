<script setup>
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-background">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>