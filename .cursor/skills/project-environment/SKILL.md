---
name: project-environment
description: Sets up and enforces the runtime/toolchain for this wujie.js micro-frontend parent application. Use when running shell commands in this repo (install, dev, build, lint), bootstrapping the environment, switching Node versions, choosing a package manager, or upgrading/pinning React. Triggers on mentions of node, nvm, pnpm, npm, yarn, wujie, micro-frontend, 微前端, or React version changes.
---

# Project Environment (wujie.js 微前端父应用)

本仓库是 **wujie.js 微前端父应用**。在本仓库内执行任何命令、安装依赖、或修改框架版本时，严格遵循以下版本与工具链约定。

## 必须使用的版本

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | **v20.19.5** | 推荐通过 [nvm](https://github.com/nvm-sh/nvm) 管理 |
| pnpm | **v10.28.2** | 唯一允许的包管理器 |
| React / React-DOM | **17.0.2**（固定） | 不要升级到 18/19 |

## Shell 执行规则

在本仓库执行命令前，先确认 Node 版本。如不匹配，使用 nvm 切换：

```bash
node -v   # 期望: v20.19.5
nvm use 20.19.5 || nvm install 20.19.5
```

### 包管理：只用 pnpm

- 安装依赖：`pnpm install`
- 添加依赖：`pnpm add <pkg>` / `pnpm add -D <pkg>`
- 运行脚本：`pnpm dev` / `pnpm build` / `pnpm lint`

**禁止**使用 `npm install` 或 `yarn`，避免产生 `package-lock.json` 或 `yarn.lock`。仓库以 `pnpm-lock.yaml` 为准。

### 全局 pnpm 版本

如果用户的 pnpm 版本不是 v10.28.2：

```bash
npm i -g pnpm@10.28.2
# 或使用 corepack
corepack prepare pnpm@10.28.2 --activate
```

## React 版本规则（重要）

React 必须固定在 **17.0.2**，原因：

- wujie.js 父应用与子应用的兼容矩阵以 React 17 为基准
- `@types/react`、`@types/react-dom` 也必须保持 17.x
- antd v4 与 React 17 配套，升级 React 会破坏 antd v4

### 添加/升级依赖时的检查清单

- [ ] 不会把 `react` / `react-dom` 升到 ^18 或 ^19
- [ ] 不会引入要求 React 18+ peer 的库（如 antd v5、新版本 react-router 等）
- [ ] 新增 antd 相关依赖时，确认与 antd v4 兼容
- [ ] 安装后检查 `pnpm-lock.yaml` 中 react 仍解析到 17.0.2

如确需引入要求 React 18+ 的库，**先停下询问用户**，不要擅自升级。

## 关键依赖（当前锁定的形态）

```
react             ^17.0.2
react-dom         ^17.0.2
@types/react      ^17.0.2
@types/react-dom  ^17.0.2
antd              ^4.24.8
wujie-react       ^1.0.29
react-router-dom  ^6.28.0
vite              ^8.0.4
```

修改 `package.json` 中以上字段时，保持主版本不变。

## 常见任务速查

| 任务 | 命令 |
|------|------|
| 安装依赖 | `pnpm install` |
| 启动开发 | `pnpm dev` |
| 生产构建 | `pnpm build` |
| Lint | `pnpm lint` |
| 切换 Node | `nvm use 20.19.5` |
| 添加运行时依赖 | `pnpm add <pkg>` |
| 添加开发依赖 | `pnpm add -D <pkg>` |

## 遇到不一致时

1. Node 版本不对 → `nvm use 20.19.5`，必要时 `nvm install 20.19.5`
2. pnpm 版本不对 → `corepack prepare pnpm@10.28.2 --activate`
3. 出现 `package-lock.json` 或 `yarn.lock` → 删除，仅保留 `pnpm-lock.yaml`
4. 有人提议升级 React → **先与用户确认**，默认拒绝
