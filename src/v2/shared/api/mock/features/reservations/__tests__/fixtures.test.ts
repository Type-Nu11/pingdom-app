import { createAvailabilityListFixture } from '../fixtures';

describe('reservation availability mock fixture', () => {
  test('keeps every availability in the future relative to the supplied clock', () => {
    const now = new Date('2032-04-10T23:30:00.000Z');
    const fixtures = createAvailabilityListFixture(now);

    expect(fixtures.map((availability) => availability.productType))
      .toEqual(['GENERAL', 'GENERAL', 'TICKET', 'CLASS']);
    expect(fixtures.every((availability) => (
      new Date(availability.startsAt).getTime() > now.getTime()
      && new Date(availability.endsAt).getTime() > now.getTime()
    ))).toBe(true);
  });
});
