
"use client";

import { useMemo, useState, useTransition } from "react";
import { Clipboard, ImageIcon, ListVideo, Loader2, PlaySquare, Search, Sparkles, SplitSquareVertical, Upload } from "lucide-react";
import type { YouTubeVideo } from "@/lib/module6-types";

const tabs = ["Long-form Generator", "Shorts Generator", "Repurpose", "SEO Package", "Thumbnail Studio", "Playlist Planner", "Upload Checklist"] as const;

type RunFn = (fn: () => Promise<any>, ok: string) => void;

export function YouTubeStudioPage({ novelId, initialVideos }: { novelId: string; initialVideos: YouTubeVideo[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [videos, setVideos] = useState(initialVideos);
  const [msg, setMsg] = useState("");
  const [loading, start] = useTransition();

  async function refresh() {
    const payload = await fetch(`/api/novels/${novelId}/youtube/videos`).then((response) => response.json());
    setVideos(payload.videos || []);
  }

  function run(fn: () => Promise<any>, ok: string) {
    setMsg("");
    start(async () => {
      try {
        const payload = await fn();
        if (payload?.error) throw new Error(payload.error);
        setMsg(ok);
        await refresh();
      } catch (error) {
        setMsg(error instanceof Error ? error.message : "Có lỗi");
      }
    });
  }

  return (
    <div className="space-y-5">
      <YouTubeStudioTabs value={tab} onChange={setTab} />
      {loading ? <LoadingState /> : null}
      {msg ? <div className="rounded-md border border-line bg-white p-3 text-sm">{msg}</div> : null}
      {tab === "Long-form Generator" ? <LongFormGeneratorPanel novelId={novelId} run={run} /> : null}
      {tab === "Shorts Generator" ? <YouTubeShortsGeneratorPanel novelId={novelId} videos={videos} run={run} /> : null}
      {tab === "Repurpose" ? <RepurposeLongFormPanel novelId={novelId} videos={videos} run={run} /> : null}
      {tab === "SEO Package" ? <YouTubeSeoPackagePanel novelId={novelId} videos={videos} run={run} /> : null}
      {tab === "Thumbnail Studio" ? <ThumbnailStudioPanel novelId={novelId} videos={videos} run={run} /> : null}
      {tab === "Playlist Planner" ? <PlaylistPlannerPanel novelId={novelId} run={run} /> : null}
      {tab === "Upload Checklist" ? <YouTubeUploadChecklistPanel novelId={novelId} videos={videos} run={run} /> : null}
      <YouTubeVideoList videos={videos} />
    </div>
  );
}

export function YouTubeStudioTabs({ value, onChange }: { value: string; onChange: (value: any) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-white p-2 shadow-panel">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => onChange(tab)} className={`h-10 rounded-md px-3 text-sm font-semibold ${value === tab ? "bg-ink text-white" : "text-zinc-600 hover:bg-zinc-50"}`}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function SelectVideo({ videos, value, onChange }: { videos: YouTubeVideo[]; value: string; onChange: (value: string) => void }) {
  return (
    <select className="h-10 rounded-md border border-line px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Chọn YouTube video</option>
      {videos.map((video) => (
        <option key={video.id} value={video.id}>{video.title} ({video.video_format})</option>
      ))}
    </select>
  );
}

export function LongFormGeneratorPanel({ novelId, run }: { novelId: string; run: RunFn }) {
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(10);
  return (
    <Panel title="YouTube Long-form Generator" icon={PlaySquare}>
      <LongFormInputForm topic={topic} setTopic={setTopic} minutes={minutes} setMinutes={setMinutes} />
      <button onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/generate-long-form`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, video_type: "lore_explainer", duration_target_minutes: minutes, audience_level: "newbie", tone: "mysterious", style: "cinematic_narration", structure_type: "lore_analysis" }) }).then((response) => response.json()), "Đã tạo long-form YouTube.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white">
        Generate Long-form
      </button>
    </Panel>
  );
}

export function LongFormInputForm({ topic, setTopic, minutes, setMinutes }: any) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_150px]">
      <input className="h-10 rounded-md border border-line px-3 text-sm" placeholder="Chủ đề video dài..." value={topic} onChange={(event) => setTopic(event.target.value)} />
      <select className="h-10 rounded-md border border-line px-3 text-sm" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
        {[5, 8, 10, 15, 20].map((minute) => <option key={minute} value={minute}>{minute} phút</option>)}
      </select>
    </div>
  );
}

export function YouTubeShortsGeneratorPanel({ novelId, videos, run }: { novelId: string; videos: YouTubeVideo[]; run: RunFn }) {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  return (
    <Panel title="YouTube Shorts Generator" icon={SplitSquareVertical}>
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <input className="h-10 w-full rounded-md border border-line px-3 text-sm" placeholder="Chủ đề Shorts..." value={topic} onChange={(event) => setTopic(event.target.value)} />
        <SelectVideo videos={videos} value={script} onChange={setScript} />
      </div>
      <button onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/generate-short`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, selected_script_id: script || null, duration_seconds: 60, tone: "fast_viral", visual_style_preset: "xianxia_cinematic" }) }).then((response) => response.json()), "Đã tạo YouTube Shorts.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white">
        Generate Short
      </button>
    </Panel>
  );
}

