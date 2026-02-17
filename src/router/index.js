import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from "../views/register.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Dashboard from "@/views/Dashboard.vue";
import RoleManagement from "@/views/RoleManagement.vue";
import UserProfile from "@/views/UserProfile.vue"; // 导入 UserProfile 组件

const routes = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'Home',
                component: Home,
            },
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

    // 如果路由需要认证但用户未登录
    if (to.meta.requiresAuth && !token) {
        // 重定向到登录页面，并保存原始路径
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
    else {
        next(); // 继续导航
    }
});

export default router;