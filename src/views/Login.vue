<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  getOidcAuthorizeUrl,
  getOidcProviders,
  getUserInfo,
  type OidcProvider,
  sendLoginEmailCode,
  userLoginAPI,
} from '@/api';
import {AxiosError} from 'axios';

// 登录方式：password 密码 / emailCode 邮箱验证码
const loginMode = ref<'password' | 'emailCode'>('password');

const email = ref('');
const password = ref('');
const emailCode = ref('');
const errorMessage = ref('');
const isSendingCode = ref(false);

const router = useRouter();
const route = useRoute();

// OIDC 提供商
const oidcProviders = ref<OidcProvider[]>([]);
const oidcEnabled = ref(false);

onMounted(async () => {
  try {
    const res = await getOidcProviders();
    oidcEnabled.value = res.enabled;
    oidcProviders.value = res.providers;
  } catch {
    // OIDC 不可用时静默忽略
  }
});

/** 登录成功后的统一处理：拉取用户信息作为前端登录态并跳转 */
const handleLoginSuccess = async (redirectTarget: string) => {
  const user = await getUserInfo();
  localStorage.setItem('userInfo', JSON.stringify(user));
  router.push(redirectTarget);
};

/** 获取登录成功后的跳转目标（优先 ?redirect= 回跳参数） */
const getRedirectTarget = (): string => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
  return redirect || '/dashboard';
};

const handlePasswordLogin = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = '邮箱和密码都是必填项。';
    return;
  }

  try {
    await userLoginAPI({email: email.value, password: password.value});
    await handleLoginSuccess(getRedirectTarget());
  } catch (error) {
    console.error('登录失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    errorMessage.value = err.response?.data?.errorMessage || '登录失败。请检查您的凭据并重试。';
  }
};

const handleSendCode = async () => {
  if (!email.value) {
    errorMessage.value = '请先填写邮箱。';
    return;
  }
  isSendingCode.value = true;
  errorMessage.value = '';
  try {
    await sendLoginEmailCode(email.value);
    errorMessage.value = '验证码已发送到您的邮箱。';
  } catch (error) {
    console.error('发送验证码失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    errorMessage.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。';
  } finally {
    isSendingCode.value = false;
  }
};

const handleEmailCodeLogin = async () => {
  errorMessage.value = '';
  if (!email.value || !emailCode.value) {
    errorMessage.value = '邮箱和验证码都是必填项。';
    return;
  }

  try {
    await userLoginAPI({email: email.value, emailCode: emailCode.value});
    await handleLoginSuccess(getRedirectTarget());
  } catch (error) {
    console.error('验证码登录失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    errorMessage.value = err.response?.data?.errorMessage || '登录失败。请检查验证码并重试。';
  }
};

const handleLogin = () => {
  if (loginMode.value === 'password') {
    void handlePasswordLogin();
  } else {
    void handleEmailCodeLogin();
  }
};

/** 点击 OIDC 提供商：跳转后端授权地址（302 → Provider） */
const handleOidcLogin = (providerId: string) => {
  const redirectUri = `${window.location.origin}/oidc/callback`;
  window.location.href = getOidcAuthorizeUrl(providerId, redirectUri);
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">
          登录
        </CardTitle>
        <CardDescription>
          登录您的账户以管理角色与皮肤。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <Tabs v-model="loginMode" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="password">密码登录</TabsTrigger>
            <TabsTrigger value="emailCode">验证码登录</TabsTrigger>
          </TabsList>

          <TabsContent class="grid gap-4 mt-4" value="password">
            <div class="grid gap-2">
              <Label for="email">邮箱</Label>
              <Input
                  id="email"
                  v-model="email"
                  placeholder="m@example.com"
                  required
                  type="email"
              />
            </div>
            <div class="grid gap-2">
              <div class="flex items-center">
                <Label for="password">密码</Label>
                <router-link class="ml-auto inline-block text-sm underline" to="/reset-password">
                  忘记密码？
                </router-link>
              </div>
              <Input id="password" v-model="password" required type="password"/>
            </div>
          </TabsContent>

          <TabsContent class="grid gap-4 mt-4" value="emailCode">
            <div class="grid gap-2">
              <Label for="code-email">邮箱</Label>
              <div class="flex gap-2">
                <Input id="code-email" v-model="email" placeholder="m@example.com" required type="email"/>
                <Button :disabled="isSendingCode" type="button" variant="outline" @click="handleSendCode">
                  {{ isSendingCode ? '发送中...' : '获取验证码' }}
                </Button>
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="email-code">邮箱验证码</Label>
              <Input id="email-code" v-model="emailCode" placeholder="请输入验证码" required/>
            </div>
          </TabsContent>
        </Tabs>

        <div v-if="errorMessage" class="text-sm font-medium text-destructive">
          {{ errorMessage }}
        </div>

        <Button type="submit" class="w-full" @click="handleLogin">
          登录
        </Button>

        <!-- OIDC 登录 -->
        <template v-if="oidcEnabled && oidcProviders.length > 0">
          <Separator class="my-2"/>
          <div class="grid gap-2">
            <p class="text-center text-xs text-muted-foreground">使用第三方账号登录</p>
            <Button
                v-for="provider in oidcProviders"
                :key="provider.providerId"
                class="w-full"
                variant="outline"
                @click="handleOidcLogin(provider.providerId)"
            >
              <img
                  v-if="provider.iconUrl"
                  :alt="provider.displayName || provider.providerId"
                  :src="provider.iconUrl"
                  class="mr-2 h-4 w-4"
              />
              {{ provider.displayName || provider.providerId }}
            </Button>
          </div>
        </template>
      </CardContent>
      <CardFooter class="text-center text-sm">
        还没有账户？
        <router-link to="/register" class="underline ml-1">
          注册
        </router-link>
      </CardFooter>
    </Card>
  </div>
</template>