export function RepurposeLongFormPanel({ novelId, videos, run }: { novelId: string; videos: YouTubeVideo[]; run: RunFn }) {
  const [id, setId] = useState("");
  return <Panel title="Repurpose Long-form to Shorts" icon={SplitSquareVertical}><SelectVideo videos={videos.filter((video) => video.video_format === "long_form")} value={id} onChange={setId} /><button disabled={!id} onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/${id}/repurpose-to-shorts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number_of_shorts: 8, duration_seconds: 60, strategy: "mixed" }) }).then((response) => response.json()), "Đã tạo shorts cutdowns.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white disabled:bg-zinc-300">Generate Shorts</button></Panel>;
}

export function YouTubeSeoPackagePanel({ novelId, videos, run }: { novelId: string; videos: YouTubeVideo[]; run: RunFn }) {
  const [id, setId] = useState("");
  return <Panel title="SEO Package" icon={Search}><SelectVideo videos={videos} value={id} onChange={setId} /><button disabled={!id} onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/${id}/seo/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title_style: "seo_balanced", description_style: "analysis" }) }).then((response) => response.json()), "Đã tạo SEO package.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white disabled:bg-zinc-300">Generate SEO</button></Panel>;
}

export function ThumbnailStudioPanel({ novelId, videos, run }: { novelId: string; videos: YouTubeVideo[]; run: RunFn }) {
  const [id, setId] = useState("");
  return <Panel title="Thumbnail Studio" icon={ImageIcon}><SelectVideo videos={videos} value={id} onChange={setId} /><button disabled={!id} onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/${id}/thumbnails/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ thumbnail_style: "dramatic_character", emotion_angle: "mystery", visual_style_preset: "xianxia_cinematic" }) }).then((response) => response.json()), "Đã tạo thumbnail concepts.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white disabled:bg-zinc-300">Generate Thumbnails</button></Panel>;
}

export function PlaylistPlannerPanel({ novelId, run }: { novelId: string; run: RunFn }) {
  return <Panel title="Playlist Planner" icon={ListVideo}><button onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/playlists/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playlist_type: "lore_playlist", number_of_videos: 10, target_audience: "newbie", order_strategy: "beginner_to_advanced" }) }).then((response) => response.json()), "Đã tạo playlist.")} className="h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white">Generate Playlist</button></Panel>;
}

export function YouTubeUploadChecklistPanel({ novelId, videos, run }: { novelId: string; videos: YouTubeVideo[]; run: RunFn }) {
  const [id, setId] = useState("");
  return <Panel title="Upload Checklist" icon={Upload}><SelectVideo videos={videos} value={id} onChange={setId} /><button disabled={!id} onClick={() => run(() => fetch(`/api/novels/${novelId}/youtube/videos/${id}/upload-checklist/generate`, { method: "POST" }).then((response) => response.json()), "Đã tạo upload checklist.")} className="mt-3 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white disabled:bg-zinc-300">Generate Checklist</button></Panel>;
}

function YouTubeVideoList({ videos }: { videos: YouTubeVideo[] }) {
  return (
    <section className="grid gap-4">
      {videos.map((video) => <YouTubeVideoCard key={video.id} video={video} />)}
      {!videos.length ? <EmptyState text="Chưa có video YouTube." /> : null}
    </section>
  );
}

