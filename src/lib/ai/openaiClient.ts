import OpenAI from "openai";

type ChatJsonOptions = {
  system?: string;
  prompt: string;
};

export function getAIProvider() {
  return process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai");
}

export function getOpenAIClient() {
  const provider = getAIProvider();
  const apiKey = provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      provider === "deepseek"
        ? "Thiếu DEEPSEEK_API_KEY. Hãy thêm key vào .env.local để chạy AI Research."
        : "Thiếu OPENAI_API_KEY. Hãy thêm key vào .env.local để chạy AI Research."
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: provider === "deepseek" ? process.env.AI_BASE_URL || "https://api.deepseek.com" : process.env.AI_BASE_URL
  });
}

export function getAIModel() {
  if (process.env.AI_MODEL) {
    return process.env.AI_MODEL;
  }

  return getAIProvider() === "deepseek" ? "deepseek-chat" : "gpt-4.1-mini";
}

export async function createJsonChatCompletion({ system, prompt }: ChatJsonOptions) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: getAIModel(),
    messages: [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      { role: "user" as const, content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI không trả về nội dung JSON.");
  }

  return content;
}