// Automated Test Suite for VYBZ // QUESTION GENERATION AUDIT + FACTUAL GROUNDING
import { parseChatLog } from "./lib/services/chat-parser.ts";
import { generateArcadeQuestions, validateArcadeQuestion } from "./lib/services/ai-trivia.ts";

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING VYBZ QUESTION GENERATION AUDIT TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed++;
      throw new Error(message);
    } else {
      console.log(`✅ PASS: ${message}`);
      passed++;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: CHAT INGESTION REGRESSION TEST (Section 25)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 1: Chat Ingestion Regression ---");
  const mockChat = `
[06/09/26, 18:05:00] Nishant: guys are we actually doing the hackathon tonight
[06/09/26, 18:11:00] Riya: you said that last night too
[06/09/26, 18:14:00] Kabir: last night we were supposed to plan
[06/09/26, 18:17:00] Sneha: and somehow we spent 3 hours arguing about the logo
[06/09/26, 18:20:00] Dev: the logo was important
[06/09/26, 18:22:00] Arjun: we literally have no database schema
  `.trim();

  const ingestRes = parseChatLog(mockChat, "hackathon_chat.txt");
  assert(ingestRes.participants.length >= 6, `Found ${ingestRes.participants.length} participants (expected >= 6)`);
  assert(ingestRes.participants.includes("Sneha"), "Sneha is in participants");
  assert(ingestRes.participants.includes("Dev"), "Dev is in participants");
  assert(ingestRes.participants.includes("Riya"), "Riya is in participants");
  assert(ingestRes.participants.includes("Nishant"), "Nishant is in participants");
  assert(ingestRes.participants.includes("Kabir"), "Kabir is in participants");
  assert(ingestRes.participants.includes("Arjun"), "Arjun is in participants");

  const quoteMap = new Map();
  ingestRes.topQuotes.forEach((q) => quoteMap.set(q.text.toLowerCase().trim(), q.author));

  assert(quoteMap.get("guys are we actually doing the hackathon tonight") === "Nishant", "Q1 author is Nishant");
  assert(quoteMap.get("you said that last night too") === "Riya", "Q2 author is Riya");
  assert(quoteMap.get("last night we were supposed to plan") === "Kabir", "Q3 author is Kabir");
  assert(quoteMap.get("and somehow we spent 3 hours arguing about the logo") === "Sneha", "Q4 author is Sneha");
  assert(quoteMap.get("the logo was important") === "Dev", "Q5 author is Dev");

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: QUESTION GENERATION GROUNDING & ATTRIBUTION (Sections 4, 5, 6, 7)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 2: Question Generation & Factual Grounding ---");
  const genRes = await generateArcadeQuestions({
    participants: ingestRes.participants,
    interests: ingestRes.inferredInterests,
    topQuotes: ingestRes.topQuotes,
    romCategory: "ROM // 001",
    count: 5,
  });

  assert(genRes.questions.length === 5, "Generated exactly 5 questions");

  const allLabelsSeen = new Set();

  for (let i = 0; i < genRes.questions.length; i++) {
    const q = genRes.questions[i];

    // Four options invariant
    assert(q.options.length === 4, `Question ${i + 1} has exactly 4 options`);
    const keys = q.options.map((o) => o.key);
    assert(keys.join("") === "ABCD", `Question ${i + 1} option keys are A, B, C, D`);

    // Unique option labels
    const labels = q.options.map((o) => o.label);
    assert(new Set(labels).size === 4, `Question ${i + 1} options have 4 unique labels: ${labels.join(", ")}`);
    labels.forEach((l) => allLabelsSeen.add(l));

    // Correct answer exists among options
    const correctOpt = q.options.find((o) => o.key === q.correctAnswer);
    assert(!!correctOpt, `Question ${i + 1} correct answer '${q.correctAnswer}' exists in options`);

    // Ground truth match
    const cleanQuote = q.quote.replace(/^"|"$/g, "").toLowerCase().trim();
    const expectedAuthor = quoteMap.get(cleanQuote);

    if (expectedAuthor) {
      assert(
        correctOpt.label === expectedAuthor,
        `Question ${i + 1} ('${cleanQuote}') correctAnswer '${q.correctAnswer}' corresponds to '${correctOpt.label}', expected '${expectedAuthor}'`
      );
    }

    // Semantic validation check
    const validation = validateArcadeQuestion(q, {
      author: expectedAuthor || q.sourceAuthor,
      text: cleanQuote,
    });
    assert(validation.valid, `Question ${i + 1} semantic validation passed: ${validation.error || "OK"}`);
  }

  // Assert participants beyond first 4 are used
  assert(
    allLabelsSeen.has("Sneha") || allLabelsSeen.has("Dev"),
    `Participants pool includes Sneha or Dev (All labels seen across 5 questions: ${Array.from(allLabelsSeen).join(", ")})`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: ALL 5 ROMS FACTUAL CONSISTENCY (Sections 13-17)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 3: All ROM Cartridges Factual Testing ---");
  const roms = ["ROM // 001", "ROM // 002", "ROM // 003", "ROM // 004", "ROM // 005"];
  for (const rom of roms) {
    const romRes = await generateArcadeQuestions({
      participants: ingestRes.participants,
      interests: ingestRes.inferredInterests,
      topQuotes: ingestRes.topQuotes,
      romCategory: rom,
      count: 5,
    });
    assert(romRes.questions.length === 5, `${rom} generated 5 questions`);
    for (const q of romRes.questions) {
      const opt = q.options.find((o) => o.key === q.correctAnswer);
      assert(opt && opt.label === q.sourceAuthor, `${rom} attribution verified: key ${q.correctAnswer} -> ${opt?.label}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: PARTICIPANT THRESHOLD & NO FAKE USERS (Section 24)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- TEST 4: Insufficient Participants (< 4) Error Handling ---");
  try {
    await generateArcadeQuestions({
      participants: ["Nishant", "Kabir", "Arjun"], // only 3
      interests: ["music"],
      quotes: ["some quote"],
      count: 5,
    });
    assert(false, "Should have thrown for < 4 participants");
  } catch (err) {
    assert(
      err.message.includes("INSUFFICIENT_PARTICIPANTS"),
      `Rejected < 4 participants with clear error: "${err.message}"`
    );
  }

  console.log("\n==================================================");
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
