"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Settings, UploadCloud } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/upload", label: "Upload truyện", icon: UploadCloud },
  { href: "/novels", label: "Truyện", icon: BookOpen },
  { href: "/settings", label: "Cài đặt", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen flex-col justify-between bg-white px-4 py-5 lg:flex">
      <div>
        <Link href="/" className="flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-jade-100 bg-jade-50 text-jade-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold leading-5 text-ink">Tu Tien</div>
            <div className="text-sm font-medium text-gold">Content Engine</div>
          </div>
        </Link>

        <nav className="mt-9 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-12 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  active
                    ? "bg-jade-50 text-jade-800"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-ink"
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-line bg-white p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-jade-600" />
            Kết nối Supabase
          </div>
          <p className="mt-1 text-xs text-zinc-500">Dùng server route bảo mật</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-3">
          <div className="text-sm font-semibold text-ink">Giai đoạn 1</div>
          <p className="mt-1 text-xs leading-5 text-zinc-500">Upload TXT, tách chương, lưu và đọc lại nguyên tác.</p>
        </div>
      </div>
    </aside>
  );
}
