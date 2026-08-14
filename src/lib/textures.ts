/**
 * 解析角色属性中的纹理信息（textures / uploadableTextures）。
 * 依据 AuthAPI-doc 文档：textures 属性值为 Base64 编码的 JSON，
 * 顶层键为 textures，其下按 SKIN / CAPE 组织。
 */

/** 结构化属性项（与 api 的 ProfileProperty 结构兼容，避免本工具依赖 api 模块） */
export interface ProfilePropertyLike {
    name: string
    value: string
}

export interface ParsedTexture {
    skinUrl?: string
    skinModel?: string
}

/** 从属性数组中解析皮肤 URL 与模型；缺省返回空对象 */
export function parseTexturesProperty(
    properties?: ProfilePropertyLike[]
): ParsedTexture {
    const texturesProp = properties?.find((prop) => prop.name === 'textures')
    if (!texturesProp?.value) {
        return {}
    }

    try {
        const decoded = atob(texturesProp.value)
        const texturesData = JSON.parse(decoded) as {
            // 文档 schema：顶层为 textures 对象
            textures?: { SKIN?: { url?: string; metadata?: { model?: string } } }
            // 兼容性回退：部分实现把 skin 直接置于顶层
            skin?: { url?: string; metadata?: { model?: string } }
        }

        const skin = texturesData.textures?.SKIN ?? texturesData.skin
        return {
            skinUrl: skin?.url,
            skinModel: skin?.metadata?.model
        }
    } catch {
        console.error('解码或解析纹理数据失败:', texturesProp.value)
        return {}
    }
}

/** 从属性数组中解析可上传的材质类型列表；缺省返回空数组 */
export function parseUploadableTextures(
    properties?: ProfilePropertyLike[]
): string[] {
    const uploadableProp = properties?.find((prop) => prop.name === 'uploadableTextures')
    if (!uploadableProp?.value) {
        return []
    }
    return uploadableProp.value.split(',')
}

/**
 * 将材质 URL 转为当前页面同源的相对 URL，用于皮肤预览。
 *
 * 后端返回的材质 URL 通常是跨源绝对地址（如 http://host:8080/api/yggdrasil/textures/{hash}），
 * skinview3d 以 `crossOrigin='anonymous'` 方式加载图片，若后端未返回 CORS 头则加载失败、预览不显示。
 * 由于后端材质与 API 同源，这里取其路径作为相对地址，经前端的 /api 反代即可同源加载，从而规避 CORS。
 */
export function toSameOriginUrl(url: string): string {
    // 非绝对地址（相对路径）直接使用
    if (!/^https?:\/\//i.test(url)) {
        return url
    }
    try {
        const parsed = new URL(url, window.location.origin)
        // 同源绝对地址无需转换
        if (parsed.origin === window.location.origin) {
            return url
        }
        return parsed.pathname + parsed.search
    } catch {
        return url
    }
}
