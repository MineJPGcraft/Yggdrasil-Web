import axios from "axios";
import logger from "../public/util/logger.js";
import router from "@/router/index.js";

// 后端 API 的基础 URL
const baseURL = '/api';

// 创建 axios 实例
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    timeout: 5000
});

// 在请求拦截器中添加 Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 在响应拦截器中处理 Token 过期等情况
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            // Token 过期或无效，清除 Token 并重定向到登录页面
            localStorage.removeItem('token');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);


export const loginAPI = async (username, password) => {
    const res = await api.post(
        '/authserver/authenticate',
        {
            username: username,
            password: password,
            requestUser: true
        }
    );
    // 根据 Yggdrasil 规范，成功的响应直接返回 accessToken，不包含 code 字段
    localStorage.setItem("accessToken", res.data.accessToken);
    return res; // 返回响应，以便上层调用者可以处理，例如获取用户信息
};

// 注册 API
export const register = async (userData) => {
    try {
        const response = await api.post('/extern/register/user', userData);
        return response.data;
    } catch (error) {
        // 将错误重新抛出，以便调用方能够处理
        throw error;
    }
};

/**
 * 注册角色 API (已废弃 - 客户端应避免使用)
 * @param {string} profileName - 角色名
 * @param {string} username - 要绑定的用户名 (通常是邮箱)
 * @param {string} password - 要绑定的用户密码 (如果后端配置 profile-strict 为 true 则必须)
 * @returns {Promise<any>}
 */
export const registerProfileAPI = async (profileName, username, password = '') => {
    try {
        const requestBody = {
            profileName: profileName,
            username: username,
        };
        // 只有当 password 非空时才添加到请求体
        if (password) {
            requestBody.password = password;
        }

        const response = await api.post('/extern/register/profile', requestBody);
        return response.data;
    } catch (error) {
        console.error('注册角色失败:', error);
        throw error; // 将错误重新抛出
    }
};
