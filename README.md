# Yggdrasil-Web

用于对接 Yggdrasil 后端身份验证服务器前端实现。

> [!IMPORTANT]
> 这不是身份验证服务器！它需要搭配身份验证服务器使用。


有关 Minecraft 的 authlib-injector 技术，请详见 [yushijinhun/authlib-injector](https://github.com/yushijinhun/authlib-injector)。


## 声明

本项目遵循 GPL-3.0 license 许可证。


## 环境变量

开发环境默认通过 `/api` 请求后端，再由 Vite 代理转发；生产环境可直接使用后端地址。

可选变量：

- `VITE_DEV_API_PROXY_TARGET`：开发环境 Vite 代理目标地址（默认 `http://192.168.1.132:8095`）
- `VITE_API_BASE_URL`：生产环境后端基础地址（例如 `https://api.example.com`）

示例：

```bash
# .env.development
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:8095

# .env.production
VITE_API_BASE_URL=https://api.example.com
```
