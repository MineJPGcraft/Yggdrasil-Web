<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {registerUser, sendRegisterEmailCode} from '@/api';
import {AxiosError} from 'axios';

const email = ref('');
const emailCode = ref(''); // 新增：注册邮箱验证码
const password = ref('');
const confirmPassword = ref('');
const displayName = ref(''); // 账户显示名（原角色名改为显示名，角色需登录后创建）
const message = ref('');
const isError = ref(false);
const isLoading = ref(false);
const isSendingCode = ref(false);
const router = useRouter();

const handleSendCode = async () => {
  if (!email.value) {
    message.value = '请先填写邮箱。';
    isError.value = true;
    return;
  }
  isSendingCode.value = true;
  message.value = '';
  isError.value = false;
  try {
    await sendRegisterEmailCode(email.value);
    message.value = '验证码已发送到您的邮箱。';
  } catch (error) {
    console.error('发送验证码失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    message.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。';
    isError.value = true;
  } finally {
    isSendingCode.value = false;
  }
};

const handleRegister = async () => {
  message.value = '';
  isError.value = false;

  if (!email.value || !emailCode.value || !password.value || !confirmPassword.value || !displayName.value) { // 新增 emailCode 验证
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
    // 注册用户（邮箱 + 验证码 + 显示名）
    await registerUser(email.value, password.value, emailCode.value, displayName.value);

    message.value = '账户创建成功！正在跳转到登录页...';
    isError.value = false;
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    console.error('注册失败:', error);
    const err = error as AxiosError<{ errorMessage?: string }>;
    message.value = err.response?.data?.errorMessage || (error as Error).message || '注册失败。请重试。';
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
          输入您的邮箱、验证码、密码和显示名开始。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">邮箱</Label>
          <div class="flex gap-2">
            <Input id="email" v-model="email" placeholder="m@example.com" required type="email"/>
            <Button :disabled="isSendingCode" type="button" variant="outline" @click="handleSendCode">
              {{ isSendingCode ? '发送中...' : '获取验证码' }}
            </Button>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="email-code">邮箱验证码</Label>
          <Input id="email-code" v-model="emailCode" placeholder="请输入验证码" required type="text"/>
        </div>
        <div class="grid gap-2">
          <Label for="display-name">显示名</Label>
          <Input id="display-name" v-model="displayName" placeholder="请输入您的显示名" required type="text"/>
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