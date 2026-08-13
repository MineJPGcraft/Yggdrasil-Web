<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {
  changePassword,
  getOidcBindUrl,
  getOidcProviders,
  getUserInfo,
  type OidcProvider,
  sendChangePasswordEmailCode,
  sendSetEmailCode,
  setUserEmail,
  unbindOidc,
} from '@/api'
import {AxiosError} from 'axios'

// ============ 用户信息 ============
const userEmail = ref('')
const displayName = ref('')
const hasPassword = ref(true)
const bindingOIDC = ref<string[]>([])

// ============ 修改邮箱 ============
const newEmail = ref('')
const emailCode = ref('')
const emailMessage = ref('')
const emailIsError = ref(false)
const isSendingEmailCode = ref(false)
const isSavingEmail = ref(false)

// ============ 修改密码 ============
const passwordMode = ref<'old' | 'code'>('old')
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordCode = ref('')
const passwordMessage = ref('')
const passwordIsError = ref(false)
const isSendingPasswordCode = ref(false)
const isSavingPassword = ref(false)

// ============ OIDC 绑定 ============
const oidcProviders = ref<OidcProvider[]>([])
const oidcMessage = ref('')
const oidcIsError = ref(false)

const boundProviders = computed(() =>
    oidcProviders.value.filter(p => bindingOIDC.value.includes(p.providerId))
)
const unboundProviders = computed(() =>
    oidcProviders.value.filter(p => !bindingOIDC.value.includes(p.providerId))
)

const OIDC_CALLBACK_URI = `${window.location.origin}/oidc/callback?after=/profile`

const loadUserInfo = async () => {
  const user = await getUserInfo()
  userEmail.value = user.email
  displayName.value = user.displayName
  hasPassword.value = user.hasPassword
  bindingOIDC.value = user.bindingOIDC || []
}

onMounted(async () => {
  try {
    await loadUserInfo()
  } catch (e) {
    console.error('加载用户信息失败:', e)
  }
  try {
    const res = await getOidcProviders()
    oidcProviders.value = res.providers
  } catch (e) {
    console.error('加载 OIDC 提供商失败:', e)
  }
})

// ============ 修改邮箱 ============
const handleSendEmailCode = async () => {
  emailMessage.value = ''
  emailIsError.value = false
  if (!newEmail.value) {
    emailMessage.value = '请先填写新邮箱。'
    emailIsError.value = true
    return
  }
  isSendingEmailCode.value = true
  try {
    await sendSetEmailCode(newEmail.value)
    emailMessage.value = '验证码已发送到新邮箱。'
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>
    emailMessage.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。'
    emailIsError.value = true
  } finally {
    isSendingEmailCode.value = false
  }
}

const handleSaveEmail = async () => {
  emailMessage.value = ''
  emailIsError.value = false
  if (!newEmail.value || !emailCode.value) {
    emailMessage.value = '请填写新邮箱和验证码。'
    emailIsError.value = true
    return
  }
  isSavingEmail.value = true
  try {
    const res = await setUserEmail(newEmail.value, emailCode.value)
    emailMessage.value = '邮箱修改成功。'
    newEmail.value = ''
    emailCode.value = ''
    userEmail.value = res.email
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>
    emailMessage.value = err.response?.data?.errorMessage || '邮箱修改失败，请重试。'
    emailIsError.value = true
  } finally {
    isSavingEmail.value = false
  }
}

// ============ 修改密码 ============
const handleSendPasswordCode = async () => {
  passwordMessage.value = ''
  passwordIsError.value = false
  isSendingPasswordCode.value = true
  try {
    await sendChangePasswordEmailCode()
    passwordMessage.value = '验证码已发送到您的邮箱。'
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>
    passwordMessage.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。'
    passwordIsError.value = true
  } finally {
    isSendingPasswordCode.value = false
  }
}

