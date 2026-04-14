import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Tooltip, Spin, Tabs } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import WujieReact from 'wujie-react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { fetchNavigation } from '../api/navigation';
import { parseMicroPath, buildMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';
import { sideMenuItemKey, parseSideMenuKey } from '../micro/pageTabModel';
import { useMicroPageTabs } from '../micro/useMicroPageTabs';
import SubAppView from './SubAppView';

const { Header, Sider, Content } = Layout;
const { bus } = WujieReact;

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [nav, setNav] = useState(null);
  const [topNavVisible, setTopNavVisible] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNavigation().then((data) => {
      if (!cancelled) setNav(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { microTab, subPath } = useMemo(
    () => parseMicroPath(location.pathname),
    [location.pathname],
  );

  const activeApp = useMemo(() => {
    if (!nav?.apps?.length) return null;
    return nav.apps.find((a) => a.microAppKey === microTab) ?? nav.apps[0];
  }, [nav, microTab]);

  const topKey = activeApp?.key ?? 'hello';
  const sideItems = activeApp?.routes ?? [];

  const selectedSideMenuKey = useMemo(() => {
    if (!activeApp) return null;
    const sp = normalizeRoutePath(subPath);
    const match = activeApp.routes.find(
      (r) => normalizeRoutePath(r.path) === sp,
    );
    const route = match ?? activeApp.routes[0];
    return route ? sideMenuItemKey(activeApp.key, route.key) : null;
  }, [activeApp, subPath]);

  const currentSideLabel = useMemo(() => {
    if (!activeApp || !selectedSideMenuKey) return null;
    const { routeKey } = parseSideMenuKey(selectedSideMenuKey);
    const r = sideItems.find((item) => item.key === routeKey);
    return r?.label;
  }, [activeApp, selectedSideMenuKey, sideItems]);

  const navigateApp = useCallback(
    (app, route) => {
      if (!app || !route) return;
      navigate(buildMicroPath(app.microAppKey, route.path));
    },
    [navigate],
  );

  const onTopClick = useCallback(
    ({ key }) => {
      const app = nav?.apps?.find((a) => a.key === key);
      if (!app?.routes?.length) return;
      navigateApp(app, app.routes[0]);
    },
    [nav, navigateApp],
  );

  const onSideClick = useCallback(
    ({ key }) => {
      const { appKey, routeKey } = parseSideMenuKey(key);
      const app = nav?.apps?.find((a) => a.key === appKey);
      if (!app) return;
      const route = app.routes.find((r) => r.key === routeKey);
      if (!route) return;
      navigateApp(app, route);
    },
    [nav, navigateApp],
  );

  const {
    pageTabs,
    activeTab,
    activeKey,
    onTabChange,
    onTabEdit,
  } = useMicroPageTabs(nav, location.pathname, navigate, bus);

  const topMenuItems = useMemo(
    () =>
      (nav?.apps ?? []).map((app) => ({
        key: app.key,
        label: (
          <span>
            <AppstoreOutlined />{' '}
            <span className="main-layout__top-label">{app.title}</span>
          </span>
        ),
      })),
    [nav],
  );

  const sideMenuItems = useMemo(
    () =>
      sideItems.map((r) => ({
        key: sideMenuItemKey(activeApp.key, r.key),
        label: r.label,
      })),
    [sideItems, activeApp],
  );

  if (!nav) {
    return (
      <div className="main-layout__nav-loading">
        <Spin size="large" tip="加载导航配置…" />
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="main-layout main-layout--full">
        <Header className="main-layout__header main-layout__header--shell">
          <Tooltip title={topNavVisible ? '隐藏顶栏菜单' : '展开顶栏菜单'}>
            <Button
              type="text"
              className="main-layout__nav-toggle"
              icon={topNavVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setTopNavVisible((v) => !v)}
            />
          </Tooltip>
          <div className="main-layout__brand">库存管理中台</div>
          {topNavVisible ? (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[topKey]}
              items={topMenuItems}
              onClick={onTopClick}
              className="main-layout__top-menu"
            />
          ) : (
            <div className="main-layout__header-placeholder" aria-hidden />
          )}
        </Header>
        <Layout className="main-layout__body">
          <Sider
            width={220}
            collapsedWidth={64}
            collapsible
            collapsed={siderCollapsed}
            onCollapse={setSiderCollapsed}
            className="main-layout__sider"
            theme="light"
            trigger={null}
          >
            <Menu
              mode="inline"
              selectedKeys={selectedSideMenuKey ? [selectedSideMenuKey] : []}
              items={sideMenuItems}
              onClick={onSideClick}
            />
            <div className="main-layout__sider-footer">
              <Tooltip title={siderCollapsed ? '展开侧栏' : '收起侧栏'}>
                <Button
                  type="text"
                  block
                  className="main-layout__sider-trigger-btn"
                  icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setSiderCollapsed((c) => !c)}
                />
              </Tooltip>
            </div>
          </Sider>
          <Layout className="main-layout__inner">
            <Content className="main-layout__content main-layout__content--micro">
              <div className="main-layout__micro-panel">
                <p className="main-layout__page-title">
                  {activeTab?.label ??
                    `${activeApp?.title ?? '子应用'}${
                      currentSideLabel ? ` · ${currentSideLabel}` : ''
                    }`}
                </p>
                <Tabs
                  className="main-layout__micro-tabs"
                  type="editable-card"
                  hideAdd
                  destroyInactiveTabPane={false}
                  activeKey={activeKey}
                  onChange={onTabChange}
                  onEdit={onTabEdit}
                  items={pageTabs.map((tab) => ({
                    key: tab.id,
                    label: tab.label,
                    closable: pageTabs.length > 1,
                    children: (
                      <div className="main-layout__page main-layout__page--wujie">
                        <SubAppView
                          tabKey={tab.microAppKey}
                          subPath={tab.subPath}
                          instanceId={tab.id}
                          active={activeKey === tab.id}
                        />
                      </div>
                    ),
                  }))}
                />
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
