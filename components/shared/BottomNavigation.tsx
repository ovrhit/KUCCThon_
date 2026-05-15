"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/profile", icon: User, label: "마이페이지" },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-[#F0E6D2] flex items-center justify-around px-4 z-50">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              isActive ? "text-[#4A3F35]" : "text-[#A69785]"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
