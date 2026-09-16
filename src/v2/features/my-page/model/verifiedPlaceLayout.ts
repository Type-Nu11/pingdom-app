export const VERIFIED_PLACE_CARD_WIDTH = 177;
export const VERIFIED_PLACE_CARD_HEIGHT = 222;
export const VERIFIED_PLACE_GRID_GAP = 12;
export const VERIFIED_PLACE_GRID_PADDING = 24;

/** null means the list has not received a usable layout; never render a zero-width card. */
export function getVerifiedPlaceGridCardWidth(listWidth: number): number | null {
  const available = listWidth - VERIFIED_PLACE_GRID_PADDING * 2 - VERIFIED_PLACE_GRID_GAP;
  if (!Number.isFinite(available) || available < 2) return null;
  return available / 2;
}
