"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AdminLocale = "ne" | "en";
const ne: Record<string, string> = {
  dashboard: "ड्यासबोर्ड", articles: "समाचार", newArticle: "नयाँ समाचार", review: "सम्पादकीय समीक्षा", homepage: "गृहपृष्ठ", headlines: "शीर्षक", categories: "श्रेणी", media: "मिडिया", galleries: "फोटो ग्यालरी", tags: "ट्याग", comments: "प्रतिक्रिया", ads: "विज्ञापन", users: "प्रयोगकर्ता", newsroom: "सूत्रधार न्युजरुम", editorialDesk: "सम्पादकीय डेस्क", signOut: "लगआउट", language: "भाषा", nepali: "नेपाली", english: "English", draft: "मस्यौदा", inReview: "समीक्षामा", approved: "स्वीकृत", published: "प्रकाशित", changesRequested: "सुधार आवश्यक", scheduled: "तालिकाबद्ध", archived: "अभिलेख", login: "सुरक्षित लगइन", welcome: "न्युजरुममा स्वागत छ", email: "इमेल ठेगाना", password: "पासवर्ड",
};
const en: Record<string, string> = {
  dashboard: "Dashboard", articles: "Articles", newArticle: "New article", review: "Editorial review", homepage: "Homepage", headlines: "Headlines", categories: "Categories", media: "Media", galleries: "Photo galleries", tags: "Tags", comments: "Comments", ads: "Advertisements", users: "Users", newsroom: "Sutradhaar Newsroom", editorialDesk: "Editorial desk", signOut: "Sign out", language: "Language", nepali: "नेपाली", english: "English", draft: "Draft", inReview: "In review", approved: "Approved", published: "Published", changesRequested: "Changes requested", scheduled: "Scheduled", archived: "Archived", login: "Secure sign in", welcome: "Welcome to the newsroom", email: "Email address", password: "Password",
};

type LanguageContextValue = { locale: AdminLocale; setLocale: (locale: AdminLocale) => void; t: (key: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AdminLocale>("ne");
  useEffect(() => { const saved = window.localStorage.getItem("sutradhaar_admin_locale"); if (saved === "en" || saved === "ne") setLocale(saved); }, []);
  const value = useMemo(() => ({ locale, setLocale: (next: AdminLocale) => { setLocale(next); window.localStorage.setItem("sutradhaar_admin_locale", next); document.documentElement.lang = next; }, t: (key: string) => (locale === "ne" ? ne : en)[key] || key }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("useLanguage must be used within LanguageProvider"); return value; }
export function LanguageSwitcher() { const { locale, setLocale, t } = useLanguage(); return <label className="language-switcher"><span className="sr-only">{t("language")}</span><select value={locale} onChange={(event) => setLocale(event.target.value as AdminLocale)} aria-label={t("language")}><option value="ne">नेपाली</option><option value="en">English</option></select></label>; }
