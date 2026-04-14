/**
 * 单个子应用在主应用中的挂载点：一个 WujieReact 实例 = 一个 iframe。
 * - name：须唯一（见 config/wujie.wujieInstanceName），多页签靠不同 instanceId 区分。
 * - 与父路由同步：通过 bus 发 USER_FRONT_ROUTE_EVENT 等，仅 active 的页签会 emit（避免多 iframe 同响应）。
 */
import React, { useCallback, useEffect } from 'react';
import WujieReact from 'wujie-react';
import {
  urlForTab,
  wujieInstanceName,
  WUJIE_PARENT_PAGE_EVENT,
  USER_FRONT_ROUTE_EVENT,
} from '../config/wujie';

function normalizeSubPath(p) {
  if (!p || p === '/') return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * @param {string} tabKey microAppKey：welcome | user
 * @param {string} instanceId 主应用页签 id，保证无界 name 唯一
 * @param {boolean} active 当前是否为选中页签（仅激活时向子应用发 bus，避免多 iframe 同响应）
 */
function SubAppView({ tabKey, subPath = '/', instanceId = 'default', active = true }) {
  const url = urlForTab(tabKey);
  const name = wujieInstanceName(tabKey, instanceId);
  const path = normalizeSubPath(subPath);

  const notifySubApp = useCallback(() => {
    if (!active) return;
    WujieReact.bus.$emit(WUJIE_PARENT_PAGE_EVENT, {
      pageKey: tabKey,
      instanceId,
    });
    if (tabKey === 'user') {
      WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, { path, instanceId });
    }
  }, [tabKey, path, active, instanceId]);

  useEffect(() => {
    notifySubApp();
  }, [notifySubApp]);

  return (
    <div className="main-layout__wujie-host">
      <WujieReact
        width="100%"
        height="100%"
        name={name}
        url={url}
        exec
        alive={false}
        sync={false}
        props={{
          instanceId,
          initialPath: tabKey === 'user' ? path : undefined,
        }}
        afterMount={() => {
          notifySubApp();
          if (tabKey === 'user' && active) {
            const payload = { path, instanceId };
            setTimeout(() => WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, payload), 0);
            setTimeout(() => WujieReact.bus.$emit(USER_FRONT_ROUTE_EVENT, payload), 80);
          }
        }}
        loadError={(src, err) => {
          window.console.error('[wujie] loadError', src, err);
        }}
      />
    </div>
  );
}

export default SubAppView;
