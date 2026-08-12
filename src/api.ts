import type {RawAxiosRequestHeaders} from "axios";
import axios, {AxiosError} from "axios";
import router from "@/router";

// 后端 API 的基础 URL
const baseURL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL || '/api')
    : '/api';

// 创建 axios 实例（withCredentials 用于携带 Cookie 会话凭据）
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    timeout: 10000,
    withCredentials: true
});

// 响应拦截器：处理 401（Cookie 会话失效）
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

// ============================================================
// 统一错误响应格式
// ============================================================

/** 后端统一错误响应体 */
export interface ApiError {
    /** 机器可读的错误码（大驼峰命名） */
    error: string
    /** 人类可读的错误描述（中文） */
    errorMessage: string
    /** 可选：错误原因 */
    cause?: string
}

// ============================================================
// 根目录 GET /
// ============================================================

export interface ServerFeature {
    /** 是否开启邮箱注册 */
    email_register: boolean
    /** 是否开启邮箱登录 */
    email_login: boolean
    /** 是否开启 OIDC */
    find_oidc: boolean
    /** 是否开启人机验证 */
    find_captcha: boolean
}

export interface ServerStatus {
    /** normal 则正常提供服务；maintenance 则前端停止服务并展示维护页 */
    status: 'normal' | 'maintenance'
    feature: ServerFeature
    motd: string
}

/**
 * 获取服务器状态与功能开关
 * GET /
 */
export const getServerStatus = async (): Promise<ServerStatus> => {
    const response = await api.get<ServerStatus>('/');
    return response.data;
};

// ============================================================
// Yggdrasil 元数据 GET /yggdrasil/
// ============================================================

/** Yggdrasil meta 元数据（内容任意，以下为可选已知字段） */
export interface ServerMeta {
    serverName?: string
    implementationName?: string
    implementationVersion?: string
    links?: {
        homepage?: string
        register?: string
    }

    [key: string]: unknown
}

export interface YggdrasilMetaResponse {
    meta: ServerMeta
    /** 材质域名白名单 */
    skinDomains: string[]
    /** PEM 格式公钥 */
    signaturePublickey: string
}

/**
 * 获取 Yggdrasil API 元数据
 * GET /yggdrasil/
 */
export const getYggdrasilMeta = async (): Promise<YggdrasilMetaResponse> => {
    const response = await api.get<YggdrasilMetaResponse>('/yggdrasil/');
    return response.data;
};

/**
 * 获取服务器元数据（meta 部分）
 * GET /yggdrasil/
 */
export const getServerMeta = async (): Promise<ServerMeta | null> => {
    const data = await getYggdrasilMeta();
    return data?.meta ?? null;
};

// ============================================================
// 人机验证 /captcha
// ============================================================

export interface CaptchaActionConfig {
    /** 该动作是否需要人机验证 */
    enabled: boolean
    /** always：每次都需要；onDemand：平时不需要，后端按风控临时索要 */
    mode: 'always' | 'onDemand'
}

export interface CaptchaConfig {
    /** 全局开关。为 false 时其余字段可为 null 或省略 */
    enabled: boolean
    /** 配置版本号，每次开关变更递增 */
    configVersion: number
    provider?: 'turnstile' | 'hcaptcha' | 'recaptcha' | 'geetest'
    siteKey?: string
    scriptUrl?: string
    options?: Record<string, unknown> | null
    actions: Record<string, CaptchaActionConfig>
}

/**
 * 获取人机验证配置
 * GET /captcha/config
 */
export const getCaptchaConfig = async (): Promise<CaptchaConfig> => {
    const response = await api.get<CaptchaConfig>('/captcha/config');
    return response.data;
};

/**
 * 人机验证请求头。
 * 通过请求头携带 token，作用于注册、登录、发验证码等受保护端点。
 * 键：X-Captcha-Token（该动作开关开启时必填）、X-Captcha-Provider、X-Captcha-Action、X-Captcha-Config-Version
 */
export type CaptchaHeaders = RawAxiosRequestHeaders

