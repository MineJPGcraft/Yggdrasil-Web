<script setup>
import { ref } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // 导入 Avatar 组件
import { uploadAvatarAPI } from '@/api.js' // 导入虚拟头像上传 API

// 占位符数据，实际应该从后端获取
const userEmail = ref('user@example.com') // 假设当前用户的邮箱
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const oidcProvider = ref('') // OIDC 绑定信息

const message = ref('')
const isError = ref(false)

// 头像上传相关状态
const currentAvatarUrl = ref('/placeholder-user.jpg') // 默认头像或从用户数据获取
const avatarFile = ref(null)
const isUploadingAvatar = ref(false)
const avatarUploadMessage = ref('')
const isAvatarUploadError = ref(false)

const handleEmailChange = () => {
  message.value = '修改邮箱功能尚未实现，此为占位符。'
  isError.value = false
}

const handlePasswordChange = () => {
  message.value = '修改密码功能尚未实现，此为占位符。'
  isError.value = false
}

const handleOidcBind = () => {
  message.value = '绑定 OIDC 功能尚未实现，此为占位符。'
  isError.value = false
}

const handleAvatarFileChange = (event) => {
  const file = event.target.files[0]
  if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif')) {
    avatarFile.value = file
    avatarUploadMessage.value = ''
    isAvatarUploadError.value = false
  } else {
    avatarFile.value = null
    avatarUploadMessage.value = '请选择一个图片文件 (PNG, JPG, GIF)。'
    isAvatarUploadError.value = true
  }
}

const handleAvatarUpload = async () => {
  if (!avatarFile.value) {
    avatarUploadMessage.value = '请选择要上传的头像文件。'
    isAvatarUploadError.value = true
    return
  }

  isUploadingAvatar.value = true
  avatarUploadMessage.value = ''
  isAvatarUploadError.value = false

  try {
    const responseMessage = await uploadAvatarAPI(avatarFile.value) // 调用虚拟 API
    avatarUploadMessage.value = responseMessage
    // 模拟成功后更新头像URL，实际应该从后端获取新的头像URL
    currentAvatarUrl.value = URL.createObjectURL(avatarFile.value)
    // 清空文件输入
    document.getElementById('avatar-file').value = ''
    avatarFile.value = null
  } catch (err) {
    console.error('头像上传失败:', err)
    avatarUploadMessage.value = err.message || '头像上传失败，请重试。'
    isAvatarUploadError.value = true
  } finally {
    isUploadingAvatar.value = false
  }
}

</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">
        个人信息
      </h2>
    </div>

    <div class="space-y-6">
      <!-- 上传头像 -->
      <Card>
        <CardHeader>
          <CardTitle>上传头像</CardTitle>
          <CardDescription>更新您的个人头像。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center space-x-4">
            <Avatar class="h-20 w-20">
              <AvatarImage :src="currentAvatarUrl" alt="用户头像" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div class="grid gap-2">
              <Label for="avatar-file">选择头像文件</Label>
              <Input id="avatar-file" type="file" accept="image/png, image/jpeg, image/gif" @change="handleAvatarFileChange" />
            </div>
          </div>
          <div v-if="avatarUploadMessage" :class="['text-sm font-medium', isAvatarUploadError ? 'text-destructive' : 'text-primary']">
            {{ avatarUploadMessage }}
          </div>
          <Button :disabled="isUploadingAvatar" @click="handleAvatarUpload">
            {{ isUploadingAvatar ? '正在上传...' : '上传头像' }}
          </Button>
        </CardContent>
      </Card>

      <!-- 修改邮箱 -->
      <Card>
        <CardHeader>
          <CardTitle>修改邮箱</CardTitle>
          <CardDescription>更新您的账户邮箱地址。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="current-email">当前邮箱</Label>
            <Input id="current-email" v-model="userEmail" type="email" disabled />
          </div>
          <div class="grid gap-2">
            <Label for="new-email">新邮箱</Label>
            <Input id="new-email" type="email" placeholder="输入新邮箱地址" />
          </div>
          <Button @click="handleEmailChange">保存新邮箱</Button>
        </CardContent>
      </Card>

      <!-- 修改密码 -->
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>更改您的账户密码。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="current-password">当前密码</Label>
            <Input id="current-password" v-model="currentPassword" type="password" placeholder="输入当前密码" />
          </div>
          <div class="grid gap-2">
            <Label for="new-password">新密码</Label>
            <Input id="new-password" v-model="newPassword" type="password" placeholder="输入新密码" />
          </div>
          <div class="grid gap-2">
            <Label for="confirm-new-password">确认新密码</Label>
            <Input id="confirm-new-password" v-model="confirmNewPassword" type="password" placeholder="再次输入新密码" />
          </div>
          <Button @click="handlePasswordChange">保存新密码</Button>
        </CardContent>
      </Card>

      <!-- 绑定 OIDC -->
      <Card>
        <CardHeader>
          <CardTitle>绑定 OIDC</CardTitle>
          <CardDescription>关联您的 OpenID Connect 身份提供商。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="oidc-provider">OIDC 提供商</Label>
            <Input id="oidc-provider" v-model="oidcProvider" type="text" placeholder="输入 OIDC 提供商地址" />
          </div>
          <Button @click="handleOidcBind">绑定 OIDC</Button>
        </CardContent>
      </Card>
    </div>

    <div v-if="message" :class="['text-sm font-medium mt-4', isError ? 'text-destructive' : 'text-primary']">
      {{ message }}
    </div>
  </div>
</template>