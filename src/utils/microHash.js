/**
 * Hash 路由（pathname 不含 #）：
 *   /hello              → hello-front（microTab welcome），子路径 /
 *   /hello/about        → welcome，/about
 *   /user               → user-front，/
 *   /user/login         → user，/login
 *
 * 兼容旧链：/welcome → 与 /hello 相同
 */

export function parseMicroPath(pathname) {
  const clean = pathname && pathname !== '/' ? pathname : '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts[0] === 'user') {
    const rest = parts.slice(1);
    return {
      microTab: 'user',
      subPath: rest.length ? `/${rest.join('/')}` : '/',
    };
  }

  if (parts[0] === 'hello' || parts[0] === 'welcome') {
    const rest = parts.slice(1);
    return {
      microTab: 'welcome',
      subPath: rest.length ? `/${rest.join('/')}` : '/',
    };
  }

  return { microTab: 'welcome', subPath: '/' };
}

/**
 * @param {string} microTab — welcome | user
 * @param {string} subPath — 子应用内路径，如 /login
 */
export function buildMicroPath(microTab, subPath) {
  const prefix = microTab === 'user' ? 'user' : 'hello';
  if (!subPath || subPath === '/') {
    return `/${prefix}`;
  }
  const p = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `/${prefix}${p}`;
}