function YouTubeVideoCard({ video }: { video: YouTubeVideo }) {
  const [open, setOpen] = useState(true);
  const data = useMemo(() => collectVideoDisplayData(video), [video]);
  const fullExport = buildExportText(video, data);

  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">{video.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{video.video_format} · {video.video_type} · fact {video.fact_check_status} · visual {video.visual_check_status}</p>
          {video.hook ? <p className="mt-2 text-sm text-zinc-700">{video.hook}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton label="Copy package" value={fullExport} />
          <button onClick={() => setOpen((value) => !value)} className="h-9 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700">{open ? "Thu gọn" : "Xem prompt"}</button>
        </div>
      </div>

      {open ? (
        <div className="mt-4 grid gap-4">
          <OutputBlock title="Hook" value={video.hook || data.hook} />
          <OutputBlock title="Script / Voice-over" value={video.script_text || data.scriptText} large />
          {data.sections.length ? <SectionList sections={data.sections} /> : null}
          {data.scenePrompts.length ? <PromptList title="Image / Video Prompts" items={data.scenePrompts} /> : null}
          {data.thumbnailPrompts.length ? <PromptList title="Thumbnail Prompts" items={data.thumbnailPrompts} /> : null}
          {data.seoText ? <OutputBlock title="SEO Package" value={data.seoText} large /> : null}
          {data.sourceText ? <OutputBlock title="Source References" value={data.sourceText} /> : null}
        </div>
      ) : null}
    </article>
  );
}

function SectionList({ sections }: { sections: any[] }) {
  return (
    <div className="rounded-lg border border-line bg-zinc-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold text-ink">Sections / Visual Direction</h4><CopyButton label="Copy sections" value={sections.map(formatSection).join("\n\n")} /></div>
      <div className="grid gap-3">
        {sections.map((section, index) => <pre key={index} className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm leading-6 text-zinc-800">{formatSection(section)}</pre>)}
      </div>
    </div>
  );
}

function PromptList({ title, items }: { title: string; items: { title: string; value: string }[] }) {
  return (
    <div className="rounded-lg border border-line bg-zinc-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2"><h4 className="font-semibold text-ink">{title}</h4><CopyButton label="Copy all" value={items.map((item) => `${item.title}:\n${item.value}`).join("\n\n")} /></div>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item, index) => <OutputBlock key={`${item.title}-${index}`} title={item.title} value={item.value} />)}
      </div>
    </div>
  );
}

function OutputBlock({ title, value, large }: { title: string; value?: string | null; large?: boolean }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><h4 className="text-sm font-semibold text-ink">{title}</h4><CopyButton label="Copy" value={value} /></div>
      <pre className={`whitespace-pre-wrap text-sm leading-6 text-zinc-700 ${large ? "max-h-[520px] overflow-auto" : ""}`}>{value}</pre>
    </div>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(value || ""); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }} className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-xs font-semibold text-zinc-700 hover:border-jade-700 hover:text-jade-700">
      <Clipboard className="h-3.5 w-3.5" /> {copied ? "Đã copy" : label}
    </button>
  );
}

function collectVideoDisplayData(video: YouTubeVideo) {
  const script = video.script_json || {};
  const sections = Array.isArray(script.sections) ? script.sections : [];
  const scenes = Array.isArray(script.scenes) ? script.scenes : [];
  const scenePrompts = scenes.flatMap((scene: any, index: number) => [
    scene.image_prompt ? { title: `Scene ${scene.scene_index || index + 1} image_prompt`, value: String(scene.image_prompt) } : null,
    scene.video_prompt ? { title: `Scene ${scene.scene_index || index + 1} video_prompt`, value: String(scene.video_prompt) } : null,
    scene.negative_prompt ? { title: `Scene ${scene.scene_index || index + 1} negative_prompt`, value: String(scene.negative_prompt) } : null
  ].filter(Boolean) as { title: string; value: string }[]);

  if (script.image_prompt) scenePrompts.push({ title: "Short image_prompt", value: String(script.image_prompt) });
  if (script.video_prompt) scenePrompts.push({ title: "Short video_prompt", value: String(script.video_prompt) });

  const thumbnailPrompts = normalizePromptArray(video.thumbnail_prompts_json).concat(normalizePromptArray(script.thumbnail_concepts));
  const seo = video.seo_metadata_json && Object.keys(video.seo_metadata_json).length ? video.seo_metadata_json : script.seo_package;
  const seoText = seo && Object.keys(seo).length ? formatJsonLike(seo) : "";
  const sourceText = normalizePromptArray(video.source_references_json).map((item) => item.value).join("\n\n");
  const scriptText = [script.hook, script.intro, ...sections.map((section: any) => section.script_text), script.conclusion, script.call_to_action, script.short_script].filter(Boolean).join("\n\n");

  return { hook: script.hook || "", scriptText, sections, scenePrompts, thumbnailPrompts, seoText, sourceText };
}

