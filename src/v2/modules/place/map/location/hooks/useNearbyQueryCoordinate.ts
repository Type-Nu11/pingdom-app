import { useEffect, useState } from 'react';
import type { Coordinate } from '../../camera/model/map.types';
import { destinationDistance } from '../../routes/model/routeTracking';

// Discovery feeds cover an area. Keep live GPS for the blue dot and navigation,
// but avoid a new feed/cache entry for every small GPS movement.
export function useNearbyQueryCoordinate(coordinate: Coordinate | null): Coordinate | null {
  const [anchor, setAnchor] = useState(coordinate);
  useEffect(() => {
    setAnchor(previous => {
      if (!coordinate || !previous) return coordinate;
      return destinationDistance(previous, coordinate) >= 100 ? coordinate : previous;
    });
  }, [coordinate]);
  return coordinate ? anchor : null;
}
