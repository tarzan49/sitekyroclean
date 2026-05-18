import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationPT from './locales/pt/translation.json';

const resources = {
  pt: {
    translation: translationPT,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    lng: 'pt',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
