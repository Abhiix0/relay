import { useOnlineStatus } from './useOnlineStatus';

/**
 * Hook that provides utilities for network-aware components
 * @returns Object with isOnline status and helper functions
 */
export function useNetworkAware() {
  const isOnline = useOnlineStatus();

  /**
   * Check if a network operation should be disabled
   * @param alwaysDisabled - Additional condition to disable the operation
   * @returns true if the operation should be disabled
   */
  const isDisabled = (alwaysDisabled: boolean = false) => {
    return !isOnline || alwaysDisabled;
  };

  /**
   * Get an appropriate disabled message for offline state
   * @returns string message explaining why action is disabled
   */
  const getOfflineMessage = () => {
    return isOnline ? '' : 'This action requires an internet connection';
  };

  return {
    isOnline,
    isDisabled,
    getOfflineMessage,
  };
}