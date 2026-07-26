import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";

// Dhivehi (dv) support was descoped for now — English only. If it comes
// back, restore the dv locale file + RTL direction toggle (see git history).

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
