<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {getUserInfo} from '@/api';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref<string | null>(null);
const errorCode = ref<string | null>(null);

/** 校验回调成功后要跳转的前端路径（仅允许站内路径） */
function resolveAfterTarget(after: string | null): string {
  if (after && after.startsWith('/') && !after.startsWith('//')) {
    return after;
  }
  return '/dashboard';
}

onMounted(async () => {
  const status = route.query.status;
  const after = typeof route.query.after === 'string' ? route.query.after : null;

  // 失败：展示后端回调携带的错误信息（如 UserBanned）
  if (status === 'error') {
    errorCode.value = typeof route.query.error === 'string' ? route.query.error : null;
    error.value = typeof route.query.errorMessage === 'string'
        ? route.query.errorMessage
        : 'OIDC 授权失败，请重试。';
    loading.value = false;
    return;
  }

  // 成功：后端已通过 Set-Cookie 建立会话，拉取用户信息作为前端登录态
  try {
    const user = await getUserInfo();
    localStorage.setItem('userInfo', JSON.stringify(user));
    router.replace(resolveAfterTarget(after));
  } catch (e) {
    console.error('OIDC 回调后获取用户信息失败:', e);
    errorCode.value = null;
    error.value = '登录未完成，请重试或使用其他方式登录。';
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">
          授权结果
        </CardTitle>
        <CardDescription v-if="loading">
          正在确认您的登录状态...
        </CardDescription>
        <CardDescription v-else>
          第三方登录未完成
        </CardDescription>
      </CardHeader>
      <CardContent v-if="!loading" class="grid gap-4 text-center">
        <p v-if="errorCode === 'UserBanned'" class="text-sm font-medium text-destructive">
          该账号已被封禁，无法登录。
        </p>
        <p class="text-sm text-muted-foreground">
          {{ error }}
        </p>
      </CardContent>
      <CardFooter v-if="!loading" class="flex justify-center gap-2">
        <Button as-child variant="outline">
          <router-link to="/">返回首页</router-link>
        </Button>
        <Button as-child>
          <router-link to="/login">重新登录</router-link>
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
