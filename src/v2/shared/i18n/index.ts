import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
  lng: 'ko',
  resources,
});
