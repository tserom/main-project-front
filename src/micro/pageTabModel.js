import { parseMicroPath, buildMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';

/** 主路由路径比较（与导航、页签里存的 fullPath 对齐） */
export function pathsEqual(a, b) {
  return normalizeRoutePath(a) === normalizeRoutePath(b);
}

export function makePageTabId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function findAppByMicroKey(nav, microTab) {
  return nav?.apps?.find((a) => a.microAppKey === microTab);
}

export function labelForSubPath(nav, microTab, subPath) {
  const app = findAppByMicroKey(nav, microTab);
  const sp = normalizeRoutePath(subPath);
  const route = app?.routes?.find((r) => normalizeRoutePath(r.path) === sp);
  return route?.label ?? null;
}

/** 一页签 = 一条 Hash 路径 + 对应子应用 microAppKey + 子路径 */
export function buildPageTab(nav, pathname) {
  const { microTab, subPath } = parseMicroPath(pathname);
  const app = findAppByMicroKey(nav, microTab);
  const routeLabel = labelForSubPath(nav, microTab, subPath);
  const titlePart = app?.title ?? '';
  const label = routeLabel ? `${titlePart} · ${routeLabel}` : titlePart;
  return {
    id: makePageTabId(),
    fullPath: pathname,
    microAppKey: microTab,
    subPath,
    label: label || '页面',
  };
}

/**
 * 子应用：bus.$emit('sub-route-change', 'user-front', payload)
 * 监听器收到的是 $emit 里事件名之后的参数：('user-front', payload)，payload 可为 path 字符串或 { path, instanceId }。
 */
export function parseSubRoutePayload(subAppName, second) {
  if (subAppName !== 'user-front') return null;
  if (typeof second === 'string') {
    return { path: second, instanceId: null };
  }
  if (second && typeof second === 'object' && typeof second.path === 'string') {
    return { path: second.path, instanceId: second.instanceId ?? null };
  }
  return null;
}

/** Antd 侧栏 key：避免 hello / user 下 route.key 重复导致选中错乱 */
export function sideMenuItemKey(appKey, routeKey) {
  return `${appKey}::${routeKey}`;
}

export function parseSideMenuKey(composite) {
  const i = String(composite).indexOf('::');
  if (i === -1) return { appKey: null, routeKey: composite };
  return { appKey: composite.slice(0, i), routeKey: composite.slice(i + 2) };
}