const handleSavePassword = async () => {
  passwordMessage.value = ''
  passwordIsError.value = false

  const newPass = newPassword.value
  if (!newPass || !confirmNewPassword.value) {
    passwordMessage.value = '请填写新密码和确认密码。'
    passwordIsError.value = true
    return
  }
  if (newPass !== confirmNewPassword.value) {
    passwordMessage.value = '两次输入的密码不一致。'
    passwordIsError.value = true
    return
  }
  if (passwordMode.value === 'old' && !hasPassword.value) {
    passwordMessage.value = '当前账户未设置密码，请使用邮箱验证码方式。'
    passwordIsError.value = true
    return
  }
  if (passwordMode.value === 'old' && !currentPassword.value) {
    passwordMessage.value = '请输入当前密码。'
    passwordIsError.value = true
    return
  }
  if (passwordMode.value === 'code' && !passwordCode.value) {
    passwordMessage.value = '请输入邮箱验证码。'
    passwordIsError.value = true
    return
  }

  isSavingPassword.value = true
  try {
    if (passwordMode.value === 'old') {
      await changePassword({oldPassword: currentPassword.value, newPassword: newPass})
    } else {
      await changePassword({emailCode: passwordCode.value, newPassword: newPass})
    }
    passwordMessage.value = '密码修改成功，请重新登录。'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    passwordCode.value = ''
    // 修改密码会清除全部会话，需退出前端登录态
    localStorage.removeItem('userInfo')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>
    passwordMessage.value = err.response?.data?.errorMessage || '密码修改失败，请重试。'
    passwordIsError.value = true
  } finally {
    isSavingPassword.value = false
  }
}

// ============ OIDC 绑定 ============
const handleBindOidc = (providerId: string) => {
  window.location.href = getOidcBindUrl(providerId, OIDC_CALLBACK_URI)
}

