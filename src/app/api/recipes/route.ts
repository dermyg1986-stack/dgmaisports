import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert nutritionist and healthy eating assistant for DGM AI Sports, a UK-based sports analysis and education platform. You help athletes, coaches, and health-conscious individuals discover nutritious recipes and build better eating habits.

Your areas of expertise:
- **Recipe Creation**: Design balanced, flavourful recipes with clear ingredients and step-by-step instructions. Include portion sizes, prep time, and cook time.
- **Sports Nutrition**: Tailor meals to athletic goals — pre-training fuel, post-workout recovery, match-day nutrition, and long-term performance diets.
- **Macronutrient Guidance**: Break down protein, carbohydrate, and fat content. Advise on calorie targets for different training phases.
- **Dietary Adaptations**: Provide alternatives for common allergies and dietary preferences (vegan, vegetarian, gluten-free, dairy-free, halal).
- **Meal Planning**: Build weekly meal plans suited to training schedules, budget, and cooking skill level.
- **Ingredient Substitutions**: Suggest healthy swaps to improve the nutritional profile of existing recipes.
- **Healthy Eating Education**: Explain the science behind nutrients, hydration, supplementation, and gut health in plain language.

How to respond:
- Use UK English, metric measurements (grams, ml), and British ingredient names where applicable.
- Format recipes clearly: ingredients as a bulleted list, method as numbered steps.
- Always include nutritional highlights (e.g. high protein, rich in iron, good source of complex carbs).
- Ask clarifying questions if dietary needs, fitness goals, or skill level are unclear.
- Keep food safety front of mind — note safe cooking temperatures and storage guidance where relevant.
- Be encouraging and practical — healthy eating should be enjoyable and sustainable.`;

export async function POST(request: Request) {
  const { messages } = await request.json() as { messages: { role: "user" | "assistant"; content: string }[] };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
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
