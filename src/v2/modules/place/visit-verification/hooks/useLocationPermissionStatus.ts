import { useEffect, useState } from 'react';

import { locationPermissionService, type LocationPermissionState } from '../services/locationPermission';

export function useLocationPermissionStatus() {
  const [status, setStatus] = useState<LocationPermissionState | 'loading'>('loading');

  useEffect(() => {
    let mounted = true;
    void locationPermissionService.getStatus()
      .then((nextStatus) => {
        if (mounted) setStatus(nextStatus);
      })
      .catch(() => {
        if (mounted) setStatus('undetermined');
      });
    return () => { mounted = false; };
  }, []);

  return status;
}
