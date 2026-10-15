// Synthetic contract data. Never used by production or as a route fallback.
export const transitResponse = {
  mode: 'transit', provider: 'tmap', itineraries: [
    { totalTimeSeconds: 1200, totalDistanceMeters: 4000, transferCount: 0,
      totalWalkDistanceMeters: 100, totalWalkTimeSeconds: 120, totalFare: 1500,
      legs: [
        { mode: 'WALK', distanceMeters: 100, durationSeconds: 120,
          routeName: null, routeId: null, routeColor: null, routeType: null,
          start: { name: 'Origin', latitude: 37.5, longitude: 127, stationId: null },
          end: { name: 'Central', latitude: 37.501, longitude: 127.001, stationId: null },
          path: [{ latitude: 37.5, longitude: 127 }, { latitude: 37.501, longitude: 127.001 }], stations: [] },
        { mode: 'SUBWAY', distanceMeters: 3900, durationSeconds: 1080,
          routeName: 'Line 2', routeId: '2', routeColor: '00A84D', routeType: 2,
          start: { name: 'Central', latitude: 37.502, longitude: 127.002, stationId: 'A' },
          end: { name: 'Park', latitude: 37.6, longitude: 127.1, stationId: 'B' },
          path: [{ latitude: 37.502, longitude: 127.002 }, { latitude: 37.6, longitude: 127.1 }],
          stations: [{ name: 'Central', latitude: 37.502, longitude: 127.002, stationId: 'A' },
            { name: 'Park', latitude: 37.6, longitude: 127.1, stationId: 'B' }] },
      ] },
    { totalTimeSeconds: 1800, totalDistanceMeters: 5000, transferCount: 1,
      totalWalkDistanceMeters: 0, totalWalkTimeSeconds: 0, totalFare: 2000,
      legs: [{ mode: 'BUS', distanceMeters: 5000, durationSeconds: 1800,
        routeName: 'Bus 7', routeId: '7', routeColor: null, routeType: null,
        start: null, end: null, stations: [],
        path: [{ latitude: 37.5, longitude: 127 }, { latitude: 37.55, longitude: 127.2 }, { latitude: 37.6, longitude: 127.1 }] }] },
  ],
};
