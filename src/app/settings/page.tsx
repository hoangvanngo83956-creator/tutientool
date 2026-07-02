import { Database, KeyRound, Table2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <h1 className="text-2xl font-semibold text-ink">Cài đặt</h1>
        <p className="mt-1 text-sm text-zinc-500">Thông tin cấu hình cần cho MVP giai đoạn 1.</p>
      </header>

      <main className="grid gap-5 px-6 pb-8 xl:grid-cols-3">
        <SetupCard
          icon={Database}
          title="Supabase project"
          body="Tạo project Supabase PostgreSQL, sau đó copy Project URL vào NEXT_PUBLIC_SUPABASE_URL."
        />
        <SetupCard
          icon={KeyRound}
          title="Server key"
          body="Đặt SUPABASE_SERVICE_ROLE_KEY trong .env.local. Key này chỉ dùng ở server route."
        />
        <SetupCard
          icon={Table2}
          title="Database schema"
          body="Chạy file supabase/migrations/001_create_novels_chapters.sql trong SQL Editor."
        />
      </main>
    </div>
  );
}

function SetupCard({
  icon: Icon,
  title,
  body
}: {
  icon: typeof Database;
  title: string;
  body: string;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-jade-50 text-jade-700">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
    </section>
  );
}
