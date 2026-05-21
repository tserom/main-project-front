import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Button, Tooltip, Spin, Tabs, Alert } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import WujieReact from 'wujie-react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  WarningOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { loadNavigation } from '../api/navigation';
import { parseMicroPath, buildMicroPath } from '../utils/microHash';
import { normalizeRoutePath } from '../utils/pathUtils';
import { sideMenuItemKey, parseSideMenuKey, findAppByRoutePrefix } from '../micro/pageTabModel';
import { useMicroPageTabs } from '../micro/useMicroPageTabs';
import SubAppView from '../components/SubAppView';
import HostUserMenu from '../components/HostUserMenu';
import WelcomeHome from '../pages/WelcomeHome';

const { Header, Sider, Content } = Layout;
const { bus } = WujieReact;

const HOST_THEME = {
  primaryColor: '#0d9488',
  linkColor: '#0d9488',
  borderRadiusBase: 6,
  fontFamily:
    '"Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
};

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [nav, setNav] = useState(null);
  const [navWarning, setNavWarning] = useState(null);
  const [topNavVisible, setTopNavVisible] = useState(true);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNavWarning(null);
    loadNavigation().then((data) => {
      if (cancelled) return;
      const { navWarning: warning, ...payload } = data;
      setNav(payload);
      setNavWarning(warning ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { routePrefix, subPath } = useMemo(
    () => parseMicroPath(location.pathname),
    [location.pathname],
  );

  const activeApp = useMemo(() => {
    if (!routePrefix || !nav?.apps?.length) return null;
    return findAppByRoutePrefix(nav, routePrefix);
  }, [nav, routePrefix]);

  const topKey = activeApp?.key;
  const sideItems = useMemo(() => activeApp?.routes ?? [], [activeApp]);

  const selectedSideMenuKey = useMemo(() => {
    if (!activeApp) return null;
    const sp = normalizeRoutePath(subPath);
    const match = activeApp.routes.find(
      (r) => normalizeRoutePath(r.path) === sp,
    );
    const route = match ?? activeApp.routes[0];
    return route ? sideMenuItemKey(activeApp.key, route.key) : null;
  }, [activeApp, subPath]);

  const navigateApp = useCallback(
    (app, route) => {
      if (!app || !route) return;
      const path = buildMicroPath(app.key, route.path);
      if (path) navigate(path);
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
    activeKey,
    onTabChange,
    onTabEdit,
    clearAllTabs,
  } = useMicroPageTabs(nav, location.pathname, navigate, bus);

  const showWelcome = pageTabs.length === 0 && routePrefix === null;
  const showEntering = pageTabs.length === 0 && routePrefix !== null;

  const handleLogout = useCallback(() => {
    clearAllTabs();
  }, [clearAllTabs]);

  const topMenuItems = useMemo(
    () =>
      (nav?.apps ?? []).map((app) => ({
        key: app.key,
        label: (
          <span className="main-layout__top-item">
            <AppstoreOutlined />
            <span className="main-layout__top-label">{app.title}</span>
          </span>
        ),
      })),
    [nav],
  );

  const sideMenuItems = useMemo(
    () =>
      activeApp
        ? sideItems.map((r) => ({
            key: sideMenuItemKey(activeApp.key, r.key),
            label: r.label,
          }))
        : [],
    [sideItems, activeApp],
  );

  const showSider = Boolean(activeApp);
  const showSideMenu = sideMenuItems.length > 0;

  if (!nav) {
    return (
      <div className="main-layout__nav-loading">
        <Spin size="large" tip="加载导航配置…" />
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN} theme={HOST_THEME}>
      <Layout className="main-layout main-layout--full">
        <Header className="main-layout__header main-layout__header--shell">
          <div className="main-layout__header-start">
            <Tooltip title={topNavVisible ? '隐藏顶栏菜单' : '展开顶栏菜单'}>
              <Button
                type="text"
                className="main-layout__nav-toggle"
                icon={topNavVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={() => setTopNavVisible((v) => !v)}
              />
            </Tooltip>
            <div className="main-layout__brand">
              <span className="main-layout__brand-mark" aria-hidden />
              <span className="main-layout__brand-text">库存管理中台</span>
            </div>
          </div>
          {topNavVisible ? (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={topKey ? [topKey] : []}
              items={topMenuItems}
              onClick={onTopClick}
              className="main-layout__top-menu"
            />
          ) : (
            <div className="main-layout__header-placeholder" aria-hidden />
          )}
          <div className="main-layout__header-end">
            <HostUserMenu nav={nav} navigate={navigate} onLogout={handleLogout} />
          </div>
        </Header>
        <Layout className="main-layout__body">
          {showSider ? (
            <Sider
              width={232}
              collapsedWidth={72}
              collapsible
              collapsed={siderCollapsed}
              onCollapse={setSiderCollapsed}
              className="main-layout__sider"
              theme="light"
              trigger={null}
            >
              <div className="main-layout__sider-head">
                {!siderCollapsed && activeApp ? (
                  <span className="main-layout__sider-app">{activeApp.title}</span>
                ) : null}
              </div>
              {showSideMenu ? (
                <Menu
                  mode="inline"
                  selectedKeys={selectedSideMenuKey ? [selectedSideMenuKey] : []}
                  items={sideMenuItems}
                  onClick={onSideClick}
                  className="main-layout__side-menu"
                />
              ) : (
                <div
                  className={
                    siderCollapsed
                      ? 'main-layout__sider-empty main-layout__sider-empty--collapsed'
                      : 'main-layout__sider-empty'
                  }
                >
                  <CompassOutlined className="main-layout__sider-empty-icon" aria-hidden />
                  {!siderCollapsed ? (
                    <p className="main-layout__sider-empty-text">该应用暂无菜单项</p>
                  ) : null}
                </div>
              )}
              <div className="main-layout__sider-footer">
                <Tooltip title={siderCollapsed ? '展开侧栏' : '收起侧栏'} placement="right">
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
          ) : null}
          <Layout className="main-layout__inner">
            <Content className="main-layout__content main-layout__content--micro">
              {navWarning ? (
                <Alert
                  className="main-layout__nav-alert"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  message="导航配置未完全加载"
                  description={navWarning}
                  closable
                />
              ) : null}
              <div
                className={
                  showWelcome
                    ? 'main-layout__micro-panel main-layout__micro-panel--welcome'
                    : 'main-layout__micro-panel'
                }
              >
                {showWelcome ? (
                  <WelcomeHome nav={nav} onOpenApp={(path) => navigate(path)} />
                ) : showEntering ? (
                  <div className="main-layout__wujie-loading">
                    <Spin size="large" tip="正在进入应用…" />
                  </div>
                ) : (
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
                      closable: true,
                      children: (
                        <div className="main-layout__page main-layout__page--wujie">
                          <SubAppView
                            microAppKey={tab.microAppKey}
                            entryUrl={tab.entryUrl}
                            subPath={tab.subPath}
                            instanceId={tab.id}
                            active={activeKey === tab.id}
                            invalid={tab.invalid}
                            subAppBusName={tab.subAppBusName}
                          />
                        </div>
                      ),
                    }))}
                  />
                )}
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
