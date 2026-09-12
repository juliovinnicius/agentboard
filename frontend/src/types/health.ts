export interface HealthResponse {
  status: 'ok';
}

export type BackendStatus = 'checking' | 'online' | 'offline';