const handleUnbindOidc = async (providerId: string) => {
  oidcMessage.value = ''
  oidcIsError.value = false
  try {
    const res = await unbindOidc(providerId)
    bindingOIDC.value = res.bindingOIDC
    oidcMessage.value = '已解绑该第三方账号。'
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>
    oidcMessage.value = err.response?.data?.errorMessage || '解绑失败，请重试。'
    oidcIsError.value = true
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
      <!-- 账号概览 -->
      <Card>
        <CardHeader>
          <CardTitle>账号信息</CardTitle>
          <CardDescription>您的基本账号信息。</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-2 text-sm">
          <p><span class="text-muted-foreground">显示名：</span>{{ displayName || '-' }}</p>
          <p><span class="text-muted-foreground">邮箱：</span>{{ userEmail || '未绑定' }}</p>
          <p><span class="text-muted-foreground">密码：</span>{{ hasPassword ? '已设置' : '未设置' }}</p>
        </CardContent>
      </Card>

      <!-- 修改邮箱 -->
      <Card>
        <CardHeader>
          <CardTitle>修改邮箱</CardTitle>
          <CardDescription>更新您的账户邮箱地址。若当前未绑定邮箱，可在此首次绑定。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="new-email">新邮箱</Label>
            <Input id="new-email" v-model="newEmail" placeholder="输入新邮箱地址" type="email"/>
          </div>
          <div class="grid gap-2">
            <Label for="email-code">邮箱验证码</Label>
            <div class="flex gap-2">
              <Input id="email-code" v-model="emailCode" placeholder="请输入验证码"/>
              <Button :disabled="isSendingEmailCode" type="button" variant="outline" @click="handleSendEmailCode">
                {{ isSendingEmailCode ? '发送中...' : '获取验证码' }}
              </Button>
            </div>
          </div>
          <div v-if="emailMessage" :class="['text-sm font-medium', emailIsError ? 'text-destructive' : 'text-primary']">
            {{ emailMessage }}
          </div>
          <Button :disabled="isSavingEmail" @click="handleSaveEmail">
            {{ isSavingEmail ? '保存中...' : '保存新邮箱' }}
          </Button>
        </CardContent>
      </Card>

      <!-- 修改密码 -->
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>更改您的账户密码。修改成功后所有会话将失效，需重新登录。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Tabs v-model="passwordMode" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger :disabled="!hasPassword" value="old">使用旧密码</TabsTrigger>
              <TabsTrigger value="code">使用邮箱验证码</TabsTrigger>
            </TabsList>

            <TabsContent class="grid gap-4 mt-4" value="old">
              <div class="grid gap-2">
                <Label for="current-password">当前密码</Label>
                <Input id="current-password" v-model="currentPassword" placeholder="输入当前密码" type="password"/>
              </div>
            </TabsContent>

            <TabsContent class="grid gap-4 mt-4" value="code">
              <div class="grid gap-2">
                <Label for="password-code">邮箱验证码</Label>
                <div class="flex gap-2">
                  <Input id="password-code" v-model="passwordCode" placeholder="请输入验证码"/>
                  <Button :disabled="isSendingPasswordCode" type="button" variant="outline"
                          @click="handleSendPasswordCode">
                    {{ isSendingPasswordCode ? '发送中...' : '获取验证码' }}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div class="grid gap-2">
            <Label for="new-password">新密码</Label>
            <Input id="new-password" v-model="newPassword" type="password" placeholder="输入新密码" />
          </div>
          <div class="grid gap-2">
            <Label for="confirm-new-password">确认新密码</Label>
            <Input id="confirm-new-password" v-model="confirmNewPassword" type="password" placeholder="再次输入新密码" />
          </div>
          <div v-if="passwordMessage"
               :class="['text-sm font-medium', passwordIsError ? 'text-destructive' : 'text-primary']">
            {{ passwordMessage }}
          </div>
          <Button :disabled="isSavingPassword" @click="handleSavePassword">
            {{ isSavingPassword ? '保存中...' : '保存新密码' }}
          </Button>
        </CardContent>
      </Card>

      <!-- OIDC 绑定 -->
      <Card>
        <CardHeader>
          <CardTitle>第三方账号绑定</CardTitle>
          <CardDescription>关联您的 OpenID Connect 身份提供商。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 已绑定 -->
          <div v-if="boundProviders.length > 0" class="grid gap-2">
            <p class="text-sm text-muted-foreground">已绑定：</p>
            <div v-for="provider in boundProviders" :key="provider.providerId"
                 class="flex items-center justify-between rounded-md border px-3 py-2">
              <span class="flex items-center gap-2 text-sm">
                <img v-if="provider.iconUrl" :alt="provider.displayName || provider.providerId" :src="provider.iconUrl"
                     class="h-4 w-4"/>
                {{ provider.displayName || provider.providerId }}
              </span>
              <Button size="sm" variant="outline" @click="handleUnbindOidc(provider.providerId)">解绑</Button>
            </div>
          </div>
          <p v-else-if="oidcProviders.length === 0" class="text-sm text-muted-foreground">暂无可用提供商。</p>

          <!-- 未绑定 -->
          <div v-if="unboundProviders.length > 0" class="grid gap-2">
            <p class="text-sm text-muted-foreground">可绑定：</p>
            <div v-for="provider in unboundProviders" :key="provider.providerId"
                 class="flex items-center justify-between rounded-md border px-3 py-2">
              <span class="flex items-center gap-2 text-sm">
                <img v-if="provider.iconUrl" :alt="provider.displayName || provider.providerId" :src="provider.iconUrl"
                     class="h-4 w-4"/>
                {{ provider.displayName || provider.providerId }}
              </span>
              <Button size="sm" @click="handleBindOidc(provider.providerId)">绑定</Button>
            </div>
          </div>

          <div v-if="oidcMessage" :class="['text-sm font-medium', oidcIsError ? 'text-destructive' : 'text-primary']">
            {{ oidcMessage }}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
