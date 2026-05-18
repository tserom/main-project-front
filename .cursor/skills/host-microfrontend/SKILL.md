---
name: host-microfrontend
description: >-
  wujie 父应用 host：MainLayout、导航 fetch、子应用 entry 环境变量。单独打开 apps/host
  时使用；跨应用约定见工作区根 skill。
---

# host 微前端父应用

单独打开 **`apps/host`** 时以本 skill 为准。

跨应用（导航 API、端口、网关）见工作区 [`../../../.cursor/skills/k-project-workspace/SKILL.md`](../../../.cursor/skills/k-project-workspace/SKILL.md) 与 [`../../../docs/NAVIGATION_CONFIG.md`](../../../docs/NAVIGATION_CONFIG.md)。

## 导航

- 运行时：`src/api/navigation.js` → `GET /api/v1/navigation`（失败显示 Result，不用 Mock）。
- 结构参考：`src/mock/navigation.js`。
- dev proxy：`vite.config.js` 将 `/api` 转到 `8500`。

## 子应用入口

- `.env.development`：`VITE_HELLO_FRONT_URL`、`VITE_USER_FRONT_URL`
- 同源：`.env.k-project.com` 使用 `/micro/hello/`、`/micro/user/`
