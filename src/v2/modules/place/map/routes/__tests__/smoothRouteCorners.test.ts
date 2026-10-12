import { smoothRouteCorners } from '../../native/model/smoothRouteCorners';

const meters = Math.PI * 6_371_000 / 180;

test('rounds a right-angle bend while preserving endpoints and immutable provider geometry', () => {
  const path = [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.001 }, { lat: 0.001, lng: 0.001 }];
  path.forEach(Object.freeze); Object.freeze(path);
  const rounded = smoothRouteCorners(path)!;
  expect(rounded).toHaveLength(11);
  expect(rounded[0]).toBe(path[0]);
  expect(rounded.at(-1)).toBe(path.at(-1));
  expect(rounded).not.toContain(path[1]);
  // Curve entry/exit trim only 6 m; even the midpoint remains within 3 m of a road segment.
  expect((0.001 - rounded[1].lng) * meters).toBeCloseTo(6);
  expect(rounded.at(-2)!.lat * meters).toBeCloseTo(6);
  for (const point of rounded.slice(1, -1)) {
    const deviation = Math.min(Math.abs(point.lat), Math.abs(0.001 - point.lng)) * meters;
    expect(deviation).toBeLessThanOrEqual(3);
  }
  const curve = rounded.slice(1, -1);
  for (let i = 1; i < curve.length; i += 1) {
    expect(curve[i].lat).toBeGreaterThan(curve[i - 1].lat);
    expect(curve[i].lng).toBeGreaterThan(curve[i - 1].lng);
  }
  expect(path[1]).toEqual({ lat: 0, lng: 0.001 });
});

test('short adjacent bends retain a straight section instead of overlapping or reversing', () => {
  const path = [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.00001 }, { lat: 0.00001, lng: 0.00001 }, { lat: 0.00001, lng: 0.00002 }];
  const rounded = smoothRouteCorners(path)!;
  expect(rounded).toHaveLength(20);
  expect(rounded[9].lat).toBeCloseTo(0.0000025, 9);
  expect(rounded[10].lat).toBeCloseTo(0.0000075, 9);
});

test.each([
  [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.001 }, { lat: 0, lng: 0.002 }],
  [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.001 }, { lat: 0, lng: 0 }],
  [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0.001, lng: 0 }],
  [{ lat: 0, lng: 179.999 }, { lat: 0, lng: -179.999 }, { lat: 0.001, lng: -179.999 }],
])('retains straight lines, reversals, duplicate fixes and dateline crossings: %j', (...path) => {
  expect(smoothRouteCorners(path)).toEqual(path);
});

test('does not repair invalid or incomplete input into a misleading route', () => {
  const invalid = [{ lat: 0, lng: 0 }, { lat: NaN, lng: 0 }, { lat: 0.001, lng: 0.001 }];
  expect(smoothRouteCorners(invalid)).toBe(invalid);
  expect(smoothRouteCorners(undefined)).toBeUndefined();
  expect(smoothRouteCorners([])).toEqual([]);
});
