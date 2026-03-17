"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// utils
import { localStorageGetItem } from "@/lib/utils/storage-available";
//
import { defaultLang } from "./config-lang";
//
import translationEn from "./langs/en.json";
import translationFr from "./langs/fr.json";
import translationVi from "./langs/vi.json";
import translationCn from "./langs/cn.json";
import translationAr from "./langs/ar.json";

// ----------------------------------------------------------------------

const lng =
  localStorageGetItem("i18nextLng", defaultLang.value) ||
  defaultLang.value ||
  "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: translationEn,
      fr: translationFr,
      vi: translationVi,
      cn: translationCn,
      ar: translationAr,
    },
    lng: lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