// ============================================================
// 验证码 /email/code
// ============================================================

/**
 * 发送注册验证码（人机验证）
 * POST /email/code/register
 */
export const sendRegisterEmailCode = async (
    email: string,
    captchaHeaders?: CaptchaHeaders
): Promise<void> => {
    await api.post('/email/code/register', {email}, {headers: captchaHeaders});
};

/**
 * 发送登录验证码（人机验证）
 * POST /email/code/login
 */
export const sendLoginEmailCode = async (
    email: string,
    captchaHeaders?: CaptchaHeaders
): Promise<void> => {
    await api.post('/email/code/login', {email}, {headers: captchaHeaders});
};

/**
 * 发送修改密码验证码（Cookie 身份验证）
 * POST /email/code/change-password
 */
export const sendChangePasswordEmailCode = async (): Promise<void> => {
    await api.post('/email/code/change-password');
};

/**
 * 发送设置/更改邮箱验证码（Cookie 身份验证）
 * POST /email/code/set-email
 */
export const sendSetEmailCode = async (email: string): Promise<void> => {
    await api.post('/email/code/set-email', {email});
};

// ============================================================
// 用户端点 /user
// ============================================================

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
    const response = await api.post<RegisterResponse>(
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
    await api.post('/user/login', body, {headers: captchaHeaders});
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
    const response = await api.get<UserInfo>('/user/me');
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
    await api.post('/user/change-password', body);
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
    const response = await api.put<SetEmailResponse>('/user/email', {email, emailCode});
    return response.data;
};

/**
 * 登出（Cookie 身份验证）
 * POST /user/logout
 * 成功后返回 204，sid 被设为过期
 */
export const userLogout = async (): Promise<void> => {
    await api.post('/user/logout');
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
    const response = await api.get<OidcProvidersResponse>('/user/oidc/providers');
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
    const response = await api.delete<UnbindOidcResponse>(`/user/oidc/${providerId}`);
    return response.data;
};

// ============================================================
// 管理端点 /admin（Cookie 身份验证，要求 role = admin）
// ============================================================

/** 用户角色 */
export type UserRole = 'admin' | 'moderator' | 'user'
/** 用户状态（不可直接写入，由封禁记录投影） */
export type UserStatus = 'active' | 'banned'

export interface AdminUser {
    id: string
    displayName: string
    email: string
    role: UserRole
    status: UserStatus
    /** null 表示永久封禁；status 非 banned 时为 null */
    bannedUntil: string | null
    /** 从未登录为 null */
    lastLoginAt: string | null
    createdAt: string
}

export interface AdminUserListParams {
    /** 页码，从 1 开始，默认 1 */
    page?: number
    /** 每页条数，默认 20，上限 100 */
    pageSize?: number
    /** 邮箱精确匹配 或 用户名前缀匹配 */
    q?: string
    role?: UserRole
    status?: UserStatus
    /** 注册时间下界，ISO 8601 UTC */
    registeredAfter?: string
    /** 注册时间上界，ISO 8601 UTC */
    registeredBefore?: string
    /** 仅接受 createdAt、lastLoginAt，默认 createdAt */
    sortBy?: 'createdAt' | 'lastLoginAt'
    /** asc / desc，默认 desc */
    order?: 'asc' | 'desc'
}

export interface AdminUserListResponse {
    total: number
    page: number
    pageSize: number
    users: AdminUser[]
}

/**
 * 获取用户列表（管理员）
 * GET /admin/users
 */
export const getAdminUsers = async (
    params: AdminUserListParams
): Promise<AdminUserListResponse> => {
    const response = await api.get<AdminUserListResponse>('/admin/users', {params});
    return response.data;
};

export interface OidcBinding {
    providerId: string
    boundAt: string
}

export interface AdminUserDetail extends AdminUser {
    lastLoginIp: string | null
    registerIp: string | null
    oidcBindings: OidcBinding[]
}

/**
 * 获取用户详情（管理员）
 * GET /admin/users/{userId}
 */
