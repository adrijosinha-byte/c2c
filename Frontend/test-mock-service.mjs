// Comprehensive Automated Test Suite for VYBZ // MOCK DATA + AI SERVICE
import {
  getChatAnalysisService,
  getTriviaService,
  getGameMasterService,
  getModerationService,
  isMockMode,
} from "./lib/services/index.ts";
import { vybzDemoMessages, DEMO_PARTICIPANTS } from "./lib/mock-data/vybz-demo.ts";

async function runMockServiceTests() {
  console.log("==================================================");
  console.log("RUNNING VYBZ MOCK AI SERVICE VERIFICATION SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, msg) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
      throw new Error(msg);
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  // Disable artificial latency for fast test runs
  process.env.MOCK_AI_LATENCY = "false";

  // 1. DATASET TEST
  console.log("\n--- TEST 1: Mock Dataset Integrity ---");
  assert(vybzDemoMessages.length === 142, `Dataset contains 142 messages (got ${vybzDemoMessages.length})`);
  assert(DEMO_PARTICIPANTS.length === 6, "Dataset has exactly 6 participants");
  const authors = new Set(vybzDemoMessages.map((m) => m.author));
  assert(authors.size === 6, `All 6 authors represented in chat: ${Array.from(authors).join(", ")}`);
  for (const m of vybzDemoMessages) {
    if (!m.id || !m.author || !m.text || !m.timestamp) {
      assert(false, `Message ${m.id} missing required fields`);
    }
  }
  assert(true, "All 142 messages have stable ID, author, text, and timestamp");

  // 2. MOCK MODE FLAG & FACTORY
  console.log("\n--- TEST 2: Service Factory & Mode Selection ---");
  assert(isMockMode() === true, "isMockMode() returns true under MOCK_AI=true / missing Gemini key");
  const chatService = getChatAnalysisService();
  const triviaService = getTriviaService();
  const gameMasterService = getGameMasterService();
  const moderationService = getModerationService();
  assert(!!chatService, "ChatAnalysisService instance available");
  assert(!!triviaService, "TriviaService instance available");
  assert(!!gameMasterService, "GameMasterService instance available");
  assert(!!moderationService, "ModerationService instance available");

  // 3. CHAT INGESTION TEST
  console.log("\n--- TEST 3: Mock Chat Ingestion ---");
  const ingestResult = await chatService.ingestChat("sample text", "demo.txt");
  assert(ingestResult.messageCount === 142, `Ingest returns 142 messages (got ${ingestResult.messageCount})`);
  assert(ingestResult.participants.length === 6, "Ingest returns all 6 participants");
  assert(ingestResult.topQuotes.length >= 5, "Ingest returns top quotes");
  assert(ingestResult.topQuotes[0].id === "msg_0001", "Top quotes retain stable message IDs");
  assert(ingestResult.inferredInterests.length > 0, "Ingest returns inferred themes");

  // 4. TEST ALL 5 ROMS (25 QUESTIONS TOTAL)
  console.log("\n--- TEST 4: Question Generation across all 5 ROM Cartridges (25 Questions) ---");
  const roms = [
    { rom: "ROM // 001", name: "WHO SAID IT?" },
    { rom: "ROM // 002", name: "MEMORY BANK" },
    { rom: "ROM // 003", name: "FRIENDSHIP QUIZ" },
    { rom: "ROM // 004", name: "HOT TAKE MACHINE" },
    { rom: "ROM // 005", name: "CHAOS MODE" },
  ];

  let totalQuestionsVerified = 0;

  for (const r of roms) {
    console.log(`\n  Checking ${r.rom}: ${r.name}...`);
    const genRes = await triviaService.generateQuestions({
      participants: ingestResult.participants,
      topQuotes: ingestResult.topQuotes,
      romCategory: r.rom,
      count: 5,
    });

    assert(genRes.questions.length === 5, `${r.rom} generated exactly 5 questions`);

    for (let i = 0; i < genRes.questions.length; i++) {
      const q = genRes.questions[i];
      assert(q.options.length === 4, `Question ${i + 1} has 4 options`);
      const keys = q.options.map((o) => o.key);
      assert(keys.join("") === "ABCD", `Question ${i + 1} option keys are A, B, C, D`);

      const labels = q.options.map((o) => o.label);
      assert(new Set(labels).size === 4, `Question ${i + 1} option labels are unique: ${labels.join(", ")}`);

      const correctOpt = q.options.find((o) => o.key === q.correctAnswer);
      assert(!!correctOpt, `Question ${i + 1} correctAnswer '${q.correctAnswer}' exists in options`);

      assert(!!q.sourceMessageId, `Question ${i + 1} has sourceMessageId: ${q.sourceMessageId}`);

      if (r.rom === "ROM // 001") {
        assert(
          correctOpt.label === q.sourceAuthor,
          `Question ${i + 1} WHO SAID IT author '${q.sourceAuthor}' equals correct option label '${correctOpt.label}'`
        );
      }

      totalQuestionsVerified++;
    }
  }

  assert(totalQuestionsVerified === 25, `Verified all 25 questions across 5 ROMs`);

  // 5. GAME MASTER SERVICE TEST
  console.log("\n--- TEST 5: Mock Game Master Arbitration ---");
  const gmRound1 = await gameMasterService.executeGameMaster({
    round: 1,
    players: [{ name: "Nishant", score: 500 }],
    scores: { Nishant: 500 },
  });
  assert(gmRound1.action === "NEXT_QUESTION", "Round 1 low score triggers NEXT_QUESTION");

  const gmBonus = await gameMasterService.executeGameMaster({
    round: 3,
    players: [{ name: "Nishant", score: 2000 }],
    scores: { Nishant: 2000 },
  });
  assert(gmBonus.action === "BONUS_ROUND", "High score (>=1500) triggers BONUS_ROUND");

  const gmEnd = await gameMasterService.executeGameMaster({
    round: 5,
    players: [{ name: "Nishant", score: 3000 }],
    scores: { Nishant: 3000 },
  });
  assert(gmEnd.action === "GAME_END", "Round 5 triggers GAME_END");

  // 6. MEDIA MODERATION TEST
  console.log("\n--- TEST 6: Mock Media Moderation ---");
  const modSafe = await moderationService.moderateMedia({
    id: "med_demo_01",
    mimeType: "image/png",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  });
  assert(modSafe.allowed === true, "Valid media approved");
  assert(modSafe.confidence === 0.99, "Confidence score is 0.99");

  const modFlagged = await moderationService.moderateMedia({
    id: "med_demo_bad",
    mimeType: "image/png",
    base64: "EXPLICIT_NSFW_PAYLOAD_TEST",
  });
  assert(modFlagged.allowed === false, "Prohibited media rejected");

  console.log("\n==================================================");
  console.log(`MOCK SERVICE SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
}

runMockServiceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
