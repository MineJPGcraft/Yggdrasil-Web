import http, {baseURL} from './http';
import type {CaptchaHeaders} from './types';

export interface RegisterResponse {
    /** 创建时间，ISO 8601 UTC */
    createdAt: string
}

/**
 * 使用邮箱注册账号（人机验证）
 * POST /user/register
 */
export const registerUser = async (
    email: string,
    password: string,
    emailCode: string,
    displayName: string,
    captchaHeaders?: CaptchaHeaders
): Promise<RegisterResponse> => {
    const response = await http.post<RegisterResponse>(
        '/user/register',
        {email, password, emailCode, displayName},
        {headers: captchaHeaders}
    );
    return response.data;
};

export interface UserLoginByPassword {
    email: string
    password: string
}

export interface UserLoginByEmailCode {
    email: string
    emailCode: string
}

/**
 * 使用密码或邮箱验证码登录（Cookie 会话，人机验证）
 * POST /user/login
 * 成功后后端通过 Set-Cookie 下发 sid，无响应体
 */
export const userLoginAPI = async (
    body: UserLoginByPassword | UserLoginByEmailCode,
    captchaHeaders?: CaptchaHeaders
): Promise<void> => {
    await http.post('/user/login', body, {headers: captchaHeaders});
};

export interface UserInfo {
    userId: string
    /** 取值参考 admin 数据模型：admin / moderator / user */
    role: string
    displayName: string
    /** 绑定的邮箱，可能为空字符串 */
    email: string
    /** 是否已设置密码 */
    hasPassword: boolean
    /** 内容为 providerID，可能为空 */
    bindingOIDC: string[]
}

/**
 * 获取当前登录用户信息（Cookie 身份验证）
 * GET /user/me
 */
export const getUserInfo = async (): Promise<UserInfo> => {
    const response = await http.get<UserInfo>('/user/me');
    return response.data;
};

export interface ChangePasswordByOldPassword {
    oldPassword: string
    newPassword: string
}

export interface ChangePasswordByEmailCode {
    emailCode: string
    newPassword: string
}

/**
 * 修改密码（Cookie 身份验证）
 * POST /user/change-password
 * 成功后返回 204，清除该用户所有 session
 */
export const changePassword = async (
    body: ChangePasswordByOldPassword | ChangePasswordByEmailCode
): Promise<void> => {
    await http.post('/user/change-password', body);
};

export interface SetEmailResponse {
    email: string
}

/**
 * 设置或更改绑定邮箱（Cookie 身份验证）
 * PUT /user/email
 */
export const setUserEmail = async (
    email: string,
    emailCode: string
): Promise<SetEmailResponse> => {
    const response = await http.put<SetEmailResponse>('/user/email', {email, emailCode});
    return response.data;
};

/**
 * 登出（Cookie 身份验证）
 * POST /user/logout
 * 成功后返回 204，sid 被设为过期
 */
export const userLogout = async (): Promise<void> => {
    await http.post('/user/logout');
};

// ============================================================
// OIDC /user/oidc
// ============================================================

export interface OidcProvider {
    providerId: string
    /** 用于按钮展示的名称，可为 null */
    displayName: string | null
    /** 图标地址，可为 null */
    iconUrl: string | null
}

export interface OidcProvidersResponse {
    /** 是否允许 OIDC */
    enabled: boolean
    providers: OidcProvider[]
}

/**
 * 获取 OIDC 授权服务商列表
 * GET /user/oidc/providers
 */
export const getOidcProviders = async (): Promise<OidcProvidersResponse> => {
    const response = await http.get<OidcProvidersResponse>('/user/oidc/providers');
    return response.data;
};

/**
 * 获取 OIDC 登录授权 URL（302 跳转用）
 * GET /user/oidc/{providerId}/authorize
 */
export const getOidcAuthorizeUrl = (providerId: string, redirectUri?: string): string => {
    const url = new URL(`${baseURL}/user/oidc/${providerId}/authorize`, window.location.origin);
    if (redirectUri) {
        url.searchParams.set('redirect_uri', redirectUri);
    }
    return url.toString();
};

/**
 * 获取 OIDC 绑定授权 URL（302 跳转用，Cookie 身份验证）
 * GET /user/oidc/{providerId}/bind
 */
export const getOidcBindUrl = (providerId: string, redirectUri?: string): string => {
    const url = new URL(`${baseURL}/user/oidc/${providerId}/bind`, window.location.origin);
    if (redirectUri) {
        url.searchParams.set('redirect_uri', redirectUri);
    }
    return url.toString();
};

export interface UnbindOidcResponse {
    /** 解绑后剩余的绑定列表 */
    bindingOIDC: string[]
}

/**
 * 解绑指定 OIDC 服务商（Cookie 身份验证）
 * DELETE /user/oidc/{providerId}
 */
export const unbindOidc = async (providerId: string): Promise<UnbindOidcResponse> => {
    const response = await http.delete<UnbindOidcResponse>(`/user/oidc/${providerId}`);
    return response.data;
};
