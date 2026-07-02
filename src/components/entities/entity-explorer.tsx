"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Search, Trash2, XCircle } from "lucide-react";
import { ENTITY_TYPES, type Entity, type EntityStatus, type EntityType } from "@/lib/module3-types";

const LABELS: Record<string, string> = { all: "Tất cả", character: "Nhân vật", item: "Vật phẩm", technique: "Công pháp", realm: "Cảnh giới", sect: "Tông môn", location: "Địa danh", event: "Sự kiện", other: "Khác" };

export function EntityExplorer({ novelId, initialEntities }: { novelId: string; initialEntities: Entity[] }) {
  const [entities, setEntities] = useState(initialEntities);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<EntityType | "all">("all");
  const [isPending, startTransition] = useTransition();
  const filtered = useMemo(() => entities.filter((entity) => (type === "all" || entity.entity_type === type) && (!query || entity.name.toLocaleLowerCase("vi-VN").includes(query.toLocaleLowerCase("vi-VN")))), [entities, query, type]);

  function editEntity(entity: Entity) {
    const description = window.prompt("Sửa mô tả entity", entity.description || "");
    if (description == null) return;
    startTransition(async () => {
      const res = await fetch(`/api/novels/${novelId}/entities/${entity.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description }) });
      if (res.ok) setEntities((items) => items.map((item) => item.id === entity.id ? { ...item, description } : item));
    });
  }
  function patchEntity(id: string, status: EntityStatus) {
    startTransition(async () => {
      const res = await fetch(`/api/novels/${novelId}/entities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) setEntities((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    });
  }
  function removeEntity(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/novels/${novelId}/entities/${id}`, { method: "DELETE" });
      if (res.ok) setEntities((items) => items.filter((item) => item.id !== id));
    });
  }

  return <div className="space-y-4"><EntityFilterBar query={query} type={type} onQueryChange={setQuery} onTypeChange={setType} />{isPending ? <p className="text-sm text-zinc-500">Đang cập nhật...</p> : null}<div className="grid gap-3 xl:grid-cols-2">{filtered.map((entity) => <EntityCard key={entity.id} novelId={novelId} entity={entity} onVerify={() => patchEntity(entity.id, "verified")} onReject={() => patchEntity(entity.id, "rejected")} onEdit={() => editEntity(entity)} onDelete={() => removeEntity(entity.id)} />)}</div>{filtered.length === 0 ? <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-zinc-500">Chưa có entity phù hợp.</div> : null}</div>;
}

export function EntityFilterBar({ query, type, onQueryChange, onTypeChange }: { query: string; type: EntityType | "all"; onQueryChange: (v: string) => void; onTypeChange: (v: EntityType | "all") => void }) { return <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-panel md:grid-cols-[1fr_220px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input className="h-10 w-full rounded-md border border-line pl-10 pr-3 text-sm" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tìm entity theo tên..." /></div><select className="h-10 rounded-md border border-line px-3 text-sm" value={type} onChange={(e) => onTypeChange(e.target.value as any)}>{["all", ...ENTITY_TYPES].map((item) => <option key={item} value={item}>{LABELS[item]}</option>)}</select></section>; }
export function EntityCard({ novelId, entity, onVerify, onReject, onEdit, onDelete }: { novelId: string; entity: Entity; onVerify: () => void; onReject: () => void; onEdit: () => void; onDelete: () => void }) { return <article className="rounded-lg border border-line bg-white p-5 shadow-panel"><div className="flex items-start justify-between gap-3"><div><span className="rounded-md bg-jade-50 px-2.5 py-1 text-xs font-semibold text-jade-800">{LABELS[entity.entity_type]}</span><h3 className="mt-3 text-lg font-semibold text-ink">{entity.name}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{entity.description || "Không đủ dữ kiện trong nguyên tác"}</p></div><span className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-zinc-600">{entity.status}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs text-zinc-500"><span>Evidence: {entity.evidence_count ?? 0}</span><span>Confidence: {Number(entity.confidence_score).toFixed(2)}</span><span>First: {entity.first_appearance_chapter || "?"}</span></div><div className="mt-4 flex flex-wrap gap-2"><Link href={`/novels/${novelId}/entities/${entity.id}`} className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white"><Eye className="h-4 w-4" />Chi tiết</Link><button onClick={onVerify} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4" />Verify</button><button onClick={onReject} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink"><XCircle className="h-4 w-4" />Reject</button><button onClick={onEdit} className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink">Edit</button><button onClick={onDelete} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-100 px-3 text-sm font-semibold text-red-600"><Trash2 className="h-4 w-4" />Delete</button></div></article>; }