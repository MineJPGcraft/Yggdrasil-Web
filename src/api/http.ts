import axios, {AxiosError} from "axios";

// 后端 API 的基础 URL
export const baseURL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL || '/api')
    : '/api';

// 创建 axios 实例（withCredentials 用于携带 Cookie 会话凭据）
const http = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    timeout: 10000,
    withCredentials: true
});

// 响应拦截器：处理 401（Cookie 会话失效）
http.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            // 动态导入以解除 http → router → ... → api 的静态循环依赖；
            // router 已在 main.ts 静态加载，此处可从模块缓存即时解析。
            import('@/router')
                .then(({default: router}) => router.push('/login'))
                .catch(() => {/* 忽略模块加载失败，不影响错误继续向上传播 */
                });
        }
        return Promise.reject(error);
    }
);

export default http;
