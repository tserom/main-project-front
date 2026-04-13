/**
 * 库存中台导航配置：顶部一级 + 左侧二级。
 * 后续加菜单只改这里即可。
 */
export const TOP_ITEMS = [
  { key: 'dashboard', label: '数据看板' },
  { key: 'ops', label: '日常作业' },
  { key: 'master', label: '基础档案' },
  { key: 'system', label: '系统' },
];

export const SIDE_BY_TOP = {
  dashboard: [
    { key: 'overview', label: '库存概览' },
    { key: 'alert', label: '预警' },
  ],
  ops: [
    { key: 'inbound', label: '入库' },
    { key: 'outbound', label: '出库' },
    { key: 'transfer', label: '调拨' },
    { key: 'stocktake', label: '盘点' },
  ],
  master: [
    { key: 'sku', label: '物料' },
    { key: 'warehouse', label: '仓库' },
    { key: 'supplier', label: '供应商' },
  ],
  system: [
    { key: 'user', label: '用户' },
    { key: 'role', label: '角色' },
  ],
};

export function pageKey(top, side) {
  return `${top}/${side}`;
}

export function parsePageKey(key) {
  const [top, side] = key.split('/');
  return { top, side };
}

export function labelForPage(key) {
  const { top, side } = parsePageKey(key);
  const item = SIDE_BY_TOP[top]?.find((s) => s.key === side);
  return item?.label ?? key;
}
