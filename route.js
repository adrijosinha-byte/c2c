import { gemini } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      interests,
      difficulty = "medium",
      count = 5
    } = body;

    const prompt = `
You are the question generator for a multiplayer trivia game.

Generate ${count} fun trivia questions.

User interests:
${interests.join(", ")}

Difficulty:
${difficulty}

Rules:
- Questions must be appropriate for a general audience.
- Do not ask for private or sensitive information.
- Each question must have exactly 4 options.
- There must be exactly one correct answer.
- Avoid repeating questions.
- Make questions engaging and game-like.
`;

    const response = await gemini.interactions.create({
      model: "gemini-3.8-flash",

      input: prompt,

      response_format: {
        type: "text",
        mime_type: "application/json",

        schema: {
          type: "object",

          properties: {
            questions: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  question: {
                    type: "string"
                  },

                  options: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  },

                  answer: {
                    type: "string"
                  },

                  explanation: {
                    type: "string"
                  },

                  difficulty: {
                    type: "string"
                  },

                  category: {
                    type: "string"
                  }
                },

                required: [
                  "question",
                  "options",
                  "answer",
                  "explanation",
                  "difficulty",
                  "category"
                ]
              }
            }
          },

          required: ["questions"]
        }
      }
    });

    const data = JSON.parse(response.output_text);

    return Response.json(data);

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Failed to generate questions"
      },
      {
        status: 500
      }
    );
  }
}