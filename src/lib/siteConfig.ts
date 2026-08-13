/**
 * 站点配置（public/config.json）：
 * 标题、描述、关键词、Home 页面信息、页脚等均由此驱动，用户可直接编辑 JSON 文件，无需重新构建。
 */

/** 站内/站外链接：to 为站内路由，url 为外部链接（二选一） */
export interface SiteLink {
    text: string
    /** 站内路由路径（与 url 二选一） */
    to?: string
    /** 外部链接地址（与 to 二选一） */
    url?: string
}

/** SEO 元信息 */
export interface SeoConfig {
    /** 站点标题（document.title 后缀） */
    title: string
    /** 站点描述（meta description） */
    description: string
    /** 站点关键词（meta keywords） */
    keywords: string[]
}

/** 品牌信息 */
export interface BrandConfig {
    name: string
    tagline?: string
}

/** Home Hero 区 */
export interface HeroConfig {
    /** 徽标文案（可选） */
    badge?: string
    title: string
    /** 标题高亮部分（可选） */
    titleHighlight?: string
    description: string
    primaryCta: SiteLink
    secondaryCta: SiteLink
    /** 是否展示后端返回的 MOTD */
    showMotd?: boolean
}

/** 功能特性卡片 */
export interface FeatureItemConfig {
    label: string
    description: string
    /** 对应后端 GET / 的 feature 键（email_register / email_login / find_oidc / find_captcha），
     *  配置后以实时开关为准；缺省则用 enabled 决定是否高亮 */
    flag?: string
    /** 默认是否启用（仅在未配置 flag 时生效） */
    enabled?: boolean
}

export interface FeaturesConfig {
    /** 是否展示特性区 */
    enabled: boolean
    title: string
    description?: string
    items: FeatureItemConfig[]
}

/** 启动器接入指引区 */
export interface LauncherGuideConfig {
    enabled: boolean
    title: string
    description: string
    /** 是否展示 authlib-injector API 地址 */
    showApiLocation?: boolean
    /** 「访问验证服务器首页」链接文案 */
    homepageLinkText?: string
}

export interface HomeConfig {
    hero: HeroConfig
    features: FeaturesConfig
    launcherGuide: LauncherGuideConfig
}

/** 页脚链接列 */
export interface FooterColumnConfig {
    title: string
    links: SiteLink[]
}

export interface FooterConfig {
    /** 品牌区描述 */
    about: string
    /** 链接列 */
    columns: FooterColumnConfig[]
    /** 联系方式 */
    contact?: {
        title: string
        items: SiteLink[]
    }
    /** 友情链接 */
    friendLinks?: {
        title: string
        links: SiteLink[]
    }
    /** 底部栏 */
    bottom?: {
        copyright?: string
        /** 备案信息 */
        icp?: SiteLink
        poweredBy?: string
    }
}

export interface SiteConfig {
    seo: SeoConfig
    brand: BrandConfig
    home: HomeConfig
    footer: FooterConfig
}

/** 默认配置：config.json 缺失或部分字段缺失时的兜底 */
const defaultConfig: SiteConfig = {
    seo: {
        title: 'Yggdrasil Web',
        description: 'Yggdrasil Web 是一个支持 Minecraft 外置登录（Yggdrasil / authlib-injector）的身份验证前端，提供注册、登录、角色与皮肤管理、启动器会话等功能。',
        keywords: ['Minecraft', '外置登录', 'Yggdrasil', 'authlib-injector']
    },
    brand: {
        name: 'Yggdrasil Web',
        tagline: 'Minecraft 外置登录身份验证'
    },
    home: {
        hero: {
            badge: 'Minecraft 外置登录',
            title: 'Yggdrasil',
            titleHighlight: 'Web',
            description: 'Minecraft 外置登录（Yggdrasil / authlib-injector）身份验证前端，一站式管理您的账号、角色与皮肤。',
            primaryCta: {text: '立即注册', to: '/register'},
            secondaryCta: {text: '登录', to: '/login'},
            showMotd: true
        },
        features: {
            enabled: true,
            title: '平台功能',
            description: '一站式管理您的账号、角色与皮肤。',
            items: [
                {label: '邮箱注册', description: '使用邮箱注册新账号', flag: 'email_register'},
                {label: '邮箱登录', description: '支持密码与邮箱验证码登录', flag: 'email_login'},
                {label: 'OIDC 第三方登录', description: '支持 Google、GitHub 等授权登录', flag: 'find_oidc'},
                {label: '人机验证', description: '注册与登录安全防护', flag: 'find_captcha'}
            ]
        },
        launcherGuide: {
            enabled: true,
            title: '接入启动器',
            description: '在支持 authlib-injector 的启动器中，将下方的 API 地址填入「验证服务器（外置登录）」即可使用本服务器账号登录。',
            showApiLocation: true,
            homepageLinkText: '访问验证服务器首页'
        }
    },
    footer: {
        about: 'Yggdrasil Web 是一个支持 Minecraft 外置登录（Yggdrasil / authlib-injector）的身份验证前端，提供注册、登录、角色与皮肤管理、启动器会话等功能。',
        columns: [
            {
                title: '快速导航',
                links: [
                    {text: '首页', to: '/'},
                    {text: '注册', to: '/register'},
                    {text: '登录', to: '/login'},
                    {text: '重置密码', to: '/reset-password'}
                ]
            },
            {
                title: '我的账户',
                links: [
                    {text: '仪表盘', to: '/dashboard'},
                    {text: '角色管理', to: '/role-management'},
                    {text: '启动器会话', to: '/launcher-sessions'},
                    {text: '个人信息', to: '/profile'}
                ]
            }
        ],
        contact: {
            title: '联系我们',
            items: [
                {text: 'QQ 群：123456789', url: 'https://qm.qq.com/'},
                {text: 'support@example.com', url: 'mailto:support@example.com'}
            ]
        },
        friendLinks: {
            title: '友情链接',
            links: [
                {text: 'authlib-injector', url: 'https://github.com/yushijinhun/authlib-injector'}
            ]
        },
        bottom: {
            copyright: 'Yggdrasil Web',
            icp: {text: '示例：请在 config.json 中填写备案号', url: 'https://beian.miit.gov.cn/'},
            poweredBy: 'Powered by Yggdrasil-Web'
        }
    }
}

let config: SiteConfig = defaultConfig

/**
 * 递归合并覆盖配置到默认配置（对象按 key 深合并，数组/基本类型直接替换）。
 */
function mergeConfig<T>(defaults: T, override: unknown): T {
    if (override === null || override === undefined) {
        return defaults
    }
    if (typeof defaults !== 'object' || defaults === null) {
        return override as T
    }
    if (Array.isArray(defaults)) {
        return (override as T) ?? defaults
    }
    const defaultsRecord = defaults as Record<string, unknown>
    const overrideRecord = override as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(defaultsRecord)) {
        result[key] = mergeConfig(defaultsRecord[key], overrideRecord[key])
    }
    return result as T
}

/**
 * 从 public/config.json 加载站点配置（应用启动时调用一次）。
 * 加载失败时保留默认配置，保证站点始终可渲染。
 */
export async function loadSiteConfig(): Promise<void> {
    try {
        // 使用 BASE_URL 拼接，兼容子路径部署（如 GitHub Pages /repo/）
        const response = await fetch(`${import.meta.env.BASE_URL}config.json`, {cache: 'no-cache'})
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        const json = (await response.json()) as SiteConfig
        config = mergeConfig(defaultConfig, json)
    } catch (error) {
        console.warn('站点配置加载失败，使用默认配置。', error)
    }
}

/** 获取当前站点配置（调用前请确保 loadSiteConfig 已完成） */
export function getSiteConfig(): SiteConfig {
    return config
}
