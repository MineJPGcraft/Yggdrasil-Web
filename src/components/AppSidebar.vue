<script lang="ts" setup>
import type {Component} from 'vue'
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Home, LayoutDashboard, LogIn, LogOut, MonitorSmartphone, UserCircle, UserPlus, Users} from 'lucide-vue-next'
import {userLogout} from '@/api'
import type {UserInfo} from '@/api'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const route = useRoute()
const router = useRouter()
// 品牌名来自站点配置（public/config.json）
const siteName = getSiteConfig().brand.name

// 登录态以 localStorage 中的 userInfo 为标记（真实会话凭据为 HttpOnly Cookie）
const user = ref<UserInfo | null>(null)
const isAuthenticated = computed(() => !!user.value)

// 从 localStorage 解析登录用户信息（登录时由 Login / OIDC 回调写入）
const refreshUser = () => {
  const raw = localStorage.getItem('userInfo')
  if (!raw) {
    user.value = null
    return
  }
  try {
    user.value = JSON.parse(raw) as UserInfo
  } catch {
    user.value = null
  }
}

// 头像占位字符：昵称首字符
const avatarText = computed(() => user.value?.displayName?.trim().charAt(0).toUpperCase() || '用')

// 登出确认弹窗
const showLogoutDialog = ref(false)
const confirmLogout = async () => {
  try {
    await userLogout()
  } catch (e) {
    console.error('登出失败:', e)
  } finally {
    localStorage.removeItem('userInfo')
    refreshUser()
    showLogoutDialog.value = false
    router.push('/login')
  }
}

onMounted(() => {
  refreshUser()
  window.addEventListener('storage', refreshUser)
})

onUnmounted(() => {
  window.removeEventListener('storage', refreshUser)
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
      <div
          class="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:justify-center">
        <!-- 主题切换（侧边栏折叠为图标时隐藏，给用户头像腾出空间） -->
        <div class="group-data-[collapsible=icon]:hidden">
          <ThemeSwitcher/>
        </div>
        <!-- 已登录：用户菜单 -->
        <DropdownMenu v-if="isAuthenticated">
          <DropdownMenuTrigger as-child>
            <Button
                class="h-8 gap-2 px-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                variant="ghost"
            >
              <Avatar class="size-6">
                <AvatarFallback class="text-xs">{{ avatarText }}</AvatarFallback>
              </Avatar>
              <span class="max-w-28 truncate text-sm group-data-[collapsible=icon]:hidden">{{ user?.displayName || '我的账户' }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" class="w-56">
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none text-foreground">{{ user?.displayName }}</p>
                <p class="truncate text-xs leading-none text-muted-foreground">{{ user?.email || '未绑定邮箱' }}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem as-child>
              <router-link to="/dashboard">仪表盘</router-link>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <router-link to="/profile">个人信息</router-link>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem
                class="text-destructive focus:text-destructive focus:bg-destructive/10"
                @click="showLogoutDialog = true"
            >
              <LogOut/>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span v-else class="hidden text-xs text-muted-foreground lg:inline group-data-[collapsible=icon]:hidden">未登录</span>
      </div>
    </SidebarFooter>

    <!-- 登出确认弹窗 -->
    <AlertDialog v-model:open="showLogoutDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认退出登录吗？</AlertDialogTitle>
          <AlertDialogDescription>
            退出后将清除本地登录状态，需要重新登录才能访问角色与皮肤等个人数据。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              @click="confirmLogout"
          >
            退出登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <SidebarRail/>
  </Sidebar>
</template>