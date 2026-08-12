import http from './http';

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
    const response = await http.get<AdminUserListResponse>('/admin/users', {params});
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
    const response = await http.get<AdminUserDetail>(`/admin/users/${userId}`);
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
    const response = await http.post<BanRecord>(`/admin/bans/${userId}`, body);
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
    const response = await http.get<BanListResponse>('/admin/bans', {params});
    return response.data;
};

/**
 * 查询指定用户是否被封禁（管理员）
 * GET /admin/bans/{userId}
 */
export const getBan = async (userId: string): Promise<BanRecord> => {
    const response = await http.get<BanRecord>(`/admin/bans/${userId}`);
    return response.data;
};

/**
 * 物理删除封禁记录（解封，管理员）
 * DELETE /admin/bans/{userId}
 */
export const deleteBan = async (userId: string, reason?: string): Promise<void> => {
    await http.delete(`/admin/bans/${userId}`, {data: reason ? {reason} : undefined});
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
    const response = await http.post<SessionRevocationResponse>(
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
    const response = await http.post<RoleGrantResponse>(
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
    const response = await http.get<AuditLogListResponse>('/admin/audit-logs', {params});
    return response.data;
};
