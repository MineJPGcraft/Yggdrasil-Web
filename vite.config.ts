import {fileURLToPath, URL} from 'node:url'
import type {PluginOption} from 'vite'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/postcss'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devProxyTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://192.168.1.132:8095'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss() as unknown as PluginOption,
    ],
    base: './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vue 核心
            'vendor-vue': ['vue', 'vue-router'],
            // Three.js 及 skinview3d（体积最大，单独分包）
            'vendor-three': ['three'],
            'vendor-skinview3d': ['skinview3d'],
            // UI 组件库
            'vendor-reka': ['reka-ui'],
            // 工具库
            'vendor-utils': ['axios', '@vueuse/core', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          }
        }
      }
    }
  }
})
