import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import dynamic from "next/dynamic";

const Sidebar = dynamic(
  () =>
    import("@/components/layout/sidebar").then((mod) => ({
      default: mod.Sidebar,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-4">
          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
    ),
  }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Risk Assessment Management System",
  description:
    "Professional risk assessment management system for manufacturing and construction industries",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
