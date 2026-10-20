// Country codes supported by the signup flow. Do not infer nationality from UI language.
const COUNTRY_CURRENCIES = {
  US: 'USD', JP: 'JPY', CN: 'CNY', TH: 'THB', VN: 'VND',
} as const;

export type MenuExchangeCurrency = typeof COUNTRY_CURRENCIES[keyof typeof COUNTRY_CURRENCIES];

export function getMenuExchangeCurrency(country: string | null | undefined): MenuExchangeCurrency | null {
  const code = country?.trim().toUpperCase();
  if (!code || !Object.prototype.hasOwnProperty.call(COUNTRY_CURRENCIES, code)) return null;
  return COUNTRY_CURRENCIES[code as keyof typeof COUNTRY_CURRENCIES];
}
