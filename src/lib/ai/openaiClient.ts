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
        ? "Thieu DEEPSEEK_API_KEY. Hay them key vao .env.local de chay AI Research."
        : "Thieu OPENAI_API_KEY. Hay them key vao .env.local de chay AI Research."
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
  const jsonOnlySystem = "Return only valid JSON. Do not wrap the response in markdown fences. Do not add explanations outside JSON.";
  const response = await client.chat.completions.create({
    model: getAIModel(),
    messages: [
      { role: "system" as const, content: system ? `${jsonOnlySystem}

${system}` : jsonOnlySystem },
      { role: "user" as const, content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI did not return JSON content.");
  }

  return content;
}

export function parseAIJson<T = unknown>(value: string, errorMessage = "AI returned invalid JSON format."): T {
  const jsonText = extractJsonText(value);

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error(errorMessage);
  }
}

export function extractJsonText(value: string) {
  const text = value.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstObject = text.indexOf("{");
  const firstArray = text.indexOf("[");
  const starts = [firstObject, firstArray].filter((index) => index >= 0);
  if (!starts.length) {
    return text;
  }

  const start = Math.min(...starts);
  const opener = text[start];
  const closer = opener === "{" ? "}" : "]";
  const end = text.lastIndexOf(closer);

  return end > start ? text.slice(start, end + 1).trim() : text;
}
