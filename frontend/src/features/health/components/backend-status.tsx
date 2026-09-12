'use client';

import { Badge } from '@/components/ui/badge';
import { useBackendHealth } from '@/hooks/use-backend-health';
import type { BackendStatus as Status } from '@/types/health';

const LABELS: Record<Status, string> = {
  checking: 'Checking…',
  online: 'Online',
  offline: 'Offline',
};

const VARIANTS: Record<Status, 'secondary' | 'default' | 'destructive'> = {
  checking: 'secondary',
  online: 'default',
  offline: 'destructive',
};

export function BackendStatus() {
  const status = useBackendHealth();

  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      Backend Status:
      <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
    </p>
  );
}
