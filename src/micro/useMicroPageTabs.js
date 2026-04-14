import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';
import {
  pathsEqual,
  makePageTabId,
  buildPageTab,
  findAppByMicroKey,
  labelForSubPath,
  parseSubRoutePayload,
} from './pageTabModel';

/**
 * 微前端主应用：Hash 地址栏 ↔ 多页签 ↔ 多个无界实例（按页签 id 隔离）。
 *
 * 数据流概要：
 * 1. 用户点侧栏 → react-router 改 pathname → 此处为「新 URL」补页签或切到已有同路径页签。
 * 2. user-front 内部路由变 → 子应用 bus.emit('sub-route-change', …) → 这里更新对应 instanceId 的页签并 replace 导航。
 * 3. 每个页签渲染一个 SubAppView，wujie name = f(microAppKey, tabId)；仅 active 的页签向子应用发 bus。
 */
export function useMicroPageTabs(nav, pathname, navigate, bus) {
  const [pageTabs, setPageTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const activeTabIdRef = useRef(null);
  const pathnameRef = useRef(pathname);
  activeTabIdRef.current = activeTabId;
  pathnameRef.current = pathname;

  useLayoutEffect(() => {
    if (!nav) return;
    setPageTabs((prev) => {
      if (prev.length === 0) {
        return [buildPageTab(nav, pathname)];
      }
      const hit = prev.find((t) => pathsEqual(t.fullPath, pathname));
      if (hit) return prev;
      return [...prev, buildPageTab(nav, pathname)];
    });
  }, [pathname, nav]);

  useEffect(() => {
    if (!nav || pageTabs.length === 0) return;
    const hit = pageTabs.find((t) => pathsEqual(t.fullPath, pathname));
    if (hit && hit.id !== activeTabId) {
      setActiveTabId(hit.id);
    }
  }, [pathname, pageTabs, nav, activeTabId]);

  useEffect(() => {
    if (!nav) return;
    const onSubRoute = (subAppName, second) => {
      const parsed = parseSubRoutePayload(subAppName, second);
      if (!parsed) return;
      const { path: pathStr, instanceId } = parsed;
      const subPathNorm = normalizeRoutePath(pathStr);
      const nextFull = buildMicroPath('user', subPathNorm);

      setPageTabs((prev) => {
        const idx = instanceId
          ? prev.findIndex((t) => t.id === instanceId)
          : prev.findIndex((t) => t.id === activeTabIdRef.current);
        const microTab = 'user';
        const routeLabel = labelForSubPath(nav, microTab, subPathNorm);
        const app = findAppByMicroKey(nav, microTab);
        const titlePart = app?.title ?? '';
        const label = routeLabel ? `${titlePart} · ${routeLabel}` : titlePart;
        const nextLabel = label || '页面';

        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            fullPath: nextFull,
            subPath: subPathNorm,
            microAppKey: microTab,
            label: nextLabel,
          };
          return copy;
        }
        return [
          ...prev,
          {
            id: makePageTabId(),
            fullPath: nextFull,
            subPath: subPathNorm,
            microAppKey: microTab,
            label: nextLabel,
          },
        ];
      });

      if (!pathsEqual(pathnameRef.current, nextFull)) {
        navigate(nextFull, { replace: true });
      }
    };
    bus.$on('sub-route-change', onSubRoute);
    return () => {
      bus.$off('sub-route-change', onSubRoute);
    };
  }, [navigate, nav, bus]);

  const activeTab = useMemo(
    () => pageTabs.find((t) => t.id === activeTabId) ?? pageTabs[0],
    [pageTabs, activeTabId],
  );

  const onTabChange = useCallback(
    (key) => {
      setActiveTabId(key);
      const tab = pageTabs.find((t) => t.id === key);
      if (tab && !pathsEqual(pathname, tab.fullPath)) {
        navigate(tab.fullPath);
      }
    },
    [pageTabs, pathname, navigate],
  );

  const onTabEdit = useCallback(
    (targetKey, action) => {
      if (action !== 'remove' || !nav) return;
      setPageTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === targetKey);
        if (idx === -1) return prev;
        const next = prev.filter((t) => t.id !== targetKey);
        if (next.length === 0) {
          const t = buildPageTab(nav, '/hello');
          setActiveTabId(t.id);
          navigate('/hello', { replace: true });
          return [t];
        }
        if (targetKey === activeTabIdRef.current) {
          const neighbor = idx === 0 ? next[0] : next[idx - 1];
          setActiveTabId(neighbor.id);
          navigate(neighbor.fullPath, { replace: true });
        }
        return next;
      });
    },
    [nav, navigate],
  );

  const activeKey = activeTabId ?? pageTabs[0]?.id;

  return {
    pageTabs,
    activeTab,
    activeKey,
    onTabChange,
    onTabEdit,
  };
}
