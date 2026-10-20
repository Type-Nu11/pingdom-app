export type StartupPermission = 'notifications' | 'location' | 'microphone';

export type PermissionSnapshot = { granted: boolean; canAskAgain: boolean };

export type PermissionGate = {
  read: () => Promise<PermissionSnapshot>;
  request: () => Promise<PermissionSnapshot>;
};

export type StartupPermissionDependencies = {
  gates: Record<StartupPermission, PermissionGate>;
  wasRequested: (permission: StartupPermission) => Promise<boolean>;
  markRequested: (permission: StartupPermission) => Promise<void>;
};

export type StartupPermissionResult = { notificationsGranted: boolean };

const order: StartupPermission[] = ['notifications', 'location', 'microphone'];

export function microphonePermissionSnapshot(
  status: PermissionSnapshot,
  platform: string,
): PermissionSnapshot {
  // Expo can report canAskAgain=false on Android before its first microphone prompt.
  // The persisted attempt in this flow limits the OS request to once.
  return {
    granted: status.granted,
    canAskAgain: platform === 'android' ? !status.granted : status.canAskAgain,
  };
}

/** System dialogs must not compete with each other or the map's initial location lookup. */
export async function runStartupPermissions({
  gates,
  wasRequested,
  markRequested,
}: StartupPermissionDependencies): Promise<StartupPermissionResult> {
  let notificationsGranted = false;

  for (const permission of order) {
    try {
      const gate = gates[permission];
      const current = await gate.read();
      let granted = current.granted;

      const requestedBefore = await wasRequested(permission).catch(() => false);
      if (!granted && current.canAskAgain && !requestedBefore) {
        const requested = await gate.request();
        granted = requested.granted;
        await markRequested(permission).catch(() => undefined);
      }

      if (permission === 'notifications') notificationsGranted = granted;
    } catch (error) {
      // A missing native module or temporary permission error must not block app startup.
      console.warn(`[V2 startup permissions] ${permission} check failed.`, error);
    }
  }

  return { notificationsGranted };
}
