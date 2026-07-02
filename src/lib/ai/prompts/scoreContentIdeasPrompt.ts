export function buildScoreContentIdeasPrompt(input: any) { return `Score content ideas 1-10 with evidence strength. Return JSON only. INPUT:${JSON.stringify(input).slice(0, 12000)}`; }
