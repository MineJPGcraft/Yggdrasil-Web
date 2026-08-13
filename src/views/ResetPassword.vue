<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {changePassword, getUserInfo, sendChangePasswordEmailCode, sendLoginEmailCode, userLoginAPI,} from '@/api';
import {AxiosError} from 'axios';

// ============ 第一步：使用邮箱验证码登录 ============
const email = ref('');
const loginCode = ref('');
const isSendingLoginCode = ref(false);
const loginMessage = ref('');
const loginIsError = ref(false);
const isLoggingIn = ref(false);

// ============ 第二步：设置新密码 ============
const passwordCode = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const isSendingPasswordCode = ref(false);
const passwordMessage = ref('');
const passwordIsError = ref(false);
const isSavingPassword = ref(false);

// 是否已完成验证码登录（进入第二步）
const loggedIn = ref(false);
const router = useRouter();

const handleSendLoginCode = async () => {
  loginMessage.value = '';
  loginIsError.value = false;
  if (!email.value) {
    loginMessage.value = '请先填写邮箱。';
    loginIsError.value = true;
    return;
  }
  isSendingLoginCode.value = true;
  try {
    await sendLoginEmailCode(email.value);
    loginMessage.value = '验证码已发送到您的邮箱。';
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>;
    loginMessage.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。';
    loginIsError.value = true;
  } finally {
    isSendingLoginCode.value = false;
  }
};

/** 通过邮箱验证码登录，建立会话后进入设置新密码步骤 */
const handleLoginWithCode = async () => {
  loginMessage.value = '';
  loginIsError.value = false;
  if (!email.value || !loginCode.value) {
    loginMessage.value = '请填写邮箱和验证码。';
    loginIsError.value = true;
    return;
  }
  isLoggingIn.value = true;
  try {
    await userLoginAPI({email: email.value, emailCode: loginCode.value});
    const user = await getUserInfo();
    localStorage.setItem('userInfo', JSON.stringify(user));
    loggedIn.value = true;
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>;
    loginMessage.value = err.response?.data?.errorMessage || '验证码登录失败，请重试。';
    loginIsError.value = true;
  } finally {
    isLoggingIn.value = false;
  }
};

const handleSendPasswordCode = async () => {
  passwordMessage.value = '';
  passwordIsError.value = false;
  isSendingPasswordCode.value = true;
  try {
    await sendChangePasswordEmailCode();
    passwordMessage.value = '验证码已发送到您的邮箱。';
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>;
    passwordMessage.value = err.response?.data?.errorMessage || '验证码发送失败，请重试。';
    passwordIsError.value = true;
  } finally {
    isSendingPasswordCode.value = false;
  }
};

const handleSavePassword = async () => {
  passwordMessage.value = '';
  passwordIsError.value = false;
  if (!passwordCode.value || !newPassword.value || !confirmNewPassword.value) {
    passwordMessage.value = '请填写验证码和新密码。';
    passwordIsError.value = true;
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    passwordMessage.value = '两次输入的密码不一致。';
    passwordIsError.value = true;
    return;
  }
  isSavingPassword.value = true;
  try {
    await changePassword({emailCode: passwordCode.value, newPassword: newPassword.value});
    // 修改密码会清除全部会话，退出前端登录态
    localStorage.removeItem('userInfo');
    passwordMessage.value = '密码重置成功，请使用新密码登录。';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    const err = error as AxiosError<{ errorMessage?: string }>;
    passwordMessage.value = err.response?.data?.errorMessage || '密码重置失败，请重试。';
    passwordIsError.value = true;
  } finally {
    isSavingPassword.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">
          重置密码
        </CardTitle>
        <CardDescription>
          {{ loggedIn ? '设置您的新密码。' : '通过邮箱验证码验证身份。' }}
        </CardDescription>
      </CardHeader>

      <!-- 第一步：验证码登录 -->
      <CardContent v-if="!loggedIn" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">邮箱</Label>
          <div class="flex gap-2">
            <Input id="email" v-model="email" placeholder="m@example.com" required type="email"/>
            <Button :disabled="isSendingLoginCode" type="button" variant="outline" @click="handleSendLoginCode">
              {{ isSendingLoginCode ? '发送中...' : '获取验证码' }}
            </Button>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="login-code">邮箱验证码</Label>
          <Input id="login-code" v-model="loginCode" placeholder="请输入验证码" required/>
        </div>
        <div v-if="loginMessage" :class="['text-sm font-medium', loginIsError ? 'text-destructive' : 'text-primary']">
          {{ loginMessage }}
        </div>
        <Button :disabled="isLoggingIn" class="w-full" type="submit" @click="handleLoginWithCode">
          {{ isLoggingIn ? '验证中...' : '验证并继续' }}
        </Button>
      </CardContent>

      <!-- 第二步：设置新密码 -->
      <CardContent v-else class="grid gap-4">
        <div class="grid gap-2">
          <Label for="password-code">新密码验证码</Label>
          <div class="flex gap-2">
            <Input id="password-code" v-model="passwordCode" placeholder="请输入验证码" required/>
            <Button :disabled="isSendingPasswordCode" type="button" variant="outline" @click="handleSendPasswordCode">
              {{ isSendingPasswordCode ? '发送中...' : '获取验证码' }}
            </Button>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="new-password">新密码</Label>
          <Input id="new-password" v-model="newPassword" required type="password"/>
        </div>
        <div class="grid gap-2">
          <Label for="confirm-new-password">确认新密码</Label>
          <Input id="confirm-new-password" v-model="confirmNewPassword" required type="password"/>
        </div>
        <div v-if="passwordMessage"
             :class="['text-sm font-medium', passwordIsError ? 'text-destructive' : 'text-primary']">
          {{ passwordMessage }}
        </div>
        <Button :disabled="isSavingPassword" class="w-full" type="submit" @click="handleSavePassword">
          {{ isSavingPassword ? '保存中...' : '保存新密码' }}
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
