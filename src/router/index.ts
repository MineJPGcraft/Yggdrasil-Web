import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import {buildTitle, setPageMeta} from '@/lib/seo';

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        /** 是否显示侧边栏布局（登录后的应用页面；Home 等公开页面不显示） */
        sidebar?: boolean
        /** 页面标题（SEO，用于 afterEach 动态设置 document.title） */
        title?: string
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                // 根路径：公开落地页（未登录访问；已登录由守卫跳转仪表盘）
                path: '',
                name: 'home',
                component: () => import('@/views/Home.vue'),
                meta: {title: '首页'}
            },
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: {requiresAuth: true, sidebar: true, title: '仪表盘'}
            },
            {
                path: 'role-management',
                name: 'role-management',
                component: () => import('@/views/RoleManagement.vue'),
                meta: {requiresAuth: true, sidebar: true, title: '角色管理'}
            },
            {
                path: 'launcher-sessions',
                name: 'launcher-sessions',
                component: () => import('@/views/LauncherSessions.vue'),
                meta: {requiresAuth: true, sidebar: true, title: '启动器会话'}
            },
            {
                path: 'profile',
                name: 'user-profile',
                component: () => import('@/views/UserProfile.vue'),
                meta: {requiresAuth: true, sidebar: true, title: '个人信息'}
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/Login.vue'),
        meta: {title: '登录'}
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/register.vue'),
        meta: {title: '注册'}
    },
    {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('@/views/ResetPassword.vue'),
        meta: {title: '重置密码'}
    },
    {
        // OIDC 回调页：provider 授权完成后由后端 302 跳回
        path: '/oidc/callback',
        name: 'oidc-callback',
        component: () => import('@/views/OidcCallback.vue'),
        meta: {title: 'OIDC 回调'}
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
        next({name: 'dashboard'});
    }
    // 情况1.5: 已登录用户访问首页，跳转仪表盘
    else if (to.name === 'home' && isAuthenticated) {
        next({name: 'dashboard'});
    }
    // 情况2: 路由需要认证，但用户未登录
    else if (to.meta.requiresAuth && !isAuthenticated) {
        next({name: 'login', query: {redirect: to.fullPath}});
    }
    // 其他情况: 继续导航
    else {
        next();
    }
});

// 每次路由切换后根据 meta.title 更新页面标题（SEO）
router.afterEach((to) => {
    if (to.meta.title) {
        setPageMeta(buildTitle(to.meta.title));
    }
});

export default router;
