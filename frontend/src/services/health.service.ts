import { env } from '@/lib/env';
import type { HealthResponse } from '@/types/health';

export const HEALTH_ENDPOINT = `${env.apiUrl}/api/v1/health`;

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const response = await fetch(HEALTH_ENDPOINT, { cache: 'no-store', signal });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}
