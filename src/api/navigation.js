import { NAVIGATION_MOCK } from '../mock/navigation';
import { normalizeNavigationPayload } from './navigationNormalize';

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 从后端加载 Host 导航配置（与 mock/navigation.js 结构一致）。
 * @returns {Promise<{ apps: Array<Record<string, unknown>> }>}
 */
export async function fetchNavigation() {
  const res = await fetch('/api/v1/navigation', {
    headers: { Accept: 'application/json' },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('导航接口返回非 JSON');
  }
  if (!res.ok) {
    const msg =
      typeof data?.error === 'string' && data.error.trim()
        ? data.error
        : `加载导航失败 (${res.status})`;
    throw new Error(msg);
  }
  if (!data || !Array.isArray(data.apps)) {
    throw new Error('导航数据格式无效');
  }
  return data;
}

/**
 * 加载导航：优先请求 API，失败/超时/无效时回退本地 Mock，始终 resolve。
 * @returns {Promise<{ apps: Array, navSource: 'api'|'fallback', navWarning?: string }>}
 */
export async function loadNavigation() {
  try {
    const res = await fetchWithTimeout(
      '/api/v1/navigation',
      { headers: { Accept: 'application/json' } },
      FETCH_TIMEOUT_MS,
    );
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('导航接口返回非 JSON');
    }
    if (!res.ok) {
      const msg =
        typeof data?.error === 'string' && data.error.trim()
          ? data.error
          : `加载导航失败 (${res.status})`;
      throw new Error(msg);
    }
    if (!data || !Array.isArray(data.apps)) {
      throw new Error('导航数据格式无效');
    }
    return normalizeNavigationPayload(data, { navSource: 'api' });
  } catch (err) {
    const msg =
      err?.name === 'AbortError'
        ? '导航接口请求超时'
        : err?.message || '无法加载导航配置';
    return normalizeNavigationPayload(NAVIGATION_MOCK, {
      navSource: 'fallback',
      navWarning: `${msg}，已使用本地默认配置`,
    });
  }
}
