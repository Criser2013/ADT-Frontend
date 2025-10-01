import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import textos from "./src/assets/textos/textos.json";

i18n.
  use(LanguageDetector).
  use(initReactI18next).
  init({
    resources: textos,
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;