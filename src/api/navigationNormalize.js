import { normalizeEntryUrl } from '../config/wujie';
import { NAVIGATION_MOCK } from '../mock/navigation';

/** 本地 dev / 网关同源时，按 app.key 补全 entryUrl */
const ENTRY_BY_APP_KEY = {
  hello: import.meta.env.VITE_HELLO_FRONT_URL,
  user: import.meta.env.VITE_USER_FRONT_URL,
  inventory: import.meta.env.VITE_INVENTORY_FRONT_URL,
};

/** API 下发的同源 /micro/*（网关模式）；多端口 dev 未配代理时会落到 host 自身 */
function isSameOriginMicroEntry(url) {
  if (!url || typeof window === 'undefined') return false;
  try {
    const entry = new URL(url, window.location.origin);
    return (
      entry.origin === window.location.origin &&
      entry.pathname.replace(/\/+$/, '').startsWith('/micro')
    );
  } catch {
    return false;
  }
}

function resolveEntryForApp(app) {
  const fromApi = normalizeEntryUrl(app?.entryUrl);
  const fromEnv = normalizeEntryUrl(ENTRY_BY_APP_KEY[app?.key]);
  // 多端口 dev：优先用 .env 中的绝对 URL（8101/8102…），避免 /micro/* 在仅开 host 时套娃
  if (import.meta.env.DEV && isSameOriginMicroEntry(fromApi) && fromEnv) {
    return fromEnv;
  }
  return fromApi || fromEnv || null;
}

/** 避免把父应用自身当作子应用 entry（套娃） */
function isHostSelfEntry(url) {
  if (!url || typeof window === 'undefined') return false;
  try {
    const entry = new URL(url, window.location.origin);
    const here = new URL(window.location.href);
    if (entry.origin !== here.origin) return false;
    const p = entry.pathname.replace(/\/+$/, '') || '/';
    const hostPath = here.pathname.replace(/\/+$/, '') || '/';
    if (p === hostPath) return true;
    if (p === '/' || p === '/index.html') return true;
    return false;
  } catch {
    return false;
  }
}

function normalizeApp(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const key = typeof raw.key === 'string' ? raw.key.trim() : '';
  if (!key) return null;

  const routes = Array.isArray(raw.routes)
    ? raw.routes
        .filter((r) => r && typeof r.key === 'string' && typeof r.path === 'string')
        .map((r) => ({
          key: String(r.key).trim(),
          path: r.path.startsWith('/') ? r.path : `/${r.path}`,
          label: typeof r.label === 'string' && r.label.trim() ? r.label : r.key,
        }))
    : [];

  let entryUrl = resolveEntryForApp({ ...raw, key });
  if (entryUrl && isHostSelfEntry(entryUrl)) {
    entryUrl = normalizeEntryUrl(ENTRY_BY_APP_KEY[key]);
  }

  return {
    key,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : key,
    microAppKey:
      typeof raw.microAppKey === 'string' && raw.microAppKey.trim()
        ? raw.microAppKey.trim()
        : key,
    entryUrl,
    subAppBusName:
      typeof raw.subAppBusName === 'string' && raw.subAppBusName.trim()
        ? raw.subAppBusName.trim()
        : undefined,
    routes: routes.length
      ? routes
      : [{ key: 'home', path: '/', label: '首页' }],
  };
}

/**
 * 将任意接口/Mock 载荷规范为 Host 可消费的导航结构。
 * @returns {{ apps: Array, navSource: 'api'|'fallback', navWarning?: string }}
 */
export function normalizeNavigationPayload(raw, meta = {}) {
  const appsRaw = Array.isArray(raw?.apps) ? raw.apps : [];
  const apps = appsRaw.map(normalizeApp).filter(Boolean);

  if (apps.length > 0) {
    return { apps, navSource: meta.navSource ?? 'api', navWarning: meta.navWarning };
  }

  const fallbackApps = (NAVIGATION_MOCK.apps ?? [])
    .map(normalizeApp)
    .filter(Boolean);

  return {
    apps: fallbackApps,
    navSource: 'fallback',
    navWarning: meta.navWarning ?? '导航数据无效，已使用本地默认配置',
  };
}
