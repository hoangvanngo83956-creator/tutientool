# Tu Tien Content Engine

MVP Next.js cho upload truyện tu tiên/tiên hiệp dạng `.txt`, tách chương theo `Chương 1`, `Chương 2`, `Chapter 1`, lưu vào Supabase PostgreSQL và đọc lại nội dung.

## Chạy local

```bash
npm install
npm run dev
```

Tạo `.env.local` từ `.env.example`, sau đó chạy SQL trong `supabase/migrations/001_create_novels_chapters.sql` trên Supabase SQL Editor.

## Giai đoạn 1

- Dashboard cơ bản
- Upload file `.txt`
- Tự tách chương theo heading `Chương N` hoặc `Chapter N`
- Lưu bảng `novels` và `chapters`
- Xem danh sách truyện, danh sách chương, và đọc nội dung chương
- Chưa tích hợp AI
