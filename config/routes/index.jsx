import React from 'react';
import { createHashRouter } from 'react-router-dom';
import MainLayout from '../../src/layouts/MainLayout';
import NotFoundPage from '../../src/pages/NotFound';

/**
 * 路由系统唯一入口：
 * - 采用 Hash 路由（与当前系统一致），便于微前端场景下无需服务端配合。
 * - 业务主入口交给 `MainLayout`：其内部根据接口导航配置渲染子应用/页签。
 * - 单独保留 /404，供内部逻辑跳转兜底（例如关闭最后一个页签时）。
 */
export const router = createHashRouter([
  { path: '/404', element: <NotFoundPage /> },
  { path: '/*', element: <MainLayout /> },
  { path: '*', element: <NotFoundPage /> },
]);

