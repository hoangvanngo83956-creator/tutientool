"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, UploadCloud } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/novels", label: "Truyện", icon: BookOpen }
];

export function MobileTopbar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 border-b border-line bg-white px-3 py-3 lg:hidden">
      <div className="mb-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-ink">
          Tu Tien Content Engine
        </Link>
      </div>
      <nav className="grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium",
                active ? "bg-jade-50 text-jade-800" : "text-zinc-600"
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
