/**
 * 无界：事件名、实例名规则；子应用入口 URL 由接口 apps[].entryUrl 提供，不在此写死。
 */

/** 主应用广播「当前激活的微应用」；多页签 payload：{ pageKey, instanceId } */
export const WUJIE_PARENT_PAGE_EVENT = 'inventory-page';

/** 主应用向子应用下发子路由（需子应用自行订阅）；payload：{ path, instanceId } */
export const USER_FRONT_ROUTE_EVENT = 'user-front-route';

const NAME_SAFE = /[^a-zA-Z0-9_-]/g;

/**
 * 无界 iframe 实例名须全局唯一：一页签一个实例。
 * @param {string} microAppKey 来自接口 apps[].microAppKey
 */
export function wujieInstanceName(microAppKey, instanceId = 'default') {
  const safe = String(instanceId).replace(NAME_SAFE, '-');
  return `sub-${microAppKey}-${safe}`.slice(0, 90);
}

/** 接口下发的 entryUrl 规范化；无效则返回 null（由界面走 404） */
export function normalizeEntryUrl(raw) {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  return t.endsWith('/') ? t : `${t}/`;
}
