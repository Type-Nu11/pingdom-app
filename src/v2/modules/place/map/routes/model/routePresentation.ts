import type { TFunction } from 'i18next';
import type { CarRoute } from '../api/routesApi';
export function routeSummary(route: CarRoute, language: string, t: TFunction): string {
  const { distance, duration } = routeMetrics(route, language, t);
  return t('routes.summary', { distance, duration });
}
export function routeMetrics(route: CarRoute, language: string, t: TFunction) {
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  const distance = route.distanceMeters < 1000
    ? `${number.format(route.distanceMeters)} m` : `${number.format(route.distanceMeters / 1000)} km`;
  const minutes = Math.ceil(route.durationSeconds / 60);
  const duration = route.durationSeconds < 60 ? t('routes.seconds', { count: route.durationSeconds })
    : minutes < 60 ? t('routes.minutes', { count: minutes })
      : t('routes.hours', { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
  return { distance, duration };
}
