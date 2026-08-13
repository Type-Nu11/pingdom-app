export type ActivityIntent =
  | 'EXPLORE'
  | 'EAT'
  | 'CAFE'
  | 'SHOP'
  | 'ATTEND_EVENT'
  | 'NIGHTLIFE';

export type CurrentActivityIntent = {
  expiresAt?: string | null;
  intent?: ActivityIntent | null;
};

export type ReplaceCurrentActivityIntentBody = {
  intent: ActivityIntent;
};
