import type { Metadata } from "next"; import "./globals.css";
export const metadata: Metadata = { title:"सूत्रधार न्युजरुम", description:"सूत्रधार न्यूज सम्पादकीय व्यवस्थापन" };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="ne"><body>{children}</body></html>; }
