"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Clipboard, FileText, Loader2, Sparkles } from "lucide-react";
import { SCRIPT_DURATIONS, SCRIPT_STYLES, SCRIPT_TONES, VIDEO_TYPES, VISUAL_STYLE_PRESETS, type GeneratedScriptPayload } from "@/lib/module4-types";
import type { Entity } from "@/lib/module3-types";

type NoteOption = { id: string; title: string; note_type: string; content: string };
type ReportOption = { id: string; title: string; report_type: string; summary: string | null };
type GenerateResponse = { script_id?: string; fact_check_status?: string; title?: string; warnings?: string[]; error?: string };

const LABELS: Record<string, string> = { character_analysis: "Phân tích nhân vật", item_analysis: "Phân tích vật phẩm", technique_analysis: "Phân tích công pháp", realm_explanation: "Giải thích cảnh giới", sect_explanation: "Tông môn", location_explanation: "Địa danh", event_recap: "Tóm tắt sự kiện", comparison: "So sánh", hidden_detail: "Chi tiết ẩn", top_list: "Top list", custom: "Custom", mysterious: "Bí ẩn", dramatic: "Kịch tính", epic: "Sử thi", fast_viral: "Nhanh viral", storyteller: "Kể chuyện", analytical: "Phân tích", dark: "U tối", emotional: "Cảm xúc", xianxia_cinematic: "Tu tiên điện ảnh", dark_cultivation: "Ma tu u tối", immortal_mountain: "Tiên sơn linh khí", ancient_sect: "Tông môn cổ đại", mystical_artifact: "Pháp bảo huyền bí", sword_cultivator: "Kiếm tu", alchemy_cave: "Luyện đan động phủ", formation_array: "Trận pháp linh quang" };

