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
