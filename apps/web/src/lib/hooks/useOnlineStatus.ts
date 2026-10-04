import { useState, useEffect } from 'react';

/**
 * Hook to detect browser online/offline status
 * @returns boolean indicating if the browser is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with navigator.onLine if available, otherwise assume online
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}