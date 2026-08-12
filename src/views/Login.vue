<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {getUserInfo, userLoginAPI} from '@/api';
import {AxiosError} from 'axios';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = '邮箱和密码都是必填项。';
    return;
  }

  try {
    // Cookie 会话登录（无响应体），成功后会话凭据由浏览器自动携带
    await userLoginAPI({email: email.value, password: password.value});

    // 拉取用户信息作为前端会话标记，供路由守卫 / Navbar 使用
    const user = await getUserInfo();
    localStorage.setItem('userInfo', JSON.stringify(user));

    router.push('/dashboard');
  } catch (error) {
    console.error('登录失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    errorMessage.value = err.response?.data?.errorMessage || '登录失败。请检查您的凭据并重试。';
  }
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
          在下方输入您的邮箱以登录您的账户。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">邮箱</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">密码</Label>
            <router-link to="/reset-password" class="ml-auto inline-block text-sm underline">
              忘记密码？
            </router-link>
          </div>
          <Input id="password" v-model="password" type="password" required />
        </div>
        <div v-if="errorMessage" class="text-sm font-medium text-destructive">
          {{ errorMessage }}
        </div>
        <Button type="submit" class="w-full" @click="handleLogin">
          登录
        </Button>
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