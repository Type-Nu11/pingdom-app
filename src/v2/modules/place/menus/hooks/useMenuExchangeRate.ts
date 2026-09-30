import type { MenuExchangeCurrency } from '../model/menuExchangeCurrency';
import { useQuery } from '@tanstack/react-query';
import { getMenuExchangeRate, MENU_EXCHANGE_CACHE_MS } from '../api/menuExchangeRateApi';

export function useMenuExchangeRate(quote: MenuExchangeCurrency | null, enabled: boolean) {
  return useQuery({
    queryKey: ['menu-exchange-rate', 'blended', 'KRW', quote],
    queryFn: () => {
      if (!quote) throw new Error('No user currency available');
      return getMenuExchangeRate(quote);
    },
    enabled: enabled && quote !== null,
    staleTime: MENU_EXCHANGE_CACHE_MS,
    gcTime: MENU_EXCHANGE_CACHE_MS,
    retry: false,
  });
}
