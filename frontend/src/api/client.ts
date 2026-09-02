const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  regulatoryMode: string | null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  jwtToken: string = 'dev-demo-token',
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const regulatoryMode = res.headers.get('X-Regulatory-Mode');

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        data: null,
        error: errBody.message || `HTTP ${res.status}: ${res.statusText}`,
        regulatoryMode,
      };
    }

    const data = await res.json();
    return { data, error: null, regulatoryMode };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'Network error',
      regulatoryMode: null,
    };
  }
}