export const getAdminUser = async (userId: string): Promise<AdminUserDetail> => {
    const response = await api.get<AdminUserDetail>(`/admin/users/${userId}`);
    return response.data;
};

export interface BanRecord {
    id: string
    userId: string
    /** 解封时间，null 表示永久封禁 */
    bannedUntil: string | null
    reason?: string
    operatorId: string
    createdAt: string
}

export interface CreateBanRequest {
    /** 解封时间，null 表示永久封禁 */
    bannedUntil: string | null
    /** 可选 */
    reason?: string
}

/**
 * 创建封禁（管理员）
 * POST /admin/bans/{userId}
 */
export const createBan = async (
    userId: string,
    body: CreateBanRequest
): Promise<BanRecord> => {
    const response = await api.post<BanRecord>(`/admin/bans/${userId}`, body);
    return response.data;
};

export interface BanListParams {
    /** 仅返回生效中的记录 */
    active?: boolean
    page?: number
    pageSize?: number
}

export interface BanListResponse {
    banlists: BanRecord[]
    page: number
    pageSize: number
    total: number
}

/**
 * 查询封禁记录列表（管理员，按 createdAt 倒序）
 * GET /admin/bans
 */
export const getBans = async (params: BanListParams): Promise<BanListResponse> => {
    const response = await api.get<BanListResponse>('/admin/bans', {params});
    return response.data;
};

/**
 * 查询指定用户是否被封禁（管理员）
 * GET /admin/bans/{userId}
 */
export const getBan = async (userId: string): Promise<BanRecord> => {
    const response = await api.get<BanRecord>(`/admin/bans/${userId}`);
    return response.data;
};

/**
 * 物理删除封禁记录（解封，管理员）
 * DELETE /admin/bans/{userId}
 */
export const deleteBan = async (userId: string, reason?: string): Promise<void> => {
    await api.delete(`/admin/bans/${userId}`, {data: reason ? {reason} : undefined});
};

export interface SessionRevocationResponse {
    userId: string
    revokedCount: number
    createdAt: string
}

/**
 * 强制下线，清除指定用户的全部会话（管理员）
 * POST /admin/session-revocations/{userId}
 */
export const revokeUserSessions = async (
    userId: string,
    reason?: string
): Promise<SessionRevocationResponse> => {
    const response = await api.post<SessionRevocationResponse>(
        `/admin/session-revocations/${userId}`,
        reason ? {reason} : {}
    );
    return response.data;
};

export interface RoleGrantResponse {
    id: string
    userId: string
    previousRole: UserRole
    role: UserRole
    operatorId: string
    createdAt: string
}

/**
 * 变更用户角色（管理员，下个版本废弃）
 * POST /admin/role-grants/{userId}
 */
export const grantUserRole = async (
    userId: string,
    role: UserRole,
    reason?: string
): Promise<RoleGrantResponse> => {
    const response = await api.post<RoleGrantResponse>(
        `/admin/role-grants/${userId}`,
        {role, ...(reason ? {reason} : {})}
    );
    return response.data;
};

export interface AuditLogParams {
    operatorId?: string
    targetUserId?: string
    /** 动作，支持前缀匹配（如 user.） */
    action?: string
    /** success / denied */
    result?: 'success' | 'denied'
    /** 时间下界，ISO 8601 UTC */
    from?: string
    /** 时间上界，ISO 8601 UTC */
    to?: string
    page?: number
    pageSize?: number
}

export interface AuditLogEntry {
    id: string
    operatorId: string
    action: string
    targetUserId: string
    result: 'success' | 'denied'
    /** 操作者 IP */
    ip: string
    /** 动作相关参数，结构随 action 而异 */
    payload?: Record<string, unknown>
    createdAt: string
}

export interface AuditLogListResponse {
    items: AuditLogEntry[]
    page: number
    pageSize: number
    total: number
}

/**
 * 查询审计日志（管理员，只读，按 createdAt 倒序）
 * GET /admin/audit-logs
 */
