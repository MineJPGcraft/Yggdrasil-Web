# Yggdrasil-Web

用于对接 Yggdrasil 后端身份验证服务器前端实现。

> [!IMPORTANT]
> 这不是身份验证服务器！它需要搭配身份验证服务器使用。


有关 Minecraft 的 authlib-injector 技术，请详见 [yushijinhun/authlib-injector](https://github.com/yushijinhun/authlib-injector)。


## 声明

本项目遵循 GPL-3.0 license 许可证。

## 技术栈

| 类别    | 技术                                                    |
|-------|-------------------------------------------------------|
| 框架    | Vue 3.5（Composition API + `<script setup lang="ts">`） |
| 语言    | TypeScript 5.6（严格模式）                                  |
| 构建    | Vite 6                                                |
| 路由    | Vue Router 4                                          |
| UI    | shadcn-vue（基于 reka-ui）+ Tailwind CSS 4 + 多主题          |
| 3D 预览 | skinview3d + three                                    |
| 请求    | axios（Cookie 会话）                                      |

## 目录结构（简）

```
├── src/
│   ├── api/              # 全部后端 API 封装（按域拆分，index.ts 统一导出）
│   ├── views/            # 页面组件（路由懒加载）
│   ├── components/       # 通用组件与 shadcn-vue ui 组件
│   ├── lib/              # 工具函数（cn、textures 解码）
│   ├── router/           # 路由 + 登录守卫
│   ├── themes/           # 主题系统
│   └── main.ts           # 应用入口
├── public/
│   ├── server.js         # Express 静态服务器（生产环境，端口 8081）
│   ├── config.toml       # 服务器展示信息配置
│   └── 404.html          # 纯静态托管（GitHub Pages）的 SPA 回退
└── vite.config.ts        # Vite 配置（@ 别名、/api 开发代理、manualChunks 分包）
```

## 环境变量

环境变量均为**构建期**读取，构建完成后不可更改，需重新构建。

| 变量                          | 作用               | 默认值                         |
|-----------------------------|------------------|-----------------------------|
| `VITE_DEV_API_PROXY_TARGET` | 开发环境 Vite 代理目标地址 | `http://192.168.1.132:8095` |
| `VITE_API_BASE_URL`         | 生产环境后端基础地址       | `'/api'`（同域反代时保持默认即可）       |

开发环境通过 `/api` 请求后端，由 Vite 代理转发；生产环境使用 `VITE_API_BASE_URL`。

示例：

```bash
# .env.development
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8095

# .env.production —— 方式 A：同域反代（后端地址不带 /api 前缀时用）
VITE_API_BASE_URL=/api

# .env.production —— 方式 B：后端独立地址（需后端开启 CORS）
VITE_API_BASE_URL=https://auth.example.com
```

## 本地开发

```bash
npm install
npm run dev       # 开发服务器，默认代理到 VITE_DEV_API_PROXY_TARGET
npm run build     # 类型检查 + 生产构建
npm run preview   # 预览构建产物
npm run type-check
```

## 部署

前端为纯静态 SPA，需配合**可访问的 Yggdrasil 认证后端**使用。以下两种部署方式任选其一。

### 方式一：虚拟服务器部署（Node.js + Express）

仓库自带的 `public/server.js` 是一个 Express 静态服务器（构建时复制到 `dist/`，端口 `8081`），
可把前端直接托管在任意 VPS / 云服务器上。

**1. 环境准备**

安装 Node.js 20+（推荐 LTS）。

**2. 获取代码并安装依赖**

```bash
git clone <你的仓库地址> Yggdrasil-Web
cd Yggdrasil-Web
npm ci
```

**3. 配置后端地址（构建期）**

推荐**同域反代**：前端与后端共用域名，由 Nginx 把 `/api` 转发到后端。

```bash
echo "VITE_API_BASE_URL=/api" > .env.production
```

若后端有独立域名，则直接指向后端（后端需开启 CORS 并允许携带 Cookie）：

```bash
echo "VITE_API_BASE_URL=https://auth.example.com" > .env.production
```

**4. 构建**

```bash
npm run build
```

产物输出到 `dist/`，包含 `index.html`、静态资源、`server.js`、`config.toml` 与 `util/`。

**5. 启动**

```bash
npm run start   # 等价于 node ./dist/server.js，监听 0.0.0.0:8081
```

生产环境建议使用进程守护，例如 PM2：

```bash
npm install -g pm2
pm2 start "npm run start" --name yggdrasil-web
pm2 save
pm2 startup    # 按提示执行输出命令以开机自启
```

或使用 systemd（`/etc/systemd/system/yggdrasil-web.service`）：

```ini
[Unit]
Description=Yggdrasil-Web
After=network.target

[Service]
WorkingDirectory=/opt/Yggdrasil-Web
ExecStart=/usr/bin/npm run start
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

**6. （可选）Nginx 反向代理 + HTTPS**

以同域反代为例：前端监听 `8081`，后端认证服务监听 `8095`，通过 Nginx 统一对外提供 `443`：

```nginx
server {
    listen 80;
    server_name example.com;

    # 后端认证服务（去掉 /api 前缀转发）
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8095;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 前端静态页面
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
    }
}
```

HTTPS 证书，配置完成后将 `location` 改到 `443`。

> 注意：后端若使用 Cookie 会话，需确保反代透传 Cookie，且 HTTPS 下 `Set-Cookie` 的 `Secure` 属性正常。

### 方式二：GitHub Pages 部署

GitHub Pages 是纯静态托管，**无法承载后端认证服务**，仅部署前端，并直连一个可公开访问的后端地址。

**1. 前提条件**

- 后端认证服务需有公网可访问的 HTTPS 地址，且开启 CORS、允许携带 Cookie。
- 仓库 Settings → **Pages** → Source 选择 **GitHub Actions**。
- 仓库 Settings → **Secrets and variables → Actions** 添加 secret `VITE_API_BASE_URL`，
  值为后端公网地址（如 `https://auth.example.com`）。

