<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {
  createLauncherSession,
  deleteLauncherSession,
  getLauncherSession,
  getLauncherSessions,
  getYggdrasilProfiles,
  type LauncherSessionCredential,
  type LauncherSessionSummary,
  type YggdrasilProfile,
} from '@/api'
import {AxiosError} from 'axios'

const loading = ref(true)
const error = ref<string | null>(null)
const sessions = ref<LauncherSessionSummary[]>([])

// 创建会话相关
const profiles = ref<YggdrasilProfile[]>([])
const selectedProfileId = ref('')
const isCreating = ref(false)
const createMessage = ref('')
const createIsError = ref(false)

// 凭据展示
const credential = ref<LauncherSessionCredential | null>(null)
const copyMessage = ref('')

const loadSessions = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getLauncherSessions()
    sessions.value = res.launcherSessions
  } catch (err) {
    console.error('加载启动器会话失败:', err)
    error.value = '加载启动器会话失败。'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadSessions()
  try {
    const res = await getYggdrasilProfiles()
    profiles.value = res.profiles
  } catch (err) {
    console.error('加载角色列表失败:', err)
  }
})

const handleCreateSession = async () => {
  createMessage.value = ''
  createIsError.value = false
  if (!selectedProfileId.value) {
    createMessage.value = '请选择要绑定启动器会话的角色。'
    createIsError.value = true
    return
  }
  isCreating.value = true
  try {
    const session = await createLauncherSession(selectedProfileId.value)
    credential.value = session
    createMessage.value = '启动器会话创建成功，请妥善保存凭据。'
    selectedProfileId.value = ''
    await loadSessions()
  } catch (err) {
    console.error('创建启动器会话失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    createMessage.value = axiosErr.response?.data?.errorMessage || '创建启动器会话失败，请重试。'
    createIsError.value = true
  } finally {
    isCreating.value = false
  }
}

const handleViewCredentials = async (sessionId: string) => {
  copyMessage.value = ''
  try {
    credential.value = await getLauncherSession(sessionId)
  } catch (err) {
    console.error('获取启动器会话信息失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    createMessage.value = axiosErr.response?.data?.errorMessage || '获取会话信息失败。'
    createIsError.value = true
  }
}

const handleDeleteSession = async (sessionId: string) => {
  if (!window.confirm('确定删除该启动器会话吗？删除后其关联令牌将全部失效。')) {
    return
  }
  try {
    await deleteLauncherSession(sessionId)
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
    if (credential.value?.id === sessionId) {
      credential.value = null
    }
  } catch (err) {
    console.error('删除启动器会话失败:', err)
    const axiosErr = err as AxiosError<{ errorMessage?: string }>
    createMessage.value = axiosErr.response?.data?.errorMessage || '删除启动器会话失败。'
    createIsError.value = true
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = '已复制到剪贴板。'
  } catch {
    copyMessage.value = '复制失败，请手动复制。'
  }
}
</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        启动器会话
      </h2>
    </div>

    <!-- 创建启动器会话 -->
    <Card>
      <CardHeader>
        <CardTitle>创建启动器会话</CardTitle>
        <CardDescription>
          启动器会话提供一组用于登录 Minecraft 的「用户名 + 密码」，供支持 authlib-injector 的启动器使用。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="profiles.length === 0" class="text-sm text-muted-foreground">
          您还没有任何角色，请先前往
          <router-link class="text-primary hover:underline" to="/role-management">角色管理</router-link>
          创建角色。
        </div>
        <div v-else class="grid w-full max-w-sm items-center gap-1.5">
          <Label for="profile-select">绑定角色</Label>
          <Select v-model="selectedProfileId">
            <SelectTrigger id="profile-select" class="w-full">
              <SelectValue placeholder="选择要绑定的角色"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="profile in profiles" :key="profile.id" :value="profile.id">
                {{ profile.name }}（{{ profile.id }}）
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="createMessage" :class="['text-sm font-medium', createIsError ? 'text-destructive' : 'text-primary']">
          {{ createMessage }}
        </div>

        <Button :disabled="isCreating || profiles.length === 0" @click="handleCreateSession">
          {{ isCreating ? '创建中...' : '创建启动器会话' }}
        </Button>

        <!-- 凭据展示 -->
        <div v-if="credential" class="rounded-md border bg-muted/50 p-4 space-y-2">
          <p class="text-sm font-semibold">会话凭据（仅展示一次有效）</p>
          <div class="flex items-center justify-between gap-2 text-sm">
            <span>用户名：<code class="break-all">{{ credential.username }}</code></span>
            <Button size="sm" variant="outline" @click="copyToClipboard(credential.username)">复制</Button>
          </div>
          <div class="flex items-center justify-between gap-2 text-sm">
            <span>密码：<code class="break-all">{{ credential.password }}</code></span>
            <Button size="sm" variant="outline" @click="copyToClipboard(credential.password)">复制</Button>
          </div>
          <p class="text-xs text-muted-foreground">绑定角色：{{ credential.selectedProfile.name }}</p>
          <p v-if="copyMessage" class="text-xs text-primary">{{ copyMessage }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- 会话列表 -->
    <Card>
      <CardHeader>
        <CardTitle>我的启动器会话</CardTitle>
        <CardDescription v-if="sessions.length === 0">暂无启动器会话。</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-8">
          <p>正在加载启动器会话...</p>
        </div>
        <div v-else-if="error" class="text-center py-8 text-destructive">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="sessions.length > 0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>登录名</TableHead>
                <TableHead>会话 ID</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="session in sessions" :key="session.id">
                <TableCell class="font-medium">{{ session.username }}</TableCell>
                <TableCell class="text-xs text-muted-foreground">{{ session.id }}</TableCell>
                <TableCell class="text-right space-x-2">
                  <Button size="sm" variant="outline" @click="handleViewCredentials(session.id)">查看凭据</Button>
                  <Button size="sm" variant="destructive" @click="handleDeleteSession(session.id)">删除</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
