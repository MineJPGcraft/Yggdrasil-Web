<script setup>
import { onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { getServerMeta } from '@/api'

const serverName = useStorage('server-name', 'Yggdrasil')

onMounted(async () => {
  const meta = await getServerMeta()
  if (meta?.serverName) {
    serverName.value = meta.serverName
  }
  document.title = serverName.value
})
</script>

<template>
  <router-view />
</template>

<style>
@import "style.css";
</style>
