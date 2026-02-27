import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Login from '../views/Login.vue';
import Register from "../views/register.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Dashboard from "@/views/Dashboard.vue";
import RoleManagement from "@/views/RoleManagement.vue";
import UserProfile from "@/views/UserProfile.vue"; // 导入 UserProfile 组件

const routes = [
    {
        path: '/',
        redirect: to => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                return { name: 'dashboard' };
            }
            return { name: 'login' };
        }
    },
    {
        path: '/',
        component: DefaultLayout,
        children: [
            // {
            //     path: '', // 移除 Home 页面，因为根路径已被重定向处理
            //     name: 'Home',
            //     component: Home,
            // },
            {
                path: 'dashboard',
                name: 'dashboard',
                component: Dashboard,
                meta: { requiresAuth: true }
            },
            {
                path: 'role-management', // 添加角色管理路由
                name: 'role-management',
                component: RoleManagement,
                meta: { requiresAuth: true }
            },
            {
                path: 'profile', // 添加个人信息路由
                name: 'user-profile',
                component: UserProfile,
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPassword,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken');
    const isAuthenticated = !!token;

    // 定义只有未认证用户才能访问的页面
    const publicOnlyPages = ['login', 'register', 'reset-password'];
    const isPublicOnlyPage = publicOnlyPages.includes(to.name);

    // 情况1: 用户已认证，但尝试访问登录/注册/重置密码页面
    if (isAuthenticated && isPublicOnlyPage) {
        // 重定向到仪表盘或首页
        next({ name: 'dashboard' });
    }
    // 情况2: 路由需要认证，但用户未登录
    else if (to.meta.requiresAuth && !isAuthenticated) {
        // 重定向到登录页面，并保存原始路径
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
    // 其他情况: 继续导航
    else {
        next();
    }
});

export default router;
