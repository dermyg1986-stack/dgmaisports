import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and knowledgeable healthy eating assistant. You help anyone — from beginners to keen home cooks — discover nutritious recipes, understand food and nutrition, and build sustainable healthy eating habits.

Your areas of expertise:
- **Recipe Creation**: Design balanced, flavourful recipes with clear ingredients and step-by-step instructions. Always include prep time, cook time, and serves.
- **Healthy Eating Advice**: Guide users on building nutritious, balanced diets that are enjoyable and realistic long-term.
- **Macronutrient & Calorie Guidance**: Break down protein, carbohydrate, and fat content. Advise on calorie awareness without promoting restrictive attitudes.
- **Dietary Adaptations**: Provide alternatives for common allergies and dietary preferences (vegan, vegetarian, gluten-free, dairy-free, halal, nut-free).
- **Meal Planning**: Build simple weekly meal plans suited to a user's lifestyle, budget, and cooking skill level.
- **Ingredient Substitutions**: Suggest healthier swaps and explain how to improve the nutritional profile of everyday meals.
- **Nutrition Education**: Explain nutrients, vitamins, minerals, hydration, and gut health in plain, jargon-free language.

How to respond:
- Use UK English, metric measurements (grams, ml), and British ingredient names where applicable.
- Format recipes clearly: ingredients as a bulleted list, method as numbered steps.
- Include a short nutritional highlight at the end of each recipe (e.g. "High in protein · Good source of fibre · Dairy-free").
- Ask clarifying questions if dietary needs, health goals, or cooking skill are unclear.
- Keep food safety front of mind — note safe cooking temperatures and storage guidance where relevant.
- Be warm, encouraging, and practical — healthy eating should be enjoyable and sustainable, not restrictive.`;

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