**2. 部署机制**

仓库已内置 `.github/workflows/deploy.yml`：推送 `main` 分支或手动触发后，自动：

1. `npm ci` 安装依赖
2. 注入 `secrets.VITE_API_BASE_URL` 执行 `npm run build`
3. 将 `dist/` 发布到 GitHub Pages

无需手动操作，部署完成后访问 `https://<用户名>.github.io/<仓库名>/`。

**3. SPA 深层路由回退**

GitHub Pages 不识别 `history` 路由，刷新/直链 `/dashboard` 等深层路径会 404。
项目已通过以下方式处理：

- `public/404.html`：把原始地址写入 `sessionStorage` 后跳回站点根；
- `src/main.ts`：应用启动时读取该值并 `router.replace()` 恢复真实路由。

因此**部署前无需任何额外配置**，只需保证 `index.html` 里的 JS 资源用相对路径（项目已配置 `base: './'`）。

**4. 构建期注意**

- 前端登录态依赖后端下发的 HttpOnly Cookie，因此后端必须允许跨域携带 Cookie
  （CORS 需显式允许凭证，且 `Access-Control-Allow-Origin` 不能是 `*`）。
- 若后端不支持 CORS，则不要用 GitHub Pages 部署，请改用方式一（同域反代）。

## 常见问题

- **跨域登录失败 / 401**：后端未正确配置 CORS（需允许凭证）或 Cookie 的 `SameSite`/`Secure` 属性与站点不符。
- **皮肤预览不显示**：确认角色已上传皮肤，且材质 URL 域名在 Yggdrasil 的 `skinDomains` 白名单内。
- **构建产物过大警告**：项目已通过路由懒加载 + `manualChunks` 分包，`three`/`skinview3d` 独立 chunk，
  单个 chunk 均小于 500 kB。
- **GitHub Pages 深层刷新 404**：确认已包含 `public/404.html` 且 `main.ts` 的 redirect 恢复逻辑未被移除。
