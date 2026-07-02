export function buildGenerateWeeklyPlanPrompt(input: any) { return `Generate weekly content plan JSON only. INPUT:${JSON.stringify(input).slice(0, 12000)}`; }
