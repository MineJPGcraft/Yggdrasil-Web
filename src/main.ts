import {createApp} from 'vue'
import type {AxiosStatic} from 'axios'
import axios from 'axios'
import './style.css'
import './themes/index.css'
import App from './App.vue'
import router from './router';
import {loadSiteConfig} from './lib/siteConfig';

declare module 'vue' {
    interface ComponentCustomProperties {
        $axios: AxiosStatic
    }
}

// 在挂载应用前加载站点配置（标题/描述/首页/页脚等），失败时使用默认配置。
// 避免顶层 await（构建目标不支持），故放入 bootstrap。
async function bootstrap() {
    await loadSiteConfig();

    // GitHub Pages 等纯静态托管下，刷新/直链深层路由会先命中 404.html。
    // 404.html 将原始地址暂存于 sessionStorage 并跳回站点根，这里恢复真实路由。
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
        sessionStorage.removeItem('redirect');
        // 站点根路径（如 /repo/），去掉末尾斜杠得到 base（如 /repo）
        const basePath = window.location.pathname.replace(/\/$/, '');
        const path = redirect.slice(window.location.origin.length);
        const route = path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
        router.replace(route);
    }

    const app = createApp(App);
    app.use(router);
    app.config.globalProperties.$axios = axios;
    app.mount('#app');
}

void bootstrap();
