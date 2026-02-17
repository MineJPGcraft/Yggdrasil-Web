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
import { register, registerProfileAPI } from '../api.js';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const profileName = ref(''); // 新增：角色名
const message = ref('');
const isError = ref(false);
const isLoading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  message.value = '';
  isError.value = false;

  if (!email.value || !password.value || !confirmPassword.value || !profileName.value) { // 新增 profileName 验证
    message.value = '所有字段都是必填项。';
    isError.value = true;
    return;
  }

  if (password.value !== confirmPassword.value) {
    message.value = '两次输入的密码不一致。';
    isError.value = true;
    return;
  }

  isLoading.value = true;
  try {
    const userData = {
      username: email.value,
      password: password.value,
    };
    await register(userData); // 先注册用户

    // 用户注册成功后，使用用户提供的角色名注册角色
    await registerProfileAPI(profileName.value, email.value, password.value); // 传入密码以防后端需要

    message.value = '账户和角色创建成功！正在跳转到登录页...';
    isError.value = false;
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    console.error('注册失败:', error);
    message.value = error.response?.data?.errorMessage || error.message || '注册失败。请重试。';
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">
          创建账户
        </CardTitle>
        <CardDescription>
          输入您的邮箱、密码和角色名开始。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">邮箱</Label>
          <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
        </div>
        <div class="grid gap-2">
          <Label for="profile-name">角色名</Label>
          <Input id="profile-name" v-model="profileName" type="text" placeholder="请输入您的角色名" required />
        </div>
        <div class="grid gap-2">
          <Label for="password">密码</Label>
          <Input id="password" v-model="password" type="password" required />
        </div>
        <div class="grid gap-2">
          <Label for="confirm-password">确认密码</Label>
          <Input id="confirm-password" v-model="confirmPassword" type="password" required />
        </div>
        <div v-if="message" :class="['text-sm font-medium', isError ? 'text-destructive' : 'text-primary']">
          {{ message }}
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading" @click="handleRegister">
          {{ isLoading ? '正在创建账户...' : '创建账户' }}
        </Button>
      </CardContent>
      <CardFooter class="text-center text-sm">
        已经有账户了？
        <router-link to="/login" class="underline ml-1">
          登录
        </router-link>
      </CardFooter>
    </Card>
  </div>
</template>