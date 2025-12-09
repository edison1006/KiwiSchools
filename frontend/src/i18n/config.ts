import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import miTranslations from './locales/mi.json';
import zhTranslations from './locales/zh.json';
import koTranslations from './locales/ko.json';
import jaTranslations from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      mi: { translation: miTranslations },
      zh: { translation: zhTranslations },
      'zh-CN': { translation: zhTranslations },
      'zh-TW': { translation: zhTranslations },
      ko: { translation: koTranslations },
      'ko-KR': { translation: koTranslations },
      ja: { translation: jaTranslations },
      'ja-JP': { translation: jaTranslations },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'mi', 'zh', 'zh-CN', 'zh-TW', 'ko', 'ko-KR', 'ja', 'ja-JP'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

