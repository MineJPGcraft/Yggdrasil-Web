<script lang="ts" setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue';
import Footer from '@/components/Footer.vue';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {Separator} from '@/components/ui/separator'

const route = useRoute()
// 仅登录后的应用页面显示侧边栏；Home 等公开页面不显示
const showSidebar = computed(() => route.meta.sidebar === true)
</script>

<template>
  <!-- 登录后的应用页面：侧边栏布局 -->
  <SidebarProvider v-if="showSidebar">
    <AppSidebar/>
    <SidebarInset>
      <!-- 顶部栏：侧边栏开关 + 当前页面标题 -->
      <header
          class="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger class="-ml-1"/>
        <Separator class="mr-2 h-4" orientation="vertical"/>
        <h1 class="truncate text-sm font-semibold">{{ route.meta.title }}</h1>
      </header>
      <div class="flex flex-1 flex-col">
        <router-view/>
        <Footer/>
      </div>
    </SidebarInset>
  </SidebarProvider>

  <!-- 公开页面（如 Home）：仅内容 + 页脚 -->
  <div v-else class="flex min-h-screen flex-col bg-background">
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>
