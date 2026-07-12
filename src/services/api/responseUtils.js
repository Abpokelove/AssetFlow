export const unwrapData = (response, fallback = null) => {
  const payload = response?.data;
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data ?? fallback;
  }
  return payload ?? fallback;
};

export const unwrapList = (response) => {
  const value = unwrapData(response, []);
  return Array.isArray(value) ? value : [];
};

export const unwrapPage = (response) => {
  const payload = response?.data || {};
  const data = Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
  return {
    data: Array.isArray(data) ? data : [],
    total: Number(payload.total ?? (Array.isArray(data) ? data.length : 0)),
    page: Number(payload.page ?? 1),
    pageSize: Number(payload.pageSize ?? (Array.isArray(data) ? data.length : 0)),
    unreadCount: Number(payload.unreadCount ?? 0),
  };
};

export const apiErrorMessage = (error, fallback = 'Request failed. Please try again.') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const downloadResponseBlob = (response, filename, type = 'text/csv') => {
  const blob = new Blob([response.data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
