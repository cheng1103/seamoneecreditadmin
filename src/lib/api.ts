import type { ApiResponse, DashboardStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'smc_admin_csrf';

const getCsrfToken = () => {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    if (cookie.startsWith(`${CSRF_COOKIE}=`)) {
      return decodeURIComponent(cookie.substring(CSRF_COOKIE.length + 1));
    }
  }
  return undefined;
};

const withCsrfHeader = (options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const method = (options.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set(CSRF_HEADER, csrfToken);
    }
  }
  return headers;
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: withCsrfHeader(options),
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      throw new Error('Invalid response format');
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        return data;
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    // Handle unexpected errors
    throw new Error('An unexpected error occurred');
  }
}

// Auth
interface LoginResponse {
  token: string;
  admin: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (username: string, password: string) => {
  const response = await fetchApi<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return response;
};

export const logout = async () => {
  await fetchApi('/admin/auth/logout', { method: 'POST' });
};

export const getMe = () => fetchApi('/admin/auth/me');

// Applications
export const getApplications = (params?: Record<string, string>) => {
  const searchParams = new URLSearchParams({
    dedupe: 'true',
    ...params,
  });
  return fetchApi(`/admin/applications?${searchParams}`);
};

export const getApplication = (id: string) => fetchApi(`/admin/applications/${id}`);

export const updateApplication = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteApplication = (id: string) =>
  fetchApi(`/admin/applications/${id}`, { method: 'DELETE' });

export const getApplicationStats = () =>
  fetchApi<DashboardStats>('/admin/applications/stats/overview');

// Blogs
export const getBlogs = (params?: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  return fetchApi(`/admin/blogs?${searchParams}`);
};

export const getBlog = (id: string) => fetchApi(`/admin/blogs/${id}`);

export const createBlog = (data: Record<string, unknown>) =>
  fetchApi('/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateBlog = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteBlog = (id: string) =>
  fetchApi(`/admin/blogs/${id}`, { method: 'DELETE' });

// FAQs
export const getFAQs = () => fetchApi('/admin/faqs');

export const createFAQ = (data: Record<string, unknown>) =>
  fetchApi('/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFAQ = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/faqs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteFAQ = (id: string) =>
  fetchApi(`/admin/faqs/${id}`, { method: 'DELETE' });

// Testimonials
export const getTestimonials = () => fetchApi('/admin/testimonials');

export const createTestimonial = (data: Record<string, unknown>) =>
  fetchApi('/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTestimonial = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTestimonial = (id: string) =>
  fetchApi(`/admin/testimonials/${id}`, { method: 'DELETE' });

// Products
export const getProducts = () => fetchApi('/admin/products');

export const updateProduct = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Analytics
export const getAnalyticsOverview = () => fetchApi('/admin/analytics/overview');
export const getVisitorStats = (period?: string) =>
  fetchApi(`/admin/analytics/visitors${period ? `?period=${period}` : ''}`);
export const getConversionStats = (period?: string) =>
  fetchApi(`/admin/analytics/conversions${period ? `?period=${period}` : ''}`);

// Settings
export const getSettings = () => fetchApi('/admin/settings');
export const updateSettings = (data: Record<string, unknown>) =>
  fetchApi('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Contacts
export const getContacts = (params?: Record<string, string>) => {
  const searchParams = new URLSearchParams(params);
  return fetchApi(`/admin/contacts?${searchParams}`);
};

export const getContact = (id: string) => fetchApi(`/admin/contacts/${id}`);

export const updateContact = (id: string, data: Record<string, unknown>) =>
  fetchApi(`/admin/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteContact = (id: string) =>
  fetchApi(`/admin/contacts/${id}`, { method: 'DELETE' });
