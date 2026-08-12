import http from './http';

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
    const response = await http.get<CaptchaConfig>('/captcha/config');
    return response.data;
};
