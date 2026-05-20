# host（微前端父应用）

目录 **`apps/host`**：基于 **React 17**、**Vite**、**Ant Design 4** 的 **wujie（无界）微前端父应用**，负责壳层布局、路由/菜单，以及通过 `wujie-react` 加载子应用。`package.json` 中 `name` 为 **`host`**（历史曾用文件夹名 `main-project-front`）。

## 工具链

```bash
nvm use   # 见 .nvmrc（Node 20.19.x）
corepack enable && corepack prepare pnpm@10.28.2 --activate
pnpm install
pnpm dev
```

- 开发服务器默认：**http://127.0.0.1:8100**（端口名单见 [`docs/WORKSPACE.md`](../../docs/WORKSPACE.md#端口名单唯一信息源)）
- 包管理器与 Node 版本见 `package.json` 的 `engines` / `packageManager`。

## 与子应用联调

本地子应用 URL 在 **`.env.development`**（仅多端口 `pnpm dev` 模式生效；同源/Docker 模式由 build args 注入相对路径）：

| 变量 | 默认（dev） | 含义 |
|------|------------|------|
| `VITE_HELLO_FRONT_URL` | `http://localhost:8101/` | hello-front 子应用入口 |
| `VITE_USER_FRONT_URL` | `http://localhost:8102/` | user-front 子应用入口 |

修改端口先改 [`docs/WORKSPACE.md`](../../docs/WORKSPACE.md#端口名单唯一信息源) 端口名单，再同步本变量与子应用配置。

## 壳层首页与用户菜单

- 根路径 `/` 展示内置欢迎页（`src/pages/WelcomeHome.jsx`），介绍中台并列出子应用入口。
- 顶栏右侧 `HostUserMenu`：登录 / 个人中心 / 退出；与 `user-front` 共用 `localStorage` 键 `user-front:access-token`。

## 无界相关代码

- `src/config/wujie.js` — 实例命名等
- `src/components/SubAppView.jsx` — 子应用挂载
- `src/mock/navigation.js` — 使用 `import.meta.env.VITE_*`

更宏观的说明见工作区 [../../docs/MICROFRONTEND.md](../../docs/MICROFRONTEND.md)。

## Cursor / AI

若存在 `.cursor/skills/`、`.cursor/rules/`，以其中约定为准（例如环境版本）。

## Docker

本仓库根目录含 `Dockerfile`：多阶段构建静态资源后用 nginx 提供。与整个工作区一起启动见 [../../infra/docker/README.md](../../infra/docker/README.md)（Compose 服务名 **`host`**）。
