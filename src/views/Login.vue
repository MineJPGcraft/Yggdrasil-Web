<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAPI } from '../api.js';

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
    await loginAPI(email.value, password.value);
    // The API automatically sets the token, so we just need to navigate.
    // A small delay to allow potential storage events to fire if needed by other components.
    setTimeout(() => {
        router.push('/dashboard');
    }, 100);

  } catch (error) {
    console.error('登录失败:', error);
    errorMessage.value = error.response?.data?.message || '登录失败。请检查您的凭据并重试。';
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