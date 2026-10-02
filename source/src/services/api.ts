declare global {
  interface Window {
    HIGEOEDU_CONFIG?: { apiBaseUrl?: string };
  }
}

export function apiUrl(path: string): string {
  const base = window.HIGEOEDU_CONFIG?.apiBaseUrl?.trim().replace(/\/+$/, '') || '';
  if (!base && (window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io'))) {
    throw new Error('Trợ lí AI chưa kết nối máy chủ. Cần điền URL API vào config.js.');
  }
  if (base && !/^https:\/\/[^/]+$/i.test(base)) {
    throw new Error('URL API trong config.js phải là địa chỉ HTTPS của máy chủ, không kèm đường dẫn.');
  }
  return `${base}${path}`;
}
