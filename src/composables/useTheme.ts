import {computed, watch} from 'vue'
import {usePreferredDark, useStorage} from '@vueuse/core'
import {themeOptions} from '@/themes/themes'

/**
 * 主题偏好（localStorage 持久化）：
 * - 'system'  跟随系统 / 浏览器深浅色偏好
 * - 'light' / 'dark' / 'ocean' 手动指定主题
 */
type ThemePreset = 'system' | 'light' | 'dark' | 'ocean'

const presetStorage = useStorage<ThemePreset>('theme-preset', 'system')

// 浏览器的深浅色偏好（跟随 prefers-color-scheme，自动响应系统切换）
const prefersDark = usePreferredDark()

// 解析后的实际主题：'system' → 浅色或深色；手动主题原样返回
const resolvedTheme = computed<string>(() => {
    if (presetStorage.value === 'system') {
        return prefersDark.value ? 'dark' : 'light'
    }
    return presetStorage.value
})

// 应用主题到 <html data-theme>
const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', resolvedTheme.value)
}

// 立即应用一次（模块加载时），避免首屏闪白
applyTheme()

// 偏好或系统变化时同步
watch([presetStorage, prefersDark], applyTheme)

const setTheme = (preset: ThemePreset) => {
    presetStorage.value = preset
    applyTheme()
}

/** 当前实际应用的主题值（light / dark / ocean） */
export const theme = resolvedTheme

export function useTheme() {
    return {
        preset: presetStorage,
        theme: resolvedTheme,
        setTheme,
        themeOptions,
    }
}