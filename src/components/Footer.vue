<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="py-6 md:px-8 md:py-0 border-t">
    <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
      <p class="text-sm leading-loose text-muted-foreground">
        &copy; {{ currentYear }} Yggdrasil Web. 版权所有.
      </p>
    </div>
  </footer>
</template>