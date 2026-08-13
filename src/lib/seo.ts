import {getSiteConfig} from './siteConfig'

/**
 * SEO 辅助函数：更新页面标题、描述与关键词。
 * 站名与描述等来自站点配置（public/config.json）。
 */

/** 站名：来自站点配置 brand.name */
export function getSiteName(): string {
    return getSiteConfig().brand.name.trim() || 'Yggdrasil Web'
}

/** 拼接页面标题：`页面名 - 站名`；页面名与站名相同时只显示站名 */
export function buildTitle(pageTitle: string): string {
    const name = getSiteName()
    return pageTitle && pageTitle !== name ? `${pageTitle} - ${name}` : name
}

/** 创建或更新 <meta name> 标签内容 */
function upsertMeta(name: string, content: string): void {
    let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
    }
    meta.content = content
}

/**
 * 设置页面标题与描述（描述未传入时使用站点配置 seo.description）。
 * 关键词始终来自站点配置 seo.keywords。
 */
export function setPageMeta(title: string, description?: string): void {
    document.title = title
    const seo = getSiteConfig().seo
    upsertMeta('description', description || seo.description)
    upsertMeta('keywords', seo.keywords.join(', '))
}
