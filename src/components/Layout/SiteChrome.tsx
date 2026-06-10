"use client";

import { usePathname } from "next/navigation";

import DeferredClientWidgets from "@/components/DeferredClientWidgets";
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";
import MainPadding from "@/components/Layout/MainPadding";
import SocialSidebar from "@/components/Layout/SocialSidebar";

type Props = {
  children: React.ReactNode;
  gaId?: string;
};

function isUtilityRoute(pathname?: string | null) {
  return (
    pathname?.startsWith("/content-admin") ||
    pathname?.startsWith("/x-hub") ||
    pathname?.startsWith("/crm")
  );
}

export default function SiteChrome({ children, gaId }: Props) {
  const pathname = usePathname();

  if (isUtilityRoute(pathname)) {
    return (
      <main id="main" className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main id="main" className="min-h-screen">
        <MainPadding />
        {children}
      </main>
      <Footer />
      <SocialSidebar />
      <DeferredClientWidgets gaId={gaId} />
    </>
  );
}
