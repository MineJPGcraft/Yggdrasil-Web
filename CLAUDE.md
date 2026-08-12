# CLAUDE.md

本文件为 Claude Code 等 AI 助手提供本仓库的上下文，帮助后续开发保持一致。

## 项目概述

**Yggdrasil-Web** 是 Minecraft 外置登录（Yggdrasil / authlib-injector）身份验证服务器的**前端**实现。

每次开发前都检索并使用 @D:\WebStorm\Yggdrasil-Web\.claude\skills 目录里的 skill 。

- 它**不是**身份验证服务器本身，需要搭配后端 Yggdrasil 认证服务使用。
- 许可证：GPL-3.0

## 技术栈

| 类别      | 技术                                                    |
|---------|-------------------------------------------------------|
| 框架      | Vue 3.5（Composition API + `<script setup lang="ts">`） |
| 语言      | TypeScript 5.6（严格模式）                                  |
| 构建      | Vite 6                                                |
| 路由      | Vue Router 4                                          |
| UI 组件库  | shadcn-vue（基于 reka-ui）                                |
| 样式      | Tailwind CSS 4 + CSS 变量主题（light / dark / ocean）       |
| 图标      | lucide-vue-next                                       |
| 请求      | axios                                                 |
| 3D 皮肤预览 | skinview3d + three                                    |
| 工具      | @vueuse/core、class-variance-authority、tailwind-merge  |

## 常用命令

```bash
npm run dev        # 启动开发服务器（vite --host ::）
npm run build      # 类型检查（vue-tsc --noEmit）+ 生产构建
npm run type-check # 仅执行 vue-tsc 类型检查
npm run preview    # 预览生产构建产物
npm run start      # node ./dist/server.js（配合 public/server.js 部署）
```

## 目录结构

```
├── index.html                  # HTML 入口
├── vite.config.ts              # Vite 配置（@ 别名 → ./src，/api 开发代理）
├── tsconfig.json               # TypeScript 配置（standalone，strict）
├── env.d.ts                    # Vite client 类型 & *.vue 模块声明
├── components.json             # shadcn-vue 配置
├── postcss.config.mjs          # PostCSS（tailwind + autoprefixer）
├── tailwind.config.mjs         # Tailwind 内容扫描配置
└── public/
    ├── server.js               # Express 静态服务器（生产环境，端口 8081）
    ├── config.toml             # 服务器展示信息配置
    └── util/                   # server.js 依赖（configuration.js / logger.js）
```

### src/

```
├── main.ts                     # 应用入口：挂载 App、注册 router、注入 $axios
├── App.vue                     # 根组件：加载服务器元数据并设置 document.title
├── api.ts                      # axios 实例 + 全部后端 API 封装（含类型定义）
├── style.css                   # 全局样式（Tailwind 入口）
├── layouts/
│   └── DefaultLayout.vue       # 带 Navbar/Footer 的默认布局，包裹需登录的页面
├── router/
│   └── index.ts                # 路由定义 + 全局守卫（登录态检查）
├── themes/
│   ├── index.css               # 主题系统入口
│   ├── themes.ts               # 主题选项（浅色/深色/海洋）
│   ├── light.css / dark.css / ocean.css
├── lib/
│   └── utils.ts                # cn()（clsx + tailwind-merge）
├── components/
│   ├── Navbar.vue              # 顶栏：导航、主题切换、用户下拉菜单（含移动端 Sheet）
│   ├── Footer.vue
│   ├── ThemeSwitcher.vue       # 主题切换下拉菜单
│   └── ui/                     # shadcn-vue 组件库（avatar/button/card/dropdown-menu/input/label/select/separator/sheet/table/tabs）
│       └── <组件>/index.ts      # 统一导出入口（命名导出组件 + 变体）
└── views/
    ├── Login.vue               # 登录（调用 loginAPI）
    ├── register.vue            # 注册（用户 + 角色）
    ├── ResetPassword.vue       # 忘记密码（占位实现）
    ├── Dashboard.vue           # 仪表盘：展示角色列表与皮肤链接
    ├── RoleManagement.vue      # 角色管理：skinview3d 预览 + 皮肤上传
    ├── UserProfile.vue         # 个人信息：头像/邮箱/密码/OIDC（部分占位）
    └── Home.vue                # 首页（未在路由中使用）
```

## 路由与认证

- 路由见 `src/router/index.ts`。
- 根路径 `/` 根据 `localStorage` 是否含 `accessToken` 重定向到 dashboard 或 login。
- 需要登录的页面设置 `meta: { requiresAuth: true }`；守卫会将其重定向到 `/login`，并带 `?redirect=` 回跳参数。
- 登录态通过 `localStorage` 的 `accessToken` 维护（Navbar 监听 `storage` 事件实时刷新）。

## API 与数据流

- 所有请求集中在 `src/api.ts`，导出类型化接口，如：
    - `loginAPI(username, password)` → 保存 `accessToken` / `availableProfiles` 到 localStorage
    - `getProfileDetailsAPI(uuid)` → 获取角色详情（含 `properties`：`textures`、`uploadableTextures`）
    - `uploadSkinAPI(uuid, textureType, file, model)`、`register`、`registerProfileAPI`、`getServerMeta`
- 开发环境请求走 Vite 代理 `/api` → `VITE_DEV_API_PROXY_TARGET`（默认 `http://192.168.1.132:8095`），生产走
  `VITE_API_BASE_URL`。
- 角色（Profile）信息：登录后从 `availableProfiles` 读取，Dashboard / RoleManagement 据此拉取详情。

## 约定与注意事项

- **组件一律使用 `<script setup lang="ts">`**。
- **shadcn-vue UI 组件**：props 类型复用 reka-ui 导出的 `XxxRootProps` / `XxxRootEmits` 等类型（避免手写类型与 reka-ui
  冲突），见 `src/components/ui/*`。新增 UI 组件可运行 shadcn-vue CLI 添加。
- **`@` 别名**指向 `./src`（tsconfig 与 vite 均已配置）。
- **本地化**：UI 文案为简体中文。
- **主题**：`ThemeSwitcher` 通过 `data-theme` 属性切换；主题由 CSS 变量定义。
- **已知警告**：`skinview3d`（three.js）体积较大，构建时会有 chunk > 500 kB 的警告，属正常现象，可后续通过动态 import 优化。
- **代码风格**：模板中保留原文注释；改动时避免破坏既有中文注释。

## 常用开发路径

- 新增页面：在 `src/views/` 创建组件 → 在 `src/router/index.ts` 注册路由（如需登录则加 `requiresAuth`）。
- 新增 API：在 `src/api.ts` 添加带类型的函数。
- 调整导航：修改 `src/components/Navbar.vue` 的 `navLinks`。

## 备注

每次开发结束后都请进行测试和构建，必须保证构建成功。如果没有 95% 以上的把握，请向用户询问，不得私自决定。
