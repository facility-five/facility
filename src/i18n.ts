import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslations from './locales/es.json';

const resources = {
  es: {
    translation: esTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma padrão
    fallbackLng: 'es',
    
    interpolation: {
      escapeValue: false // react já faz escape por padrão
    },
    
    // Configurações para desenvolvimento
    debug: false,
    
    // Configurações de namespace
    defaultNS: 'translation',
    ns: ['translation']
  });

export default i18n;