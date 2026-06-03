import type { NotificationRoute } from '../../features/firebase/model/notification.types';

export type NotificationState = {
  pendingRoute: NotificationRoute | null;
  lastBackgroundRoute: NotificationRoute | null;
};

type Listener = () => void;

let state: NotificationState = {
  pendingRoute: null,
  lastBackgroundRoute: null,
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(next: Partial<NotificationState>) {
  state = { ...state, ...next };
  emit();
}

export function getNotificationState(): NotificationState {
  return state;
}

export function subscribeNotification(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPendingNotificationRoute(route: NotificationRoute): void {
  setState({ pendingRoute: route });
}

export function consumePendingNotificationRoute(): NotificationRoute | null {
  const currentRoute = state.pendingRoute;
  setState({ pendingRoute: null });
  return currentRoute;
}

export function setLastBackgroundNotificationRoute(route: NotificationRoute | null): void {
  setState({ lastBackgroundRoute: route });
}
