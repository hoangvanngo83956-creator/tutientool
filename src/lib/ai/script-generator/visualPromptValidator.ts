import { buildXianxiaImagePrompt, buildXianxiaVideoPrompt } from "@/lib/ai/script-generator/promptBuilder";
import { XIANXIA_NEGATIVE_PROMPT } from "@/lib/ai/prompts/xianxiaVisualStylePrompt";
import type { ScriptScenePayload, VisualStylePreset } from "@/lib/module4-types";

const REQUIRED_GROUPS = [
  ["xianxia", "cultivation"],
  ["eastern", "immortal"],
  ["spiritual energy", "qi"],
  ["vertical 9:16"],
  ["no text"],
  ["no logo"],
  ["no watermark"]
];
const FORBIDDEN = ["modern city", "car", "phone", "computer", "gun", "office", "apartment", "school", "knight", "castle", "medieval", "sci-fi", "cyberpunk", "robot"];

export type VisualPromptValidation = {
  is_valid: boolean;
  missing_required_keywords: string[];
  forbidden_keywords_found: string[];
  enhanced_prompt: string;
};

export function validateVisualPrompt(prompt: string, kind: "image" | "video", fallback: { sceneDescription: string; visualStylePreset: VisualStylePreset; entityType?: string | null; entityName?: string | null; hasAppearanceEvidence?: boolean }): VisualPromptValidation {
  const lower = prompt.toLowerCase();
  const missing = REQUIRED_GROUPS.filter((group) => !group.some((keyword) => lower.includes(keyword))).map((group) => group.join(" or "));
  const forbidden = FORBIDDEN.filter((keyword) => lower.includes(keyword));
  const valid = missing.length === 0 && forbidden.length === 0;
  const enhanced = kind === "image"
    ? buildXianxiaImagePrompt(fallback).image_prompt
    : buildXianxiaVideoPrompt({ ...fallback, cameraMovement: "slow camera push-in" }).video_prompt;
  return { is_valid: valid, missing_required_keywords: missing, forbidden_keywords_found: forbidden, enhanced_prompt: valid ? prompt : enhanced };
}

export function enhanceSceneVisualPrompts(scene: ScriptScenePayload, input: { visualStylePreset: VisualStylePreset; strictMode: boolean; entityType?: string | null; entityName?: string | null; hasAppearanceEvidence?: boolean }) {
  const fallback = { sceneDescription: scene.visual_description, visualStylePreset: input.visualStylePreset, entityType: input.entityType, entityName: input.entityName, hasAppearanceEvidence: input.hasAppearanceEvidence };
  const imageCheck = validateVisualPrompt(scene.image_prompt, "image", fallback);
  const videoCheck = validateVisualPrompt(scene.video_prompt, "video", fallback);
  const warnings = [];
  if (!imageCheck.is_valid) warnings.push(`Scene ${scene.scene_index}: image_prompt được tự sửa về phong cách tu tiên.`);
  if (!videoCheck.is_valid) warnings.push(`Scene ${scene.scene_index}: video_prompt được tự sửa về phong cách tu tiên.`);
  return {
    scene: {
      ...scene,
      image_prompt: input.strictMode ? imageCheck.enhanced_prompt : scene.image_prompt,
      video_prompt: input.strictMode ? videoCheck.enhanced_prompt : scene.video_prompt,
      negative_prompt: scene.negative_prompt || XIANXIA_NEGATIVE_PROMPT,
      xianxia_visual_elements: scene.xianxia_visual_elements?.length ? scene.xianxia_visual_elements : inferElements(scene.visual_description),
      warning: warnings.join(" ") || scene.warning || null
    },
    imageCheck,
    videoCheck,
    warnings
  };
}

function inferElements(description: string) {
  const lower = description.toLowerCase();
  const elements = ["spiritual energy", "misty immortal atmosphere"];
  if (lower.includes("kiếm") || lower.includes("sword")) elements.push("flying sword light");
  if (lower.includes("trận") || lower.includes("formation")) elements.push("glowing formation array");
  if (lower.includes("động") || lower.includes("cave")) elements.push("ancient cultivation cave");
  if (lower.includes("núi") || lower.includes("mountain")) elements.push("misty immortal mountain");
  return elements;
}
