# host（微前端父应用）

目录 **`apps/host`**：基于 **React 17**、**Vite**、**Ant Design 4** 的 **wujie（无界）微前端父应用**，负责壳层布局、路由/菜单，以及通过 `wujie-react` 加载子应用。`package.json` 中 `name` 为 **`host`**（历史曾用文件夹名 `main-project-front`）。

## 工具链

```bash
nvm use   # 见 .nvmrc（Node 20.19.x）
corepack enable && corepack prepare pnpm@10.28.2 --activate
pnpm install
pnpm dev
```

- 开发服务器默认：**http://127.0.0.1:8000**
- 包管理器与 Node 版本见 `package.json` 的 `engines` / `packageManager`。

## 与子应用联调

本地子应用 URL 在 **`.env.development`**（勿提交密钥；仅开发用变量）：

| 变量 | 默认 | 含义 |
|------|------|------|
| `VITE_HELLO_FRONT_URL` | `http://localhost:8100/` | 试验子应用入口 |
| `VITE_USER_FRONT_URL` | `http://localhost:8101/` | 用户中心子应用入口 |

修改端口后需同步修改上述变量并重启 `pnpm dev`。

## 无界相关代码

- `src/config/wujie.js` — 实例命名等
- `src/components/SubAppView.jsx` — 子应用挂载
- `src/mock/navigation.js` — 使用 `import.meta.env.VITE_*`

更宏观的说明见工作区 [../../docs/MICROFRONTEND.md](../../docs/MICROFRONTEND.md)。

## Cursor / AI

若存在 `.cursor/skills/`、`.cursor/rules/`，以其中约定为准（例如环境版本）。

## Docker

本仓库根目录含 `Dockerfile`：多阶段构建静态资源后用 nginx 提供。与整个工作区一起启动见 [../../infra/docker/README.md](../../infra/docker/README.md)（Compose 服务名 **`host`**）。
