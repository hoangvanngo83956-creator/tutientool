import { XIANXIA_NEGATIVE_PROMPT, XIANXIA_VISUAL_PRESETS } from "@/lib/ai/prompts/xianxiaVisualStylePrompt";
import type { VisualStylePreset } from "@/lib/module4-types";

type ImagePromptInput = {
  sceneDescription: string;
  entityType?: string | null;
  entityName?: string | null;
  visualStylePreset: VisualStylePreset;
  evidenceDescription?: string;
  hasAppearanceEvidence?: boolean;
};

type VideoPromptInput = ImagePromptInput & {
  cameraMovement?: string;
  motionElements?: string[];
};

export function buildScriptPromptInput(input: unknown) { return input; }

export function buildXianxiaImagePrompt(input: ImagePromptInput) {
  const preset = XIANXIA_VISUAL_PRESETS[input.visualStylePreset] ?? XIANXIA_VISUAL_PRESETS.xianxia_cinematic;
  const subject = chooseSubject(input);
  const scene = input.sceneDescription || input.evidenceDescription || "a mysterious cultivation moment supported by original evidence";
  const image_prompt = `${capitalize(preset)} scene, Eastern immortal cultivation world, ${subject}, ${scene}, spiritual energy and qi aura swirling through the air, misty cultivation atmosphere, glowing runes or subtle formation light if appropriate, dramatic lighting, highly detailed, vertical 9:16 composition, no text, no logo, no watermark.`;
  return { image_prompt: cleanPrompt(image_prompt), negative_prompt: XIANXIA_NEGATIVE_PROMPT };
}

export function buildXianxiaVideoPrompt(input: VideoPromptInput) {
  const preset = XIANXIA_VISUAL_PRESETS[input.visualStylePreset] ?? XIANXIA_VISUAL_PRESETS.xianxia_cinematic;
  const subject = chooseSubject(input);
  const camera = input.cameraMovement || "slow camera push-in";
  const motion = input.motionElements?.length ? input.motionElements.join(", ") : "qi energy flowing, mist drifting, spiritual particles floating, glowing formation light pulsing softly";
  const scene = input.sceneDescription || input.evidenceDescription || "a mysterious cultivation moment supported by original evidence";
  const video_prompt = `Create a vertical 9:16 cinematic xianxia cultivation video in an Eastern immortal cultivation world. ${capitalize(preset)}. ${camera} toward ${subject}. ${scene}. ${motion}, ancient immortal atmosphere, dramatic lighting, no text, no logo, no watermark.`;
  return { video_prompt: cleanPrompt(video_prompt), negative_prompt: XIANXIA_NEGATIVE_PROMPT };
}

function chooseSubject(input: ImagePromptInput) {
  if (input.hasAppearanceEvidence) return input.entityName ? `${input.entityName}, based only on original evidence` : "the original evidence subject";
  if (input.entityType === "item") return "a mysterious ancient spiritual artifact emitting qi, exact shape kept vague";
  if (input.entityType === "technique") return "a hidden cultivator silhouette channeling a cultivation technique, face obscured by mist";
  if (input.entityType === "sect") return "an ancient cultivation sect silhouette among misty immortal mountains";
  if (input.entityType === "location") return "a misty immortal cultivation landscape";
  if (input.entityType === "event") return "cultivator silhouettes within a dramatic cultivation event";
  return "a mysterious cultivator silhouette in ancient robes, face hidden by shadow or mist";
}

function cleanPrompt(value: string) {
  return value.replace(/\s+/g, " ").replace(/,+/g, ",").trim().slice(0, 1500);
}
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
