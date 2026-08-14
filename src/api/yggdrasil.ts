import http from './http';
import type {GameProfile, ProfileProperty} from './types';

// ============================================================
// Yggdrasil 材质与扩展 API /yggdrasil/api
// ============================================================

/**
 * 按名称批量查询角色
 * POST /yggdrasil/api/profiles/minecraft
 */
export const batchQueryProfiles = async (names: string[]): Promise<GameProfile[]> => {
    const response = await http.post<GameProfile[]>('/yggdrasil/api/profiles/minecraft', names);
    return response.data;
};

/**
 * 上传材质（Cookie 身份验证，前端专用端点）
 * PUT /yggdrasil/profiles/{uuid}/{textureType}
 * 成功返回 204
 */
export const uploadTextureAPI = async (
    uuid: string,
    textureType: 'skin' | 'cape',
    file: File,
    model: 'slim' | '' = ''
): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    if (model) {
        formData.append('model', model);
    }
    await http.put(`/yggdrasil/profiles/${uuid}/${textureType}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/**
 * 清除材质（Cookie 身份验证，前端专用端点）
 * DELETE /yggdrasil/profiles/{uuid}/{textureType}
 * 成功返回 204
 */
export const deleteTextureAPI = async (
    uuid: string,
    textureType: 'skin' | 'cape'
): Promise<void> => {
    await http.delete(`/yggdrasil/profiles/${uuid}/${textureType}`);
};

// ============================================================
// Yggdrasil 启动器会话 /yggdrasil/launcher-sessions（Cookie 身份验证）
// ============================================================

export interface LauncherSessionCredential {
    id: string
    username: string
    password: string
    selectedProfile: GameProfile
    properties: ProfileProperty[]
}

export interface LauncherSessionSummary {
    id: string
    username: string
}

export interface LauncherSessionListResponse {
    total: number
    launcherSessions: LauncherSessionSummary[]
}

/**
 * 创建启动器会话（Cookie 身份验证）
 * POST /yggdrasil/launcher-sessions
 */
export const createLauncherSession = async (
    selectedProfileID: string
): Promise<LauncherSessionCredential> => {
    const response = await http.post<LauncherSessionCredential>(
        '/yggdrasil/launcher-sessions',
        {selectedProfileID}
    );
    return response.data;
};

/**
 * 获取启动器会话列表（Cookie 身份验证）
 * GET /yggdrasil/launcher-sessions
 */
export const getLauncherSessions = async (): Promise<LauncherSessionListResponse> => {
    const response = await http.get<LauncherSessionListResponse>('/yggdrasil/launcher-sessions');
    return response.data;
};

/**
 * 获取单个启动器会话信息（Cookie 身份验证）
 * GET /yggdrasil/launcher-sessions/{launcherSessionID}
 */
export const getLauncherSession = async (
    launcherSessionID: string
): Promise<LauncherSessionCredential> => {
    const response = await http.get<LauncherSessionCredential>(
        `/yggdrasil/launcher-sessions/${launcherSessionID}`
    );
    return response.data;
};

/**
 * 删除启动器会话（Cookie 身份验证）
 * DELETE /yggdrasil/launcher-sessions/{launcherSessionID}
 * 成功返回 204
 */
export const deleteLauncherSession = async (launcherSessionID: string): Promise<void> => {
    await http.delete(`/yggdrasil/launcher-sessions/${launcherSessionID}`);
};

// ============================================================
// Yggdrasil 角色 /yggdrasil/profiles（Cookie 身份验证）
// ============================================================

export interface YggdrasilProfile {
    id: string
    name: string
}

export interface YggdrasilProfileListResponse {
    total: number
    profiles: YggdrasilProfile[]
}

/**
 * 创建角色（Cookie 身份验证）
 * POST /yggdrasil/profiles
 */
export const createYggdrasilProfile = async (
    name: string
): Promise<YggdrasilProfile> => {
    const response = await http.post<YggdrasilProfile>('/yggdrasil/profiles', {name});
    return response.data;
};

/**
 * 获取当前账号的角色列表（Cookie 身份验证）
 * GET /yggdrasil/profiles
 */
export const getYggdrasilProfiles = async (): Promise<YggdrasilProfileListResponse> => {
    const response = await http.get<YggdrasilProfileListResponse>('/yggdrasil/profiles');
    return response.data;
};

/**
 * 删除角色（Cookie 身份验证）
 * DELETE /yggdrasil/profiles/{id}
 * 成功返回 204
 */
export const deleteYggdrasilProfile = async (id: string): Promise<void> => {
    await http.delete(`/yggdrasil/profiles/${id}`);
};

// ============================================================
// Yggdrasil Authserver /yggdrasil/authserver（供 Minecraft 启动器使用）
// ============================================================

export interface YggdrasilAuthenticateRequest {
    /** 启动器会话登录名 */
    username: string
    /** 启动器会话认证凭据 */
    password: string
    clientToken?: string
    /** 是否在响应中包含用户信息，默认 false */
    requestUser?: boolean
    agent?: { name: string; version: number }
}

export interface YggdrasilUser {
    id: string
    properties: ProfileProperty[]
}

export interface YggdrasilAuthenticateResponse {
    accessToken: string
    clientToken: string
    availableProfiles: GameProfile[]
    selectedProfile: GameProfile
    user?: YggdrasilUser
}

/**
 * Yggdrasil 登录（使用启动器会话凭据）
 * POST /yggdrasil/authserver/authenticate
 */
export const yggdrasilAuthenticate = async (
    body: YggdrasilAuthenticateRequest
): Promise<YggdrasilAuthenticateResponse> => {
    const response = await http.post<YggdrasilAuthenticateResponse>(
        '/yggdrasil/authserver/authenticate',
        {agent: {name: 'Minecraft', version: 1}, ...body}
    );
    return response.data;
};

export interface YggdrasilRefreshResponse {
    accessToken: string
    clientToken: string
    selectedProfile: GameProfile
    user?: YggdrasilUser
}

/**
 * Yggdrasil 刷新令牌（新令牌绑定的角色与原令牌相同）
 * POST /yggdrasil/authserver/refresh
 */
export const yggdrasilRefresh = async (
    accessToken: string,
    clientToken?: string,
    requestUser?: boolean
): Promise<YggdrasilRefreshResponse> => {
    const response = await http.post<YggdrasilRefreshResponse>(
        '/yggdrasil/authserver/refresh',
        {accessToken, clientToken, requestUser}
    );
    return response.data;
};

/**
 * 验证 Yggdrasil 令牌是否有效
 * POST /yggdrasil/authserver/validate
 * 有效返回 204，否则按异常处理
 */
export const yggdrasilValidate = async (
    accessToken: string,
    clientToken?: string
): Promise<void> => {
    await http.post('/yggdrasil/authserver/validate', {accessToken, clientToken});
};

/**
 * 吊销给定 Yggdrasil 令牌
 * POST /yggdrasil/authserver/invalidate
 * 无论是否成功均返回 204
 */
export const yggdrasilInvalidate = async (
    accessToken: string,
    clientToken?: string
): Promise<void> => {
    await http.post('/yggdrasil/authserver/invalidate', {accessToken, clientToken});
};

/**
 * 登出（吊销用户的所有令牌）
 * POST /yggdrasil/authserver/signout
 */
export const yggdrasilSignout = async (
    username: string,
    password: string
): Promise<void> => {
    await http.post('/yggdrasil/authserver/signout', {username, password});
};

// ============================================================
// Yggdrasil Sessionserver /yggdrasil/sessionserver（前端仅需查询角色属性）
// ============================================================

/**
 * 查询指定 UUID 角色的完整属性信息
 * GET /yggdrasil/sessionserver/session/minecraft/profile/{uuid}
 * @param unsigned true=不包含数字签名（默认），false=包含数字签名
 * @returns 角色不存在时返回 204 空响应，会抛出错误
 */
export const getProfileDetailsAPI = async (
    uuid: string,
    unsigned = true
): Promise<GameProfile> => {
    const response = await http.get<GameProfile>(
        `/yggdrasil/sessionserver/session/minecraft/profile/${uuid}`,
        {params: {unsigned}}
    );
    return response.data;
};
