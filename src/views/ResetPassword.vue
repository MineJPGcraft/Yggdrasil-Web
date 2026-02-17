<script setup>
import { ref } from 'vue';
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

const email = ref('');
const message = ref('');
const isLoading = ref(false);

const handleResetRequest = async () => {
  message.value = '';
  if (!email.value) {
    message.value = '请输入您的邮箱地址。';
    return;
  }

  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
    message.value = '如果该邮箱地址存在，一封密码重置链接已发送到您的邮箱。';
  }, 1500);
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">
          忘记密码
        </CardTitle>
        <CardDescription>
          输入您的邮箱，我们将发送密码重置链接给您。
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
        <div v-if="message" class="text-sm font-medium text-primary">
          {{ message }}
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading" @click="handleResetRequest">
          {{ isLoading ? '发送中...' : '发送重置链接' }}
        </Button>
      </CardContent>
      <CardFooter class="text-center text-sm">
        还记得密码？
        <router-link to="/login" class="underline ml-1">
          返回登录
        </router-link>
      </CardFooter>
    </Card>
  </div>
</template>