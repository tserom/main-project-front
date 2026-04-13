import React, { useCallback, useMemo, useState } from 'react';
import { Layout, Menu, Tabs, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import {
  DashboardOutlined,
  InboxOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  TOP_ITEMS,
  SIDE_BY_TOP,
  pageKey,
  labelForPage,
} from '../config/inventoryNav';

const { Header, Sider, Content } = Layout;

const TOP_ICONS = {
  dashboard: <DashboardOutlined />,
  ops: <InboxOutlined />,
  master: <DatabaseOutlined />,
  system: <SettingOutlined />,
};

function firstPageKeyOfTop(top) {
  const first = SIDE_BY_TOP[top]?.[0];
  return first ? pageKey(top, first.key) : null;
}

const MainLayout = () => {
  const defaultTop = TOP_ITEMS[0].key;
  const defaultPage = firstPageKeyOfTop(defaultTop);

  const [topKey, setTopKey] = useState(defaultTop);
  const [tabKeys, setTabKeys] = useState(() => [defaultPage]);
  const [activeTab, setActiveTab] = useState(defaultPage);

  const sideItems = SIDE_BY_TOP[topKey] ?? [];

  const openOrFocus = useCallback((key) => {
    setTabKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setActiveTab(key);
  }, []);

  const onTopClick = useCallback(({ key }) => {
    setTopKey(key);
    const k = firstPageKeyOfTop(key);
    if (k) {
      setTabKeys([k]);
      setActiveTab(k);
    }
  }, []);

  const onSideClick = useCallback(
    ({ key }) => {
      openOrFocus(pageKey(topKey, key));
    },
    [topKey, openOrFocus],
  );

  const onTabEdit = useCallback(
    (targetKey, action) => {
      if (action !== 'remove') return;
      setTabKeys((prev) => {
        const next = prev.filter((k) => k !== targetKey);
        if (next.length === 0) {
          const fallback = firstPageKeyOfTop(topKey);
          if (fallback) {
            setActiveTab(fallback);
            return [fallback];
          }
          return prev;
        }
        if (targetKey === activeTab) {
          const i = prev.indexOf(targetKey);
          const neighbor = prev[i - 1] ?? prev[i + 1];
          setActiveTab(neighbor);
        }
        return next;
      });
    },
    [activeTab, topKey],
  );

  const topMenuItems = useMemo(
    () =>
      TOP_ITEMS.map(({ key, label }) => ({
        key,
        label: (
          <span>
            {TOP_ICONS[key]} <span className="main-layout__top-label">{label}</span>
          </span>
        ),
      })),
    [],
  );

  const sideMenuItems = useMemo(
    () => sideItems.map(({ key, label }) => ({ key, label })),
    [sideItems],
  );

  const selectedSide = useMemo(() => {
    const parts = activeTab.split('/');
    return parts.length >= 2 && parts[0] === topKey ? [parts[1]] : [];
  }, [activeTab, topKey]);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="main-layout">
        <Header className="main-layout__header">
          <div className="main-layout__brand">库存管理中台</div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[topKey]}
            items={topMenuItems}
            onClick={onTopClick}
            className="main-layout__top-menu"
          />
        </Header>
        <Layout>
          <Sider width={220} className="main-layout__sider" theme="light">
            <Menu
              mode="inline"
              selectedKeys={selectedSide}
              items={sideMenuItems}
              onClick={onSideClick}
            />
          </Sider>
          <Layout className="main-layout__inner">
            <Content className="main-layout__content">
              <Tabs
                type="editable-card"
                hideAdd
                activeKey={activeTab}
                onChange={setActiveTab}
                onEdit={onTabEdit}
                items={tabKeys.map((k) => ({
                  key: k,
                  label: labelForPage(k),
                  children: (
                    <div className="main-layout__page">
                      <p className="main-layout__page-title">{labelForPage(k)}</p>
                      <p className="main-layout__page-hint">页面内容后续接入业务模块即可。</p>
                    </div>
                  ),
                }))}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
