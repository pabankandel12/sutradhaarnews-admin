import type { Metadata } from "next"; import "./globals.css"; import "./editor.css"; import "./newsroom.css"; import "./language.css";
import { LanguageProvider } from "@/components/language-provider";
export const metadata: Metadata = {
  title:"सूत्रधार न्युजरुम",
  description:"सूत्रधार न्यूज सम्पादकीय व्यवस्थापन",
  icons: {
    icon: [{ url: "https://sutradhaarnews.vercel.app/logo.png", type: "image/png" }],
    shortcut: ["https://sutradhaarnews.vercel.app/logo.png"],
    apple: [{ url: "https://sutradhaarnews.vercel.app/logo.png", type: "image/png" }],
  },
};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="ne"><body><LanguageProvider>{children}</LanguageProvider></body></html>; }
