const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('stm_parish_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('stm_parish_token', token);
  } else {
    localStorage.removeItem('stm_parish_token');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMessage = errData.error || errorMessage;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null as T;
}
