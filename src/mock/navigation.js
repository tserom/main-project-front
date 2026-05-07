/**
 * 导航 Mock（与真实接口约定一致时可原样替换 fetch）。
 *
 * apps[].key           — Hash 第一段 /{key}，须全局唯一
 * apps[].microAppKey   — 无界实例名、事件里区分子应用用
 * apps[].entryUrl      — 子应用入口（真实接口由后端下发；Mock 用环境变量占位）
 * apps[].subAppBusName — 可选；子应用内路由同步到主应用时 bus 里带的名称，如 user-front
 * apps[].routes        — 侧栏：子应用内 path + label
 */

const helloUrl = import.meta.env.VITE_HELLO_FRONT_URL;
const userUrl = import.meta.env.VITE_USER_FRONT_URL;

export const NAVIGATION_MOCK = {
  apps: [
    {
      key: 'hello',
      title: 'hello-front',
      microAppKey: 'hello',
      entryUrl: helloUrl,
      routes: [
        { key: 'home', path: '/', label: '首页' },
        { key: 'about', path: '/about', label: '关于' },
      ],
    },
    {
      key: 'user',
      title: 'user-front',
      microAppKey: 'user',
      entryUrl: userUrl,
      subAppBusName: 'user-front',
      routes: [
        { key: 'home', path: '/', label: '首页' },
        { key: 'login', path: '/login', label: '登录' },
        { key: 'register', path: '/register', label: '注册' },
        { key: 'profile', path: '/profile', label: '个人中心' },
      ],
    },
  ],
};
