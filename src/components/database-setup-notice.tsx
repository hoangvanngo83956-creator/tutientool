import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function DatabaseSetupNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Cần cấu hình Supabase</p>
          <p className="mt-1 leading-6">{message}</p>
          <p className="mt-2 leading-6">
            Tạo `.env.local` từ `.env.example`, rồi chạy migration{" "}
            <Link className="font-semibold underline" href="/settings">
              trong phần Cài đặt
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
