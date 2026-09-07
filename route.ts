import { gemini } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id, mimeType, base64 } = body;

    if (!id || !mimeType || !base64) {
      return Response.json(
        { error: "id, mimeType and base64 are required" },
        { status: 400 }
      );
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
        {
          text: `
Analyze this uploaded media for community safety.

Return ONLY valid JSON in exactly this format:

{
  "allowed": true,
  "category": "safe",
  "confidence": 0.95,
  "reason": "Short explanation"
}

Set "allowed" to false if the media should be rejected.

Keep confidence between 0 and 1.
Do not include markdown or any text outside the JSON.
`,
        },
      ],

      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);

    result.confidence = Math.max(
      0,
      Math.min(1, Number(result.confidence) || 0)
    );
    const { error } = await supabase
  .from("memories")
  .update({
    allowed: result.allowed,
    confidence: result.confidence,
    reason: result.reason,
  })
  .eq("id", id);

if (error) {
  throw error;
}

    return Response.json(result);
  } catch (error) {
    console.error("Gemini moderation error:", error);

    return Response.json(
  {
    allowed: false,
    category: "review",
    confidence: 0,
    reason: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);
  }
}