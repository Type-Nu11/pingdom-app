import {
  microphonePermissionSnapshot,
  runStartupPermissions,
  type StartupPermission,
  type StartupPermissionDependencies,
} from '../startupPermissionFlow';

test('Android attempts the first microphone prompt even when Expo reports canAskAgain=false', () => {
  expect(microphonePermissionSnapshot({ granted: false, canAskAgain: false }, 'android'))
    .toEqual({ granted: false, canAskAgain: true });
  expect(microphonePermissionSnapshot({ granted: false, canAskAgain: false }, 'ios'))
    .toEqual({ granted: false, canAskAgain: false });
});

function setup() {
  const calls: string[] = [];
  const requested = new Set<StartupPermission>();
  const gates = Object.fromEntries(
    (['notifications', 'location', 'microphone'] as const).map((permission) => [permission, {
      read: async () => { calls.push(`${permission}:read`); return { granted: false, canAskAgain: true }; },
      request: async () => { calls.push(`${permission}:request`); return { granted: true, canAskAgain: true }; },
    }]),
  ) as StartupPermissionDependencies['gates'];
  const dependencies: StartupPermissionDependencies = {
    gates,
    wasRequested: async (permission) => requested.has(permission),
    markRequested: async (permission) => { requested.add(permission); },
  };
  return { calls, dependencies, requested };
}

test('requests startup permissions in notification, location, microphone order only once', async () => {
  const { calls, dependencies } = setup();

  expect(await runStartupPermissions(dependencies)).toEqual({ notificationsGranted: true });
  expect(calls).toEqual([
    'notifications:read', 'notifications:request',
    'location:read', 'location:request',
    'microphone:read', 'microphone:request',
  ]);

  calls.length = 0;
  expect(await runStartupPermissions(dependencies)).toEqual({ notificationsGranted: false });
  expect(calls).toEqual(['notifications:read', 'location:read', 'microphone:read']);
});

test('denial and native failure do not block later permission prompts', async () => {
  const { calls, dependencies, requested } = setup();
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  dependencies.gates.notifications.request = async () => {
    calls.push('notifications:request');
    return { granted: false, canAskAgain: true };
  };
  dependencies.gates.location.request = async () => {
    calls.push('location:request');
    throw new Error('native failure');
  };

  expect(await runStartupPermissions(dependencies)).toEqual({ notificationsGranted: false });
  expect(calls).toEqual([
    'notifications:read', 'notifications:request',
    'location:read', 'location:request',
    'microphone:read', 'microphone:request',
  ]);
  expect(requested.has('notifications')).toBe(true);
  expect(requested.has('location')).toBe(false);
  expect(requested.has('microphone')).toBe(true);
  expect(warning).toHaveBeenCalledWith(expect.stringContaining('location'), expect.any(Error));
  warning.mockRestore();
});

test('already granted permissions and blocked permissions do not prompt', async () => {
  const { calls, dependencies } = setup();
  dependencies.gates.notifications.read = async () => {
    calls.push('notifications:read');
    return { granted: true, canAskAgain: false };
  };
  dependencies.gates.location.read = async () => {
    calls.push('location:read');
    return { granted: false, canAskAgain: false };
  };

  expect(await runStartupPermissions(dependencies)).toEqual({ notificationsGranted: true });
  expect(calls).toEqual(['notifications:read', 'location:read', 'microphone:read', 'microphone:request']);
});
