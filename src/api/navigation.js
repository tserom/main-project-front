import { NAVIGATION_MOCK } from '../mock/navigation';

/**
 * 获取导航配置（当前为 Mock，可改为 fetch('/api/navigation')）
 */
export async function fetchNavigation() {
  await new Promise((r) => setTimeout(r, 50));
  return NAVIGATION_MOCK;
}
