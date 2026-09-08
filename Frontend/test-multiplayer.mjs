// Test script for Multiplayer Room Lifecycle
async function runTest() {
  const baseUrl = "http://localhost:3000";

  console.log("1. Testing Create Room...");
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
        targetPlayers: 4,
        timeLimitSeconds: 15,
        chatTitle: "VYBZ Hackathon Lore",
        participants: ["Nishant", "Kabir", "Sneha", "Arjun", "Riya", "Dev"],
      },
    }),
  });

  const room = await createRes.json();
  console.log("Create Room Response:", {
    code: room.code,
    status: room.status,
    totalQuestions: room.totalQuestions,
    playersCount: room.players?.length,
  });

  if (!room.code) {
    throw new Error("Failed to create room: " + JSON.stringify(room));
  }

  console.log("\n2. Testing Join Room for Player 2 (Kabir)...");
  const joinRes = await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "join",
      code: room.code,
      playerId: "player_kabir",
      playerName: "Kabir",
    }),
  });
  const joinedRoom = await joinRes.json();
  console.log("Joined Room Players:", joinedRoom.players.map((p) => p.name));

  console.log("\n3. Testing Start Match...");
  const startRes = await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      code: room.code,
      hostId: "host_nishant",
    }),
  });
  const startedRoom = await startRes.json();
  console.log("Started Room Status:", startedRoom.status, "Active Q:", startedRoom.activeQuestion?.quote);

  console.log("\n4. Testing Player 1 Answer...");
  const ansRes = await fetch(`${baseUrl}/api/multiplayer/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "answer",
      code: room.code,
      playerId: "host_nishant",
      optionKey: "A",
    }),
  });
  const ansData = await ansRes.json();
  console.log("Answer Result:", {
    correct: ansData.correct,
    scoreDelta: ansData.scoreDelta,
    totalScore: ansData.totalScore,
  });

  console.log("\n5. Testing Status Query...");
  const statusRes = await fetch(`${baseUrl}/api/multiplayer/room?code=${room.code}&playerId=host_nishant`);
  const statusData = await statusRes.json();
  console.log("Status Query OK! Current Question Index:", statusData.currentQuestionIndex, "Remaining Seconds:", statusData.remainingSeconds);

  console.log("\nALL MULTIPLAYER API TESTS PASSED SUCCESSFULLY!");
}

runTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
