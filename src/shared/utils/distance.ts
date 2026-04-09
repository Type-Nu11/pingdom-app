export const distance = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
};
