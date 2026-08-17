<script lang="ts" setup>
import {useRoute} from 'vue-router'
import {buildTitle, setPageMeta} from '@/lib/seo'

// 根组件：配置加载完成后（main.ts 已 await），设置一次页面标题兜底；
// 后续路由切换由 router.afterEach 统一更新。
const route = useRoute()
setPageMeta(buildTitle(route.meta.title || '首页'))
</script>

<template>
  <router-view />
</template>