export const getAuditLogs = async (
    params: AuditLogParams
): Promise<AuditLogListResponse> => {
    const response = await api.get<AuditLogListResponse>('/admin/audit-logs', {params});
    return response.data;
};

// ============================================================
// Yggdrasil 角色信息（共用类型）
// ============================================================

export interface ProfileProperty {
    name: string
    value: string
    /** 数字签名（仅特定情况包含） */
    signature?: string
}

export interface GameProfile {
    /** 角色 UUID（无符号） */
    id: string
    name: string
    properties?: ProfileProperty[]
}

// ============================================================
// Yggdrasil 材质与扩展 API /yggdrasil/api
// ============================================================

/**
 * 按名称批量查询角色
 * POST /yggdrasil/api/profiles/minecraft
 */
export const batchQueryProfiles = async (names: string[]): Promise<GameProfile[]> => {
    const response = await api.post<GameProfile[]>('/yggdrasil/api/profiles/minecraft', names);
    return response.data;
};

/**
 * 上传材质（需要 Yggdrasil Bearer accessToken）
 * PUT /yggdrasil/api/user/profile/{uuid}/{textureType}
 * 成功返回 204
 */
export const uploadTextureAPI = async (
    uuid: string,
    textureType: 'skin' | 'cape',
    file: File,
    model: 'slim' | '' = '',
    accessToken: string
): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    if (model) {
        formData.append('model', model);
    }
    await api.put(`/yggdrasil/api/user/profile/${uuid}/${textureType}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

/**
 * 清除材质（需要 Yggdrasil Bearer accessToken）
 * DELETE /yggdrasil/api/user/profile/{uuid}/{textureType}
 * 成功返回 204
 */
export const deleteTextureAPI = async (
    uuid: string,
    textureType: 'skin' | 'cape',
    accessToken: string
): Promise<void> => {
    await api.delete(`/yggdrasil/api/user/profile/${uuid}/${textureType}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
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
    const response = await api.post<LauncherSessionCredential>(
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
    const response = await api.get<LauncherSessionListResponse>('/yggdrasil/launcher-sessions');
    return response.data;
};

/**
 * 获取单个启动器会话信息（Cookie 身份验证）
 * GET /yggdrasil/launcher-sessions/{launcherSessionID}
 */
export const getLauncherSession = async (
    launcherSessionID: string
): Promise<LauncherSessionCredential> => {
    const response = await api.get<LauncherSessionCredential>(
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
    await api.delete(`/yggdrasil/launcher-sessions/${launcherSessionID}`);
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
    const response = await api.post<YggdrasilProfile>('/yggdrasil/profiles', {name});
    return response.data;
};

/**
 * 获取当前账号的角色列表（Cookie 身份验证）
 * GET /yggdrasil/profiles
 */
export const getYggdrasilProfiles = async (): Promise<YggdrasilProfileListResponse> => {
    const response = await api.get<YggdrasilProfileListResponse>('/yggdrasil/profiles');
    return response.data;
};

/**
 * 删除角色（Cookie 身份验证）
 * DELETE /yggdrasil/profiles/{id}
 * 成功返回 204
 */
export const deleteYggdrasilProfile = async (id: string): Promise<void> => {
    await api.delete(`/yggdrasil/profiles/${id}`);
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
    const response = await api.post<YggdrasilAuthenticateResponse>(
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
    const response = await api.post<YggdrasilRefreshResponse>(
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
    await api.post('/yggdrasil/authserver/validate', {accessToken, clientToken});
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
    await api.post('/yggdrasil/authserver/invalidate', {accessToken, clientToken});
};

/**
 * 登出（吊销用户的所有令牌）
 * POST /yggdrasil/authserver/signout
 */
export const yggdrasilSignout = async (
    username: string,
    password: string
): Promise<void> => {
    await api.post('/yggdrasil/authserver/signout', {username, password});
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
    const response = await api.get<GameProfile>(
        `/yggdrasil/sessionserver/session/minecraft/profile/${uuid}`,
        {params: {unsigned}}
    );
    return response.data;
};

export default api;
