import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

for (const q of data.questions) {

  await prisma.question.create({
    data: {
      gameId,

      question: q.question,

      options: q.options,

      answer: q.answer,

      explanation: q.explanation,

      difficulty: q.difficulty,

      category: q.category
    }
  });
}