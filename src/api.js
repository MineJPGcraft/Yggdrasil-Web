import axios from "axios";
import logger from "../public/util/logger.js";
import router from "@/router/index.js";

// 后端 API 的基础 URL
const baseURL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL || '/api')
    : '/api';

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
        const token = localStorage.getItem('accessToken'); // 修正：从 localStorage 获取 'accessToken'
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
            localStorage.removeItem('accessToken');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);


export const loginAPI = async (username, password) => {
    console.log('--- 调用 loginAPI ---');
    console.log('请求登录的用户名:', username);
    // 注意: 密码不应该在生产环境中打印，这里仅为调试目的。
    // console.log('请求登录的密码:', password); 

    try {
        const res = await api.post(
            '/authserver/authenticate',
            {
                username: username,
                password: password,
                requestUser: true
            }
        );
        console.log('登录API响应数据:', res.data); // 添加日志
        console.log('登录API响应中的可用角色:', res.data.availableProfiles); // 添加日志
        
        // 根据 Yggdrasil 规范，成功的响应直接返回 accessToken，不包含 code 字段
        localStorage.setItem("accessToken", res.data.accessToken);
        // 如果响应中包含 availableProfiles，也将其存储起来
        if (res.data.availableProfiles) {
            localStorage.setItem("availableProfiles", JSON.stringify(res.data.availableProfiles));
        } else {
            console.warn('登录API响应中未包含 availableProfiles 字段，或其为空。');
            localStorage.removeItem("availableProfiles"); // 确保没有旧的或无效的数据
        }
        console.log('--- loginAPI 调用结束 (成功) ---');
        return res; // 返回响应，以便上层调用者可以处理，例如获取用户信息
    } catch (error) {
        console.error('--- loginAPI 调用失败 ---', error); // 详细记录错误
        localStorage.removeItem("accessToken"); // 清除可能无效的令牌
        localStorage.removeItem("availableProfiles"); // 清除可能无效的角色信息
        throw error; // 重新抛出错误以便上层处理
    }
};


/**
 * 模拟头像上传 API (后端功能待实现)
 * @param {File} file - 头像文件
 * @returns {Promise<string>} - 模拟上传成功的消息
 */
export const uploadAvatarAPI = async (file) => {
    return new Promise(resolve => {
        console.log('模拟头像上传:', file.name, file.type);
        setTimeout(() => {
            resolve('头像上传成功 (模拟)。');
        }, 1500); // 模拟网络延迟
    });
};

/**
 * 上传皮肤 API
 * @param {string} uuid - 角色的 UUID
 * @param {string} textureType - 材质类型 (e.g., 'skin')
 * @param {File} file - 皮肤文件 (PNG格式)
 * @param {string} model - 皮肤模型 ('slim' 或 '')
 * @returns {Promise<any>}
 */
export const uploadSkinAPI = async (uuid, textureType, file, model = '') => {
    try {
        // Token now handled by interceptor, no need for explicit check here
        // if (!localStorage.getItem('accessToken')) {
        //     throw new Error('未检测到认证令牌，请重新登录。');
        // }

        const formData = new FormData();
        formData.append('file', file);
        if (model) {
            formData.append('model', model);
        }

        const response = await api.put(`/user/profile/${uuid}/${textureType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // 确保 Axios 发送正确的 Content-Type
            }
        });
        return response.data;
    } catch (error) {
        console.error(`上传皮肤失败:`, error);
        throw error;
    }
};

/**
 * 获取指定 UUID 角色的详细信息 (包含属性，如皮肤)
 * @param {string} uuid - 角色的 UUID
 * @returns {Promise<any>} - 包含角色详细信息的 Promise
 */
export const getProfileDetailsAPI = async (uuid) => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('未检测到认证令牌，请重新登录。');
        }
        const response = await api.get(`/sessionserver/session/minecraft/profile/${uuid}?unsigned=true`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`获取角色 ${uuid} 详情失败:`, error);
        throw error;
    }
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

export const getServerMeta = async () => {
    try {
        const response = await api.get('/');
        return response.data?.meta || null;
    } catch (error) {
        console.error('获取服务器元数据失败:', error);
        return null;
    }
};