export function ScriptGeneratorPage({ novelId, entities, notes, reports }: { novelId: string; entities: Entity[]; notes: NoteOption[]; reports: ReportOption[] }) {
  const [topic, setTopic] = useState("");
  const [sourceType, setSourceType] = useState("entity");
  const [entityIds, setEntityIds] = useState<string[]>([]);
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [reportId, setReportId] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [videoType, setVideoType] = useState("character_analysis");
  const [duration, setDuration] = useState(60);
  const [tone, setTone] = useState("mysterious");
  const [style, setStyle] = useState("tiktok_viral");
  const [audience, setAudience] = useState("newbie");
  const [special, setSpecial] = useState("");
  const [visualStylePreset, setVisualStylePreset] = useState("xianxia_cinematic");
  const [strictXianxia, setStrictXianxia] = useState(true);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedEntities = useMemo(() => entities.filter((entity) => entityIds.includes(entity.id)), [entities, entityIds]);
  const selectedNotes = useMemo(() => notes.filter((note) => noteIds.includes(note.id)), [notes, noteIds]);
  const selectedReport = reports.find((report) => report.id === reportId) || null;
  const evidenceCount = selectedEntities.reduce((sum, entity) => sum + (entity.evidence_count ?? 0), 0) + selectedNotes.length + (selectedReport ? 1 : 0) + (customQuery ? 1 : 0);

  function toggle(list: string[], value: string, setList: (items: string[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function generate() {
    setResult(null);
    startTransition(async () => {
      const response = await fetch(`/api/novels/${novelId}/scripts/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, source_type: sourceType, entity_ids: entityIds, research_note_ids: noteIds, ai_report_id: reportId || null, custom_query: customQuery, video_type: videoType, duration_seconds: duration, tone, style, audience_level: audience, special_requirements: special, visual_style_preset: visualStylePreset, strict_xianxia_visual_mode: strictXianxia }) });
      const payload = await response.json();
      setResult(payload);
    });
  }

  return <div className="grid gap-5 2xl:grid-cols-[360px_1fr_420px]"><ScriptInputPanel topic={topic} setTopic={setTopic} sourceType={sourceType} setSourceType={setSourceType} videoType={videoType} setVideoType={setVideoType} duration={duration} setDuration={setDuration} tone={tone} setTone={setTone} style={style} setStyle={setStyle} audience={audience} setAudience={setAudience} special={special} setSpecial={setSpecial} visualStylePreset={visualStylePreset} setVisualStylePreset={setVisualStylePreset} strictXianxia={strictXianxia} setStrictXianxia={setStrictXianxia} customQuery={customQuery} setCustomQuery={setCustomQuery} onGenerate={generate} loading={isPending} /><EvidencePreviewPanel evidenceCount={evidenceCount} entities={entities} notes={notes} reports={reports} selectedEntities={selectedEntities} selectedNotes={selectedNotes} selectedReport={selectedReport} entityIds={entityIds} noteIds={noteIds} reportId={reportId} toggleEntity={(id: string) => toggle(entityIds, id, setEntityIds)} toggleNote={(id: string) => toggle(noteIds, id, setNoteIds)} setReportId={setReportId} /><ScriptOutputPanel novelId={novelId} result={result} loading={isPending} /></div>;
}

export function ScriptInputPanel(props: any) { return <section className="rounded-lg border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold text-ink">Script Generator</h2><div className="mt-4 space-y-3"><TopicInput value={props.topic} onChange={props.setTopic} /><Select label="Nguồn dữ liệu" value={props.sourceType} onChange={props.setSourceType} options={["entity", "research_notes", "ai_report", "custom"]} /><VideoTypeSelector value={props.videoType} onChange={props.setVideoType} /><DurationSelector value={props.duration} onChange={props.setDuration} /><ToneSelector value={props.tone} onChange={props.setTone} /><StyleSelector value={props.style} onChange={props.setStyle} /><Select label="Audience" value={props.audience} onChange={props.setAudience} options={["newbie", "familiar_with_story", "hardcore_fan"]} /><VisualStylePresetSelector value={props.visualStylePreset} onChange={props.setVisualStylePreset} /><label className="flex items-center justify-between rounded-md border border-line p-3 text-sm"><span><span className="block font-semibold text-ink">Strict Tu Tiên Visual Mode</span><span className="text-xs text-zinc-500">Tự sửa prompt nếu thiếu xianxia/cultivation/spiritual energy hoặc dính modern/castle/sci-fi.</span></span><input type="checkbox" checked={props.strictXianxia} onChange={(e) => props.setStrictXianxia(e.target.checked)} /></label><div className="rounded-md bg-zinc-50 p-3 text-xs leading-5 text-zinc-600"><span className="font-semibold text-ink">Negative prompt mặc định:</span> modern city, modern clothing, cars, phones, computers, guns, western castle, knight armor, sci-fi, cyberpunk, text, logo, watermark</div><textarea className="min-h-20 w-full rounded-md border border-line p-3 text-sm" placeholder="Custom query hoặc yêu cầu đặc biệt..." value={props.customQuery} onChange={(e) => props.setCustomQuery(e.target.value)} /><textarea className="min-h-20 w-full rounded-md border border-line p-3 text-sm" placeholder="Yêu cầu đặc biệt" value={props.special} onChange={(e) => props.setSpecial(e.target.value)} /><GenerateScriptButton loading={props.loading} onClick={props.onGenerate} /></div></section>; }
export function TopicInput({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <input className="h-10 w-full rounded-md border border-line px-3 text-sm" placeholder="Chủ đề video..." value={value} onChange={(e) => onChange(e.target.value)} />; }
export function VideoTypeSelector(props: { value: string; onChange: (v: string) => void }) { return <Select label="Loại video" value={props.value} onChange={props.onChange} options={[...VIDEO_TYPES]} />; }
export function DurationSelector(props: { value: number; onChange: (v: number) => void }) { return <Select label="Thời lượng" value={String(props.value)} onChange={(v) => props.onChange(Number(v))} options={SCRIPT_DURATIONS.map(String)} />; }
export function ToneSelector(props: { value: string; onChange: (v: string) => void }) { return <Select label="Tone" value={props.value} onChange={props.onChange} options={[...SCRIPT_TONES]} />; }
export function StyleSelector(props: { value: string; onChange: (v: string) => void }) { return <Select label="Style" value={props.value} onChange={props.onChange} options={[...SCRIPT_STYLES]} />; }
export function VisualStylePresetSelector(props: { value: string; onChange: (v: string) => void }) { return <Select label="Visual Style Preset" value={props.value} onChange={props.onChange} options={[...VISUAL_STYLE_PRESETS]} />; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">{label}</span><select className="h-10 w-full rounded-md border border-line px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{LABELS[option] || option}</option>)}</select></label>; }
export function GenerateScriptButton({ loading, onClick }: { loading: boolean; onClick: () => void }) { return <button disabled={loading} onClick={onClick} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-jade-700 text-sm font-semibold text-white hover:bg-jade-800 disabled:bg-zinc-300">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Generate Script</button>; }

export function EvidencePreviewPanel(props: any) { return <section className="rounded-lg border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold text-ink">Evidence Preview</h2><p className="mt-2 text-sm text-zinc-600">Nguồn đang chọn: {props.evidenceCount}. {props.evidenceCount === 0 ? "Không đủ dữ kiện trong nguyên tác." : "Sẵn sàng tạo script."}</p><div className="mt-4 space-y-4"><EntitySelector entities={props.entities} selected={props.entityIds} onToggle={props.toggleEntity} /><ResearchNoteSelector notes={props.notes} selected={props.noteIds} onToggle={props.toggleNote} /><AIReportSelector reports={props.reports} value={props.reportId} onChange={props.setReportId} /></div></section>; }
export function EntitySelector({ entities, selected, onToggle }: { entities: Entity[]; selected: string[]; onToggle: (id: string) => void }) { return <div><p className="text-sm font-semibold text-ink">Entities</p><div className="mt-2 max-h-56 space-y-2 overflow-auto pr-1">{entities.map((entity) => <EvidenceCard key={entity.id} active={selected.includes(entity.id)} title={entity.name} meta={`${entity.entity_type} · evidence ${entity.evidence_count ?? 0}`} onClick={() => onToggle(entity.id)} />)}</div></div>; }
export function ResearchNoteSelector({ notes, selected, onToggle }: { notes: NoteOption[]; selected: string[]; onToggle: (id: string) => void }) { return <div><p className="text-sm font-semibold text-ink">Research Notes</p><div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">{notes.map((note) => <EvidenceCard key={note.id} active={selected.includes(note.id)} title={note.title} meta={note.note_type} onClick={() => onToggle(note.id)} />)}</div></div>; }
export function AIReportSelector({ reports, value, onChange }: { reports: ReportOption[]; value: string; onChange: (v: string) => void }) { return <label className="block"><span className="text-sm font-semibold text-ink">AI Report</span><select className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}><option value="">Không chọn</option>{reports.map((report) => <option key={report.id} value={report.id}>{report.title}</option>)}</select></label>; }
export function EvidenceCard({ active, title, meta, onClick }: { active: boolean; title: string; meta: string; onClick: () => void }) { return <button onClick={onClick} className={`w-full rounded-md border p-3 text-left text-sm ${active ? "border-jade-700 bg-jade-50" : "border-line bg-white hover:border-jade-300"}`}><span className="font-semibold text-ink">{title}</span><span className="mt-1 block text-xs text-zinc-500">{meta}</span></button>; }

export function ScriptOutputPanel({ novelId, result, loading }: { novelId: string; result: GenerateResponse | null; loading: boolean }) { return <section className="rounded-lg border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold text-ink">Output</h2>{loading ? <div className="mt-4 rounded-md bg-zinc-50 p-4 text-sm text-zinc-600"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tạo kịch bản và fact-check...</div> : null}{result?.error ? <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">{result.error}</div> : null}{result?.script_id ? <div className="mt-4 space-y-3"><HookCard text={result.title || "Script đã tạo"} /><ScriptFactCheckCard status={result.fact_check_status || "pending"} warnings={result.warnings || []} /><Link href={`/novels/${novelId}/scripts/${result.script_id}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white"><FileText className="h-4 w-4" />Mở script detail</Link></div> : !loading && !result ? <p className="mt-4 text-sm text-zinc-500">Kết quả sẽ xuất hiện ở đây sau khi generate.</p> : null}</section>; }
export function HookCard({ text }: { text: string }) { return <div className="rounded-md border border-line p-3"><p className="text-xs uppercase text-zinc-500">Title / Hook</p><p className="mt-1 font-semibold text-ink">{text}</p></div>; }
export function ScriptFactCheckCard({ status, warnings }: { status: string; warnings: string[] }) { return <div className="rounded-md border border-line p-3 text-sm"><p className="font-semibold text-ink">Fact check: {status}</p>{warnings.length > 0 ? <ul className="mt-2 list-disc pl-5 text-amber-700">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}</div>; }

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) { const [done, setDone] = useState(false); return <button className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-ink" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); }}><Clipboard className="h-3.5 w-3.5" />{done ? "Đã copy" : label}</button>; }
export function SaveScriptButton() { return null; }
export function RegenerateHookButton() { return null; }
export function RegenerateSceneButton() { return null; }
export function VoiceOverViewer() { return null; }
export function SceneList() { return null; }
export function SceneCard() { return null; }
export function ImagePromptCard() { return null; }
export function VideoPromptCard() { return null; }
export function CaptionCard() { return null; }
export function HashtagList() { return null; }
export function SourceReferenceList() { return null; }


