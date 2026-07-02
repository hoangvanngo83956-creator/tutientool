export function buildGenerateMonthlyPlanPrompt(input: any) { return `Generate monthly content plan JSON only. INPUT:${JSON.stringify(input).slice(0, 12000)}`; }
