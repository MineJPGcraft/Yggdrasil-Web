<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ThemeSwitcher from './ThemeSwitcher.vue'

const router = useRouter()
const isAuthenticated = ref(false)
const sheetOpen = ref(false)

const checkAuth = () => {
  isAuthenticated.value = !!localStorage.getItem('accessToken')
}

const logout = () => {
  localStorage.removeItem('accessToken')
  checkAuth()
  router.push('/login')
}

// Check authentication status when component mounts
onMounted(() => {
  checkAuth()
  window.addEventListener('storage', checkAuth)
})

onUnmounted(() => {
  window.removeEventListener('storage', checkAuth)
})

const navLinks = [
  { name: '首页', path: '/' },
  { name: '仪表盘', path: '/dashboard', auth: true },
]
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container h-14 flex items-center">
      <div class="mr-4 hidden md:flex">
        <router-link to="/" class="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-6 w-6"><rect width="256" height="256" fill="none"/><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
          <span class="font-bold hidden sm:inline-block">Yggdrasil</span>
        </router-link>
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <template v-for="link in navLinks" :key="link.name">
            <router-link v-if="!link.auth || isAuthenticated" :to="link.path" class="transition-colors hover:text-foreground/80 text-foreground/60">
              {{ link.name }}
            </router-link>
          </template>
        </nav>
      </div>

      <!-- Mobile Nav -->
      <Sheet :open="sheetOpen" @update:open="sheetOpen = $event">
        <SheetTrigger as-child class="md:hidden">
          <Button variant="outline" size="icon" class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <span class="sr-only">切换菜单</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="pr-0">
            <router-link to="/" @click="sheetOpen = false" class="mb-4 flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-6 w-6"><rect width="256" height="256" fill="none"/><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>
              <span class="font-bold">Yggdrasil</span>
            </router-link>
          <div class="flex flex-col space-y-3">
             <template v-for="link in navLinks" :key="link.name">
              <router-link v-if="!link.auth || isAuthenticated" :to="link.path" @click="sheetOpen = false" class="transition-colors hover:text-foreground/80 text-foreground/60">
                {{ link.name }}
              </router-link>
            </template>
          </div>
        </SheetContent>
      </Sheet>


      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <!-- Search input can go here if needed -->
        </div>
        <nav class="flex items-center">
          <ThemeSwitcher />
          <div v-if="isAuthenticated" class="ml-4">
             <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt="@radix-vue" />
                  <AvatarFallback>用户</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                  <router-link to="/dashboard">仪表盘</router-link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>设置</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="logout">
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div v-else class="ml-4 flex items-center space-x-2">
            <Button as-child variant="ghost">
              <router-link to="/login">登录</router-link>
            </Button>
            <Button as-child>
              <router-link to="/register">注册</router-link>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>