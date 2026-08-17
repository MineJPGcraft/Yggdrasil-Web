# AGENTS.md

面向 AI 编码代理与人类协作者的工程指南。

## 项目是什么

**PlayerSystemWeb**（原 yggdrasil-web）是 Minecraft 外置登录（Yggdrasil / authlib-injector）认证服务器的**纯静态前端**：

- 不包含任何 Node.js 服务端代码（无 Express、无后端逻辑），构建产物 `dist/` 为纯静态文件，可部署到 GitHub Pages / Nginx / 任意静态托管。
- 必须搭配一个可访问的 Yggdrasil 认证后端使用，前端负责注册、登录、角色与皮肤管理、启动器会话、OIDC 回调等 UI 交互。

> ⚠️ 这不是认证服务器本身。`/yggdrasil/*` 是**后端协议路径**，是前后端契约，禁止改名。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Vue 3.5（Composition API + `<script setup lang="ts">`） |
| 语言 | TypeScript 5.6（严格模式） |
| 构建 | Vite 6（`base: './'`，支持子路径部署） |
| 路由 | Vue Router 4（`createWebHistory` + 登录守卫） |
| UI | shadcn-vue（基于 reka-ui）+ Tailwind CSS 4 + 多主题 |
| 3D 预览 | skinview3d + three |
| 请求 | axios（`withCredentials` Cookie 会话） |

## 常用命令

```bash
npm install        # 安装依赖（仓库不提交 package-lock.json，勿用 npm ci）
npm run dev        # 开发服务器（--host ::），/api 代理到 VITE_DEV_API_PROXY_TARGET
npm run build      # vue-tsc 类型检查 + vite 生产构建 → dist/
npm run type-check # 仅类型检查
npm run preview    # 本地静态预览构建产物
```

## 目录结构

```
├── src/
│   ├── api/            # 全部后端 API 封装（按域拆分，index.ts 统一导出）
│   ├── views/          # 页面组件（路由懒加载）
│   ├── components/     # 通用组件与 shadcn-vue ui 组件
│   ├── composables/    # 组合式函数（useTheme 等）
│   ├── layouts/        # 布局组件（DefaultLayout：侧边栏 + 内容区）
│   ├── lib/            # 工具（cn、seo、siteConfig、textures 解码）
│   ├── router/         # 路由 + 登录守卫
│   ├── themes/         # 主题系统（light/dark/ocean + themes.ts）
│   ├── App.vue
│   └── main.ts         # 应用入口（bootstrap：加载站点配置 → 恢复深层路由 → 挂载）
├── public/
│   ├── config.json     # 站点展示配置（标题/首页/页脚，运行时加载，无需重建）
│   └── 404.html        # 纯静态托管的 SPA 深层路由回退
├── vite.config.ts      # @ 别名、/api 开发代理、manualChunks 分包
└── .github/workflows/  # CI 构建 + GitHub Pages 部署
```

## 关键约定

### API 层（src/api）
- 所有后端请求经 `src/api/http.ts` 的 axios 实例发出：`baseURL` 在构建期决定（生产 `VITE_API_BASE_URL`，默认 `/api`；开发恒为 `/api` 由 Vite 代理），`withCredentials: true` 携带 HttpOnly Cookie。
- 401 拦截器会清除 `localStorage.userInfo` 并跳转 `/login`（动态 import router 以解除循环依赖）。
- `src/api/yggdrasil.ts` 封装 Yggdrasil 协议端点（`/yggdrasil/api/*`、`/yggdrasil/authserver/*`、`/yggdrasil/sessionserver/*`、`/yggdrasil/profiles/*`、`/yggdrasil/launcher-sessions/*`）。这些路径、函数名与类型名（如 `YggdrasilProfile`）属于**后端协议契约，禁止改名**。
- 新增 API 时在对应域文件实现并在 `src/api/index.ts` 统一导出。

### 站点配置驱动
- 站点文案（品牌名、SEO、首页 Hero、页脚）由 `public/config.json` 驱动，`src/lib/siteConfig.ts` 在启动时加载并与默认配置深合并；用户可直接改 JSON，无需重新构建。
- `src/lib/seo.ts` 按路由 `meta.title` 动态更新 `document.title` 与 meta 标签。

### 路由与登录守卫（src/router/index.ts）
- 认证态以 `localStorage.userInfo` 为标记（真实凭据为 HttpOnly Cookie）；`requiresAuth` 路由未登录跳转 `/login?redirect=...`；已登录访问 login/register/reset-password/home 跳转 `/dashboard`。
- 新增受保护页面：路由 meta 加 `requiresAuth: true, sidebar: true, title: '...'`。

### 环境变量（构建期）
| 变量 | 作用 | 默认 |
|---|---|---|
| `VITE_DEV_API_PROXY_TARGET` | 开发环境 Vite 代理目标 | `http://192.168.1.132:8095` |
| `VITE_API_BASE_URL` | 生产环境后端基础地址 | `/api` |

`.env.*` 仅在启动/构建时读取一次，改动需重启 `npm run dev`。

### 构建与部署
- `vite.config.ts`：`base: './'`（子路径部署必需）、`server.proxy['/api']` 开发代理、`manualChunks` 分包（vendor-vue / vendor-three / vendor-skinview3d / vendor-reka / vendor-utils）。
- 纯静态部署：`npm run build` 后把 `dist/` 交给任意静态托管；GitHub Pages 见 `.github/workflows/deploy.yml`（注入 `VITE_API_BASE_URL` secret）。
- SPA 深层路由回退：GitHub Pages 等不识别 history 路由，`public/404.html` 把原始地址写入 `sessionStorage` 并跳回站点根，`src/main.ts` 启动时恢复真实路由。**不要删除这两处逻辑。**

### 其他
- 组件统一走 `src/components/ui/*`（shadcn-vue 风格，`<script setup lang="ts">`）。
- 主题：`data-theme` 属性 + `src/themes/*.css`，`src/composables/useTheme.ts` 管理切换与持久化。
- 代码风格：2 空格缩进、分号、单引号；TS 严格模式（`vue-tsc --noEmit` 会拦截类型错误）。

## 常见坑

- 改 `.env.*` 后必须重启 dev server。
- 后端地址不带 `/api` 前缀（开发代理会剥离 `/api` 再转发）。
- 跨域登录失败多为后端 CORS 未允许凭证或 Cookie `SameSite`/`Secure` 配置问题。
- 皮肤预览不显示：确认材质 URL 域名在 Yggdrasil 后端的 `skinDomains` 白名单内。
- 项目名称为 **PlayerSystemWeb**（package.json `name: "playersystemweb"`）；不要把站点名改回 Yggdrasil Web，也不要动 `/yggdrasil/*` 协议路径。
