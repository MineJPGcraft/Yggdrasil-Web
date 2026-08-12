import http from './http';
import type {ServerMeta, YggdrasilMetaResponse} from './types';

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
    const response = await http.get<ServerStatus>('/');
    return response.data;
};

/**
 * 获取 Yggdrasil API 元数据
 * GET /yggdrasil/
 */
export const getYggdrasilMeta = async (): Promise<YggdrasilMetaResponse> => {
    const response = await http.get<YggdrasilMetaResponse>('/yggdrasil/');
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
