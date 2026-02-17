<script setup>
import { Button } from '@/components/ui/button'
</script>

<template>
  <section class="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
    <div class="text-center lg:text-start space-y-6">
      <main class="text-5xl md:text-6xl font-bold">
        <h1>
          Yggdrasil
          <span class="text-primary">Web</span>
        </h1>
        <h2>一个现代化平台，用于构建、协作和部署。</h2>
      </main>

      <p class="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
        轻松管理您的项目，利用我们强大的后端服务，并简化从开发到生产的工作流程。
      </p>

      <div class="space-y-4 md:space-y-0 md:space-x-4">
        <Button as-child class="w-full md:w-1/3">
          <router-link to="/register">立即开始</router-link>
        </Button>

        <Button as-child variant="outline" class="w-full md:w-1/3">
          <a href="#" target="_blank">查看文档</a>
        </Button>
      </div>
    </div>

    <!-- Right side with image or graphic -->
    <div class="hidden lg:block">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-auto text-primary" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M88,134.9,176,224l32-32L120,104,208,16l-32,32L99.1,128Z" opacity="0.2"/><path d="M208,16,99.1,128l-4.2,4.2a48,48,0,0,0,67.8,67.9L176,187.3,224,80Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M164.2,199.1a48,48,0,0,1-67.9-67.8L120,108,32,224l80-48,12.7,12.7A47.9,47.9,0,0,1,164.2,199.1Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
    </div>
  </section>
</template>