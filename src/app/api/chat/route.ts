import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an elite sports coaching assistant for DGM AI Sports, a UK-based sports analysis and education platform. You help coaches plan, prepare, and optimise performance across all sports.

Your areas of expertise:
- **Session Planning**: Design structured training sessions with warm-ups, drills, progressions, and cool-downs. Tailor intensity and duration to the squad's age, fitness level, and competition schedule.
- **Match Preparation**: Build pre-match tactical plans, set-piece strategies, opponent scouting summaries, and team talks.
- **Drill Library**: Suggest specific drills with setup instructions, coaching points, and variations for different ability levels.
- **Player & Team Analysis**: Interpret performance data, identify patterns, suggest positional changes, and flag development areas.
- **Periodisation & Load Management**: Advise on training cycles, recovery windows, taper plans, and injury prevention.
- **Game Intelligence**: Discuss formations, pressing triggers, transition play, defensive shape, and attacking principles.

How to respond:
- Be direct, practical, and actionable — coaches need clear instructions they can use immediately.
- Use structured formats (numbered steps, bullet points, tables) for plans and drills.
- Ask clarifying questions if the sport, age group, ability level, or context is unclear.
- Always consider player welfare and safe training practices.
- Adapt to the sport and code of play when specified by the coach.
- Use UK English and standard coaching terminology where appropriate.`;

export async function POST(request: Request) {
  const { messages } = await request.json() as { messages: { role: "user" | "assistant"; content: string }[] };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Use Object.assign to pass newer API params the installed SDK types don't declare yet
        const params = Object.assign(
          {
            model: "claude-opus-4-8",
            max_tokens: 8192,
            system: SYSTEM_PROMPT,
            messages,
          },
          { thinking: { type: "adaptive" }, output_config: { effort: "high" } }
        );

        const anthropicStream = await client.messages.stream(
          params as Parameters<typeof client.messages.stream>[0]
        );

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
