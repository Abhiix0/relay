import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div 
      className="bg-warning/10 border-b border-warning/20 px-4 py-2 shrink-0"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4 text-warning" aria-hidden="true" />
        <span className="text-warning font-mono">
          You appear to be offline.
        </span>
        <span className="text-text-muted">
          Some project data may be unavailable until your connection returns.
        </span>
      </div>
    </div>
  );
}