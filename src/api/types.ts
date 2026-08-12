import type {RawAxiosRequestHeaders} from "axios";

/** 后端统一错误响应体 */
export interface ApiError {
    /** 机器可读的错误码（大驼峰命名） */
    error: string
    /** 人类可读的错误描述（中文） */
    errorMessage: string
    /** 可选：错误原因 */
    cause?: string
}

/**
 * 人机验证请求头。
 * 通过请求头携带 token，作用于注册、登录、发验证码等受保护端点。
 * 键：X-Captcha-Token（该动作开关开启时必填）、X-Captcha-Provider、X-Captcha-Action、X-Captcha-Config-Version
 */
export type CaptchaHeaders = RawAxiosRequestHeaders

/** 角色属性项 */
export interface ProfileProperty {
    name: string
    value: string
    /** 数字签名（仅特定情况包含） */
    signature?: string
}

/** 角色（Profile）信息 */
export interface GameProfile {
    /** 角色 UUID（无符号） */
    id: string
    name: string
    properties?: ProfileProperty[]
}

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

/** Yggdrasil 元数据响应 */
export interface YggdrasilMetaResponse {
    meta: ServerMeta
    /** 材质域名白名单 */
    skinDomains: string[]
    /** PEM 格式公钥 */
    signaturePublickey: string
}
