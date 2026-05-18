import { logger } from '../lib/logger.js';

/**
 * 从后端加载 Host 导航配置（与 mock/navigation.js 结构一致）。
 * @returns {Promise<{ apps: Array<Record<string, unknown>> }>}
 */
export async function fetchNavigation() {
  const res = await fetch('/api/v1/navigation', {
    headers: { Accept: 'application/json' },
  });
  const requestId = res.headers.get('X-Request-ID');
  let data;
  try {
    data = await res.json();
  } catch (err) {
    logger.error('navigation response not json', err, {
      status: res.status,
      ...(requestId ? { requestId } : {}),
    });
    throw new Error('导航接口返回非 JSON');
  }
  if (!res.ok) {
    const msg =
      typeof data?.error === 'string' && data.error.trim()
        ? data.error
        : `加载导航失败 (${res.status})`;
    if (res.status >= 500) {
      logger.error('fetch navigation failed', new Error(msg), {
        status: res.status,
        ...(requestId ? { requestId } : {}),
      });
    }
    throw new Error(msg);
  }
  if (!data || !Array.isArray(data.apps)) {
    logger.error('navigation payload invalid', undefined, {
      ...(requestId ? { requestId } : {}),
    });
    throw new Error('导航数据格式无效');
  }
  return data;
}
