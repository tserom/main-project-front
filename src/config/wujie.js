/**
 * 无界（wujie）侧配置：子应用入口 URL、跨应用事件名、实例名规则。
 *
 * 本地联调：在 .env.development 中配置 VITE_HELLO_FRONT_URL / VITE_USER_FRONT_URL，
 * 与下方 urlForTab() 中的 microAppKey（welcome / user）对应。
 */

function normalizeUrl(raw) {
  if (!raw) return 'http://localhost:8100/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/** microAppKey → 子应用开发服务器根地址 */
export function urlForTab(tabKey) {
  if (tabKey === 'welcome') {
    return normalizeUrl(import.meta.env.VITE_HELLO_FRONT_URL);
  }
  if (tabKey === 'user') {
    return normalizeUrl(import.meta.env.VITE_USER_FRONT_URL);
  }
  return normalizeUrl(import.meta.env.VITE_HELLO_FRONT_URL);
}

/** 主应用广播「当前激活的是哪个微应用页」；多页签 payload：{ pageKey, instanceId } */
export const WUJIE_PARENT_PAGE_EVENT = 'inventory-page';

/** 主应用要求 user-front 跳到指定子路由；payload：{ path, instanceId } */
export const USER_FRONT_ROUTE_EVENT = 'user-front-route';

const NAME_SAFE = /[^a-zA-Z0-9_-]/g;

/**
 * 无界 iframe 实例名必须全局唯一：一页签一个实例，
 * 同一子应用多开页签时用不同 instanceId（一般为页签 id）。
 */
export function wujieInstanceName(microAppKey, instanceId = 'default') {
  const safe = String(instanceId).replace(NAME_SAFE, '-');
  return `sub-${microAppKey}-${safe}`.slice(0, 90);
}
