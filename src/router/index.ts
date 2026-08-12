import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: () => {
            const loggedIn = !!localStorage.getItem('userInfo');
            if (loggedIn) {
                return { name: 'dashboard' };
            }
            return { name: 'login' };
        }
    },
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'role-management',
                name: 'role-management',
                component: () => import('@/views/RoleManagement.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'profile',
                name: 'user-profile',
                component: () => import('@/views/UserProfile.vue'),
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/register.vue'),
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('@/views/ResetPassword.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    // 登录态以 localStorage 中的 userInfo 为标记（真实会话凭据为 HttpOnly Cookie）
    const loggedIn = !!localStorage.getItem('userInfo');
    const isAuthenticated = loggedIn;

    // 定义只有未认证用户才能访问的页面
    const publicOnlyPages = ['login', 'register', 'reset-password'];
    const isPublicOnlyPage = publicOnlyPages.includes(String(to.name));

    // 情况1: 用户已认证，但尝试访问登录/注册/重置密码页面
    if (isAuthenticated && isPublicOnlyPage) {
        next({ name: 'dashboard' });
    }
    // 情况2: 路由需要认证，但用户未登录
    else if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
    // 其他情况: 继续导航
    else {
        next();
    }
});

export default router;
