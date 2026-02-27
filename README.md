# Yggdrasil-Web

用于对接 Yggdrasil 后端身份验证服务器 [MioVerify](https://github.com/pingguomc/MioVerify) 的前端网页实现。

Yggdrasil-Web 是一个 MC 外置登录身份验证网页。 可以做到启动器的外置登陆部分功能。

通过本项目，可以从网页进行操作。包括注册、登录、创建角色，上传皮肤等。

> [!IMPORTANT]
> 这不是身份验证服务器！它需要搭配身份验证服务器使用。

**什么是身份验证服务器？**

就好比Minecraft启动器可以登录你的正版号一样。authlib-injector 实现了一种外置登录，允许玩家使用第三方的验证服务器。在登录时，同样会要求输入账号(一般是邮箱)和密码，并且可以上传和查看皮肤等。

另外，如果游戏服务器也使用了 authlib-injector，就可以做到一样的正版验证效果。

Yggdrasil API 是一套规范，定义了如何实现身份验证，而 MioVerify 是安装这套规范开发的 Yggdrasil 服务端。 

Yggdrasil-Web 正是按照 Yggdrasil API 的启动器规范和 MioVerify 服务端 开发的一个网页。

**目前所有的主流启动器都已支持外置登录。**

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
