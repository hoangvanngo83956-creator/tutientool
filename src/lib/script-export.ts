import type { VideoScript, VideoScriptScene } from "@/lib/module4-types";

export function formatScriptExport(script: VideoScript, scenes: VideoScriptScene[]) {
  const sceneText = scenes.map((scene) => `Scene ${scene.scene_index}: ${scene.start_time} - ${scene.end_time}\nVisual:\n${scene.visual_description || ""}\nVoice:\n${scene.voice_text || ""}\nImage Prompt:\n${scene.image_prompt || ""}\nVideo Prompt:\n${scene.video_prompt || ""}\nXianxia Visual Elements:\n${(scene.xianxia_visual_elements || []).join(", ")}\nNegative Prompt:\n${scene.negative_prompt || ""}\nSource:\n${JSON.stringify(scene.source_reference || [])}`).join("\n\n");
  return `TITLE:\n${script.title}\n\nVIDEO TYPE:\n${script.video_type}\n\nDURATION:\n${script.duration_seconds}s\n\nHOOK:\n${script.hook}\n\nVOICE-OVER:\n${script.voice_over}\n\nSCENE BREAKDOWN:\n${sceneText}\n\nCAPTION:\n${script.caption || ""}\n\nHASHTAGS:\n${(script.hashtags_json || []).join(" ")}\n\nSOURCE REFERENCES:\n${JSON.stringify(script.source_references_json || [], null, 2)}\n\nFACT CHECK:\n${script.fact_check_status}`;
}

