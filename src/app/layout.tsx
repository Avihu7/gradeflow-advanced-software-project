import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

// Heebo is a Google Font with full Hebrew + Latin coverage, designed for
// UI use - a good match for a Hebrew-first admin product.
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "GradeFlow - מערכת ניהול הערכה בית ספרית",
  description: "מערכת לניהול מודול הערכה בית ספרי - ציונים, הערכות ותעודות",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html dir="rtl" lang="he" className={`${heebo.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
