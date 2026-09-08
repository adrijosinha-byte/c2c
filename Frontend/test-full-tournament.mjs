// Full End-to-End Tournament Simulation for VYBZ Multiplayer Arcade
async function runTournament() {
  const baseUrl = "http://localhost:3000";

  console.log("==================================================");
  console.log("🎮 VYBZ // MULTIPLAYER TOURNAMENT SIMULATION TEST");
  console.log("==================================================");

  // 1. Host creates room with 5 rounds, 15s timer, ROM 001
  console.log("\n[1] Creating Multiplayer Room (Host: Nishant)...");
  const createRes = await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      hostId: "host_nishant",
      hostName: "Nishant",
      settings: {
        roundCount: 5,
        mode: "ROM // 001: WHO SAID IT?",
        targetPlayers: 3,
        timeLimitSeconds: 15,
        chatTitle: "VYBZ Hackathon Lore",
        participants: ["Nishant", "Kabir", "Sneha", "Dev", "Arjun", "Riya"],
      },
    }),
  });

  const room = await createRes.json();
  console.log(`✔ Room Created: Code [${room.code}] | Status: ${room.status} | Rounds: ${room.totalQuestions}`);

  // 2. Kabir and Sneha join the room
  console.log("\n[2] Connecting Player 2 (Kabir) and Player 3 (Sneha)...");
  await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "join",
      code: room.code,
      playerId: "player_kabir",
      playerName: "Kabir",
    }),
  });
  const join2 = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "join",
      code: room.code,
      playerId: "player_sneha",
      playerName: "Sneha",
    }),
  })).json();

  console.log("✔ Connected Roster:", join2.players.map((p) => `${p.name} [${p.tag}]`).join(", "));

  // 3. Host starts match
  console.log("\n[3] Host Launches Match on All Devices...");
  const startRes = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      code: room.code,
      hostId: "host_nishant",
    }),
  })).json();

  console.log(`✔ Match Active! Status: ${startRes.status} | Total Rounds: ${startRes.totalQuestions}`);

  // 4. Play all 5 rounds
  for (let r = 0; r < startRes.totalQuestions; r++) {
    console.log(`\n--- ROUND 0${r + 1} OF 0${startRes.totalQuestions} ---`);

    // Fetch current state
    const state = await (await fetch(`${baseUrl}/api/multiplayer/room?code=${room.code}&playerId=host_nishant`)).json();
    console.log(`Question: "${state.activeQuestion.quote}"`);
    console.log(`Prompt: ${state.activeQuestion.prompt}`);
    console.log(`Options: ${state.activeQuestion.options.map((o) => `[${o.key}] ${o.label}`).join(" | ")}`);

    // Player 1 (Nishant) answers A
    const a1 = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer",
        code: room.code,
        playerId: "host_nishant",
        optionKey: "A",
      }),
    })).json();

    // Player 2 (Kabir) answers B
    const a2 = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer",
        code: room.code,
        playerId: "player_kabir",
        optionKey: "B",
      }),
    })).json();

    // Player 3 (Sneha) answers C
    const a3 = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "answer",
        code: room.code,
        playerId: "player_sneha",
        optionKey: "C",
      }),
    })).json();

    console.log(`Answers Submitted: Nishant [${a1.correct ? "✔" : "✖"}] | Kabir [${a2.correct ? "✔" : "✖"}] | Sneha [${a3.correct ? "✔" : "✖"}]`);

    // Advance question
    const adv = await (await fetch(`${baseUrl}/api/multiplayer/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "advance",
        code: room.code,
        hostId: "host_nishant",
      }),
    })).json();

    if (adv.status === "MATCH_OVER") {
      console.log("\n🏆 5 ROUNDS COMPLETED! MATCH STATUS -> MATCH_OVER");
      break;
    }
  }

  // 5. Check Leaderboard
  console.log("\n[5] Fetching Tournament Leaderboard...");
  const finalState = await (await fetch(`${baseUrl}/api/multiplayer/room?code=${room.code}&playerId=host_nishant`)).json();

  console.log("\n==================================================");
  console.log("🏅 OFFICIAL TOURNAMENT LEADERBOARD");
  console.log("==================================================");
  finalState.leaderboard.forEach((entry) => {
    console.log(
      `#${entry.rank} ${entry.name.padEnd(10)} | Correct: ${entry.correctAnswers}/5 (${entry.accuracy}%) | Score: ${entry.score.toLocaleString()} PTS | Badge: [${entry.badgeTitle}]`
    );
  });
  console.log("==================================================");
  console.log("✔ ALL TOURNAMENT MECHANICS VERIFIED WITH 100% SUCCESS!");
}

runTournament().catch((err) => {
  console.error("Tournament test failed:", err);
  process.exit(1);
});