function normalizePromptArray(value: any): { title: string; value: string }[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.map((item, index) => {
    if (typeof item === "string") return { title: `Prompt ${index + 1}`, value: item };
    const title = item.title || item.scene_title || item.concept_summary || `Prompt ${index + 1}`;
    const parts = [item.image_prompt, item.video_prompt, item.negative_prompt ? `Negative prompt: ${item.negative_prompt}` : null, item.description, item.summary].filter(Boolean);
    return { title: String(title), value: parts.length ? parts.map(String).join("\n\n") : formatJsonLike(item) };
  }).filter((item) => item.value.trim());
}

function formatSection(section: any) {
  return [`${section.estimated_start_time || ""} - ${section.estimated_end_time || ""} ${section.section_title || "Section"}`.trim(), section.purpose ? `Purpose: ${section.purpose}` : null, section.script_text ? `Script:\n${section.script_text}` : null, section.visual_direction ? `Visual direction:\n${section.visual_direction}` : null, section.retention_hook ? `Retention hook: ${section.retention_hook}` : null].filter(Boolean).join("\n\n");
}

function formatJsonLike(value: any) {
  return JSON.stringify(value, null, 2);
}

function buildExportText(video: YouTubeVideo, data: ReturnType<typeof collectVideoDisplayData>) {
  return [`YOUTUBE VIDEO PACKAGE`, `TITLE:\n${video.title}`, `FORMAT:\n${video.video_format}`, `TYPE:\n${video.video_type}`, `HOOK:\n${video.hook || data.hook || ""}`, `SCRIPT:\n${video.script_text || data.scriptText || ""}`, data.sections.length ? `SECTIONS:\n${data.sections.map(formatSection).join("\n\n")}` : null, data.scenePrompts.length ? `IMAGE / VIDEO PROMPTS:\n${data.scenePrompts.map((item: { title: string; value: string }) => `${item.title}:\n${item.value}`).join("\n\n")}` : null, data.thumbnailPrompts.length ? `THUMBNAIL PROMPTS:\n${data.thumbnailPrompts.map((item: { title: string; value: string }) => `${item.title}:\n${item.value}`).join("\n\n")}` : null, data.seoText ? `SEO:\n${data.seoText}` : null, data.sourceText ? `SOURCE REFERENCES:\n${data.sourceText}` : null].filter(Boolean).join("\n\n---\n\n");
}

function Panel({ title, icon: Icon, children }: any) {
  return <section className="rounded-lg border border-line bg-white p-5 shadow-panel"><h2 className="mb-4 flex items-center gap-2 font-semibold text-ink"><Icon className="h-4 w-4" />{title}</h2>{children}</section>;
}

export function LongFormOutputViewer() { return null; }
export function SectionScriptCard() { return null; }
export function RetentionHookCard() { return null; }
export function YouTubeShortOutputViewer() { return null; }
export function ShortsSceneCard() { return null; }
export function ShortsCutdownCard() { return null; }
export function CutdownTimelinePreview() { return null; }
export function TitleVariantsCard() { return null; }
export function DescriptionViewer() { return null; }
export function ChaptersViewer() { return null; }
export function TagsViewer() { return null; }
export function PinnedCommentCard() { return null; }
export function ThumbnailConceptCard() { return null; }
export function ThumbnailPromptViewer() { return null; }
export function ThumbnailStyleSelector() { return null; }
export function PlaylistCard() { return null; }
export function PlaylistVideoOrderList() { return null; }
export function ChecklistCategoryCard() { return null; }
export function ChecklistStatusBadge() { return null; }
export function SourceReferenceList() { return null; }
export function WarningBox() { return null; }
export function ExportButton() { return null; }
function LoadingState() { return <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-600"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang xử lý...</div>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-zinc-500">{text}</div>; }
export function ErrorState() { return null; }
