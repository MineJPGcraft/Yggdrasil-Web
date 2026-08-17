<script lang="ts" setup>
import type {Component} from 'vue'
import {onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Home, LayoutDashboard, LogIn, MonitorSmartphone, UserCircle, UserPlus, Users} from 'lucide-vue-next'
import {userLogout} from '@/api'
import {getSiteConfig} from '@/lib/siteConfig'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const route = useRoute()
const router = useRouter()
// 品牌名来自站点配置（public/config.json）
const siteName = getSiteConfig().brand.name

// 登录态以 localStorage 中的 userInfo 为标记（真实会话凭据为 HttpOnly Cookie）
const isAuthenticated = ref(false)
const checkAuth = () => {
  isAuthenticated.value = !!localStorage.getItem('userInfo')
}

const logout = async () => {
  try {
    await userLogout()
  } catch (e) {
    console.error('登出失败:', e)
  } finally {
    localStorage.removeItem('userInfo')
    checkAuth()
    router.push('/login')
  }
}

onMounted(() => {
  checkAuth()
  window.addEventListener('storage', checkAuth)
})

onUnmounted(() => {
  window.removeEventListener('storage', checkAuth)
})

interface SidebarLink {
  name: string
  path: string
  icon: Component
}

// 登录后可见的功能导航
const authedLinks: SidebarLink[] = [
  {name: '仪表盘', path: '/dashboard', icon: LayoutDashboard},
  {name: '角色管理', path: '/role-management', icon: Users},
  {name: '启动器会话', path: '/launcher-sessions', icon: MonitorSmartphone},
  {name: '个人信息', path: '/profile', icon: UserCircle},
]

// 未登录时展示的公开链接
const publicLinks: SidebarLink[] = [
  {name: '首页', path: '/', icon: Home},
  {name: '登录', path: '/login', icon: LogIn},
  {name: '注册', path: '/register', icon: UserPlus},
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <!-- 品牌 Logo + 站点名 -->
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child size="lg">
            <router-link class="gap-2" to="/">
              <svg class="size-6" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <rect fill="none" height="256" width="256"/>
                <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="208" x2="128"
                      y1="128" y2="208"/>
                <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="192" x2="40"
                      y1="40" y2="192"/>
              </svg>
              <span class="truncate font-semibold">{{ siteName }}</span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- 已登录：功能导航 -->
      <SidebarGroup v-if="isAuthenticated">
        <SidebarGroupLabel>导航</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in authedLinks" :key="link.path">
              <SidebarMenuButton :is-active="isActive(link.path)" :tooltip="link.name" as-child>
                <router-link :to="link.path" class="gap-2">
                  <component :is="link.icon"/>
                  <span>{{ link.name }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- 未登录：公开链接 -->
      <SidebarGroup v-else>
        <SidebarGroupLabel>导航</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in publicLinks" :key="link.path">
              <SidebarMenuButton :is-active="isActive(link.path)" :tooltip="link.name" as-child>
                <router-link :to="link.path" class="gap-2">
                  <component :is="link.icon"/>
                  <span>{{ link.name }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <div class="flex items-center justify-between gap-2 px-1">
        <ThemeSwitcher/>
        <!-- 已登录：用户菜单 -->
        <DropdownMenu v-if="isAuthenticated">
          <DropdownMenuTrigger as-child>
            <Button class="h-8 gap-2 px-2" variant="ghost">
              <Avatar class="size-6">
                <AvatarFallback class="text-xs">用户</AvatarFallback>
              </Avatar>
              <span class="hidden text-sm lg:inline">我的账户</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem as-child>
              <router-link to="/dashboard">仪表盘</router-link>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <router-link to="/profile">个人信息</router-link>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem @click="logout">
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span v-else class="hidden text-xs text-muted-foreground lg:inline">未登录</span>
      </div>
    </SidebarFooter>

    <SidebarRail/>
  </Sidebar>
</template>
