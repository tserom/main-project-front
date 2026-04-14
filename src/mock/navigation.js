/**
 * 导航配置 Mock（后续可替换为真实接口返回结构）
 *
 * apps[].key          — 顶栏一级：项目标识（同时用于 Hash 第一段 /hello、/user）
 * apps[].title        — 顶栏展示名
 * apps[].microAppKey  — 与 wujie 子应用对应：welcome → hello-front，user → user-front
 * apps[].routes       — 侧栏二级：子应用内 path + 展示 label
 */
export const NAVIGATION_MOCK = {
  apps: [
    {
      key: 'hello',
      title: 'hello-front',
      microAppKey: 'welcome',
      routes: [
        { key: 'home', path: '/', label: '首页' },
        { key: 'about', path: '/about', label: '关于' },
      ],
    },
    {
      key: 'user',
      title: 'user-front',
      microAppKey: 'user',
      routes: [
        { key: 'home', path: '/', label: '首页' },
        { key: 'login', path: '/login', label: '登录' },
        { key: 'register', path: '/register', label: '注册' },
        { key: 'profile', path: '/profile', label: '个人中心' },
      ],
    },
  ],
};
