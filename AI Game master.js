import { gemini } from "@/lib/gemini";

export async function POST(request) {

  try {

    const {
      players,
      currentQuestion,
      scores,
      round
    } = await request.json();

    const prompt = `
You are the AI Game Master for a multiplayer trivia game.

Current round:
${round}

Players:
${JSON.stringify(players)}

Scores:
${JSON.stringify(scores)}

Current question:
${JSON.stringify(currentQuestion)}

Choose what should happen next.

Possible actions:

NEXT_QUESTION
HINT
BONUS_ROUND
DIFFICULTY_UP
DIFFICULTY_DOWN
GAME_END

Keep the game fun and fair.

Do not reveal the correct answer before
the game rules allow it.
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

            action: {
              type: "string"
            },

            message: {
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
            "action",
            "message"
          ]
        }
      }
    });

    return Response.json(
      JSON.parse(response.output_text)
    );

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Game master failed"
      },
      {
        status: 500
      }
    );
  }
}