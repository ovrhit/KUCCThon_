"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/shared/BottomNavigation";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isImmersive = pathname.startsWith("/record");

  return (
    <>
      <main className={isImmersive ? "" : "pb-20"}>{children}</main>
      {!isImmersive ? <BottomNavigation /> : null}
    </>
  );
}
