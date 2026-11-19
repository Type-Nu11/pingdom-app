import { useCallback, useEffect, useMemo, useState } from 'react';
import { getExternalPlaceKey, toExternalRouteDestination, type ExternalMapPlace } from '../../selection/model/externalPlace';
import type { EndpointRole } from '../components/RouteEndpointRows';

type RegisteredRoute = {
  placeId: number;
  role: EndpointRole;
  originSelection: 'currentLocation' | 'manual';
};

type Options = {
  isFocused: boolean;
  previewPlaceId: number | undefined;
  actionPlaceId: number | undefined;
  externalPlace: ExternalMapPlace | null;
};

export function useMapRouteSelection({ isFocused, previewPlaceId, actionPlaceId, externalPlace }: Options) {
  const [emptyRouteOpen, setEmptyRouteOpen] = useState(false);
  const [registeredRoute, setRegisteredRoute] = useState<RegisteredRoute | null>(null);
  const [assistantDirectionsPlaceId, requestAssistantDirections] = useState<number | null>(null);
  const [externalRouteRole, setExternalRouteRole] = useState<EndpointRole | null>(null);
  const externalPlaceKey = externalPlace ? getExternalPlaceKey(externalPlace) : null;
  const externalRouteDestination = useMemo(
    () => toExternalRouteDestination(externalPlace),
    [externalPlace],
  );

  useEffect(() => {
    if (!isFocused) setEmptyRouteOpen(false);
  }, [isFocused]);

  useEffect(() => {
    setRegisteredRoute(null);
  }, [actionPlaceId, isFocused]);

  useEffect(() => {
    setExternalRouteRole(null);
  }, [externalPlaceKey, isFocused]);

  useEffect(() => {
    if (assistantDirectionsPlaceId === null) return;
    if (!isFocused || previewPlaceId !== assistantDirectionsPlaceId) {
      requestAssistantDirections(null);
    } else if (actionPlaceId === assistantDirectionsPlaceId) {
      setRegisteredRoute({ placeId: assistantDirectionsPlaceId, role: 'destination', originSelection: 'manual' });
      requestAssistantDirections(null);
    }
  }, [actionPlaceId, assistantDirectionsPlaceId, isFocused, previewPlaceId]);

  const openRegisteredRoute = useCallback((placeId: number, role: EndpointRole) => {
    if (placeId !== actionPlaceId) return;
    setRegisteredRoute((current) => (
      current?.placeId === placeId && current.role === role && current.originSelection === 'currentLocation'
        ? current
        : { placeId, role, originSelection: 'currentLocation' }
    ));
  }, [actionPlaceId]);

  return {
    emptyRouteOpen,
    externalPlaceKey,
    externalRouteDestination,
    externalRouteRole,
    registeredRoute,
    requestAssistantDirections,
    openRegisteredRoute,
    closeRegisteredRoute: () => setRegisteredRoute(null),
    openEmptyRoute: () => setEmptyRouteOpen(true),
    closeEmptyRoute: () => setEmptyRouteOpen(false),
    openExternalRoute: setExternalRouteRole,
    closeExternalRoute: () => setExternalRouteRole(null),
  };
}
