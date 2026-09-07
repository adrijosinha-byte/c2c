"use client";

import { useState } from "react";

export default function VybzPage() {
  const [activeTab, setActiveTab] = useState("tab-database");
  const [memories, setMemories] = useState([]);
  const [credits, setCredits] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [crtEnabled, setCrtEnabled] = useState(false);

  function insertCoin() {
    setCredits((current) => current + 1);
  }

  return (
    <div className={crtEnabled ? "crt-enabled" : ""} style={{ minHeight: "100vh", backgroundColor: "#070510", display: "flex", justifyContent: "center", padding: "10px" }}>
      <div className="crt-scanlines"></div>
      <div className="crt-flicker"></div>

      <div className="arcade-cabinet" style={{ width: "100%", maxWidth: "1200px" }}>
        <ArcadeHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          credits={credits}
          insertCoin={insertCoin}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          crtEnabled={crtEnabled}
          setCrtEnabled={setCrtEnabled}
        />

        <div className="arcade-screen">
          <TabContent
            activeTab={activeTab}
            memories={memories}
            setMemories={setMemories}
          />
        </div>

        <ArcadeFooter />
      </div>
    </div>
  );
}

function ArcadeHeader({ activeTab, setActiveTab, credits, insertCoin, soundEnabled, setSoundEnabled, crtEnabled, setCrtEnabled }) {
  return (
    <header className="arcade-header">
      <div className="marquee-wrapper">
        <div className="marquee-lights">
          <span className="light red"></span>
          <span className="light yellow"></span>
          <span className="light green"></span>
          <span className="light blue"></span>
        </div>

        <div className="arcade-title-group">
          <div className="arcade-super-tag">AI MEMORY & FRIENDSHIP TRIVIA ENGINE</div>
          <h1 className="arcade-main-title">
            <span className="title-pixel">VY</span>
            <span className="title-neon">BZ</span>
            <span className="title-sub">ARCADE</span>
          </h1>
          <div className="arcade-motto">TURN YOUR FRIENDSHIP LORE INTO CHAOS</div>
        </div>

        <div className="marquee-lights">
          <span className="light blue"></span>
          <span className="light green"></span>
          <span className="light yellow"></span>
          <span className="light red"></span>
        </div>
      </div>

      <div className="arcade-hud-bar">
        <div className="hud-item">
          <span className="hud-label">CREDITS:</span>
          <span className="hud-val pulse">{String(credits).padStart(2, "0")}</span>
          <button type="button" className="btn-retro-mini" onClick={insertCoin}>
            + INSERT COIN
          </button>
        </div>

        <div className="hud-item" style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn-toggle-hud"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <span>{soundEnabled ? "🔊" : "🔇"}</span>
            <span>SFX: {soundEnabled ? "ON" : "OFF"}</span>
          </button>
          <button
            type="button"
            className="btn-toggle-hud"
            onClick={() => setCrtEnabled(!crtEnabled)}
          >
            <span>📺</span>
            <span>CRT: {crtEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      <nav className="arcade-nav" style={{ display: "flex", gap: "6px", flexWrap: "wrap", overflowX: "auto" }}>
        {[
          { id: "tab-database", icon: "💾", title: "1. DATABASE" },
          { id: "tab-game", icon: "🕹️", title: "2. TRIVIA" },
          { id: "tab-vault", icon: "🧠", title: "3. VAULT" },
          { id: "tab-leaderboard", icon: "🏆", title: "4. SCORES" },
          { id: "tab-pipeline", icon: "⚡", title: "5. HOW AI WORKS" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`arcade-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <span>{tab.icon}</span>
            <span>{tab.title}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

function TabContent({ activeTab, memories, setMemories }) {
  return (
    <>
      <div className={`arcade-section ${activeTab === "tab-database" ? "active" : ""}`} style={{ display: activeTab === "tab-database" ? "block" : "none" }}>
        <DatabaseTab memories={memories} setMemories={setMemories} />
      </div>
      <div className={`arcade-section ${activeTab === "tab-game" ? "active" : ""}`} style={{ display: activeTab === "tab-game" ? "block" : "none" }}>
        <TriviaTab />
      </div>
      <div className={`arcade-section ${activeTab === "tab-vault" ? "active" : ""}`} style={{ display: activeTab === "tab-vault" ? "block" : "none" }}>
        <VaultTab memories={memories} />
      </div>
      <div className={`arcade-section ${activeTab === "tab-leaderboard" ? "active" : ""}`} style={{ display: activeTab === "tab-leaderboard" ? "block" : "none" }}>
        <LeaderboardTab />
      </div>
      <div className={`arcade-section ${activeTab === "tab-pipeline" ? "active" : ""}`} style={{ display: activeTab === "tab-pipeline" ? "block" : "none" }}>
        <PipelineTab />
      </div>
    </>
  );
}

function DatabaseTab({ memories, setMemories }) {
  const [chatText, setChatText] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([
    "> VYBZ MEMORY ENGINE INITIALIZED",
    "> AWAITING MEMORY INPUT...",
    "> DATABASE STATUS: EMPTY",
  ]);

  function feedMemory() {
    if (!chatText.trim()) return;

    const newMemory = {
      id: Date.now(),
      content: chatText.trim(),
      category: "Group Chat Quote",
      date: new Date().toLocaleDateString(),
    };

    setMemories((current) => [...current, newMemory]);
    setTerminalLogs((current) => [
      ...current,
      `> INGESTED MEMORY #${newMemory.id.toString().slice(-4)}`,
      `> VECTOR EMBEDDINGS GENERATED SUCCESSFULLY`,
    ]);
    setChatText("");
  }

  return (
    <div>
      <div className="section-title-banner">
        <h2>MEMORY REPOSITORY // FEED THE VYBZ ENGINE</h2>
        <p>{memories.length === 0 ? "DATABASE EMPTY (FEED SCENARIOS)" : `MODEL SYNCED (${memories.length} MEMORIES LOADED)`}</p>
      </div>

      <div className="terminal-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        <div className="retro-box">
          <div className="box-header">
            <span className="box-title">CHAT / TEXT INGESTION</span>
            <span className="badge-neon">INPUT_01</span>
          </div>

          <div className="retro-form">
            <div className="form-block">
              <label className="retro-label">
                <span>PASTE GROUP CHAT LORE & MEMORIES</span>
                <span className="label-hint">RAW TEXT</span>
              </label>
              <textarea
                className="retro-textarea"
                rows={5}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Paste a memory, conversation, inside joke, or quote here..."
              />
            </div>

            <button
              type="button"
              className="btn-retro btn-green btn-block"
              disabled={!chatText.trim()}
              onClick={feedMemory}
            >
              ⚡ FEED MEMORY TO ENGINE
            </button>
          </div>
        </div>

        <div className="retro-box">
          <div className="box-header">
            <span className="box-title">AI PROCESSING TERMINAL</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="blink-dot"></span>
              <span className="badge-neon">SYS_01</span>
            </div>
          </div>

          <div className="terminal-screen">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="terminal-line system">
                {log}
              </div>
            ))}
          </div>

          <div className="scanner-metrics">
            <div>
              <div className="meter-label">
                <span>VECTOR DENSITY</span>
                <span>{memories.length * 25}%</span>
              </div>
              <div className="meter-bar">
                <div className="meter-fill" style={{ width: `${Math.min(memories.length * 25, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TriviaTab() {
  return (
    <div>
      <div className="section-title-banner">
        <h2>TRIVIA ARENA</h2>
        <p>CHALLENGE YOUR FRIENDS WITH GENERATED LORE</p>
      </div>
      <div className="retro-box" style={{ textAlign: "center", padding: "40px" }}>
        <h3 className="arcade-super-tag" style={{ fontSize: "1rem", marginBottom: "20px" }}>READY PLAYER ONE & TWO?</h3>
        <p className="arcade-motto" style={{ marginBottom: "30px" }}>Feed memories in the database tab to unlock custom friendship trivia battles!</p>
        <button type="button" className="btn-retro btn-yellow btn-lg">
          🕹️ START TRIVIA MATCH
        </button>
      </div>
    </div>
  );
}

function VaultTab({ memories }) {
  return (
    <div>
      <div className="section-title-banner">
        <h2>MEMORY VAULT</h2>
        <p>ALL STORED LORE & ARCHIVED SCENARIOS</p>
      </div>
      {memories.length === 0 ? (
        <div className="retro-box" style={{ textAlign: "center", padding: "40px" }}>
          <p className="arcade-motto">VAULT IS CURRENTLY EMPTY. FEED MEMORIES IN DATABASE.</p>
        </div>
      ) : (
        <div className="memory-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {memories.map((m) => (
            <div className="memory-card" key={m.id}>
              <div className="memory-card-header">
                <span className="memory-type-tag">{m.category}</span>
                <span className="memory-date">{m.date}</span>
              </div>
              <div className="memory-card-content">{m.content}</div>
              <div className="memory-card-footer">STATUS: VERIFIED LORE</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardTab() {
  return (
    <div>
      <div className="section-title-banner">
        <h2>HALL OF FAME // HIGH SCORES</h2>
        <p>TOP FRIENDSHIP DUOS & TRIVIA CHAMPIONS</p>
      </div>
      <div className="leaderboard-table-wrap retro-box">
        <table className="retro-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>DUO NAMES</th>
              <th>SYNC %</th>
              <th>SCORE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="rank-num-1">01</td>
              <td>CYBER_PUNK & NEON_QUEEN</td>
              <td>98.4%</td>
              <td>14,250</td>
            </tr>
            <tr>
              <td className="rank-num-2">02</td>
              <td>GLITCH & MATRIX</td>
              <td>91.2%</td>
              <td>11,800</td>
            </tr>
            <tr>
              <td className="rank-num-3">03</td>
              <td>PIXEL & BIT</td>
              <td>85.6%</td>
              <td>9,420</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PipelineTab() {
  return (
    <div>
      <div className="section-title-banner">
        <h2>HOW AI WORKS</h2>
        <p>BEHIND THE SCENES OF THE VYBZ ENGINE</p>
      </div>
      <div className="pipeline-diagram-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        <div className="retro-box pipeline-card">
          <div className="pipeline-step">STEP 01</div>
          <div className="pipeline-icon">📥</div>
          <h3>INGESTION</h3>
          <p>Group chat texts and memories are securely uploaded and parsed into vector tokens.</p>
        </div>
        <div className="retro-box pipeline-card">
          <div className="pipeline-step">STEP 02</div>
          <div className="pipeline-icon">🧠</div>
          <h3>EMBEDDING</h3>
          <p>Semantic analysis maps out inside jokes, recurring themes, and unique relationship dynamics.</p>
        </div>
        <div className="retro-box pipeline-card">
          <div className="pipeline-step">STEP 03</div>
          <div className="pipeline-icon">⚡</div>
          <h3>GENERATION</h3>
          <p>The arcade engine crafts custom multiple-choice trivia questions and compatibility scores.</p>
        </div>
        <div className="retro-box pipeline-card">
          <div className="pipeline-step">STEP 04</div>
          <div className="pipeline-icon">🏆</div>
          <h3>BATTLE</h3>
          <p>Friends compete head-to-head to prove who knows each other the best in real-time.</p>
        </div>
      </div>
    </div>
  );
}

function ArcadeFooter() {
  return (
    <footer className="arcade-footer">
      <div className="coin-slots">
        <div className="coin-slot-unit">
          <div className="coin-slot-light">25¢</div>
          <div className="coin-slot-hole"></div>
          <span className="slot-label">PLAYER 1</span>
        </div>
        <div className="coin-slot-unit">
          <div className="coin-slot-light">25¢</div>
          <div className="coin-slot-hole"></div>
          <span className="slot-label">PLAYER 2</span>
        </div>
      </div>

      <div className="footer-center-info">
        <p className="copyright-pixel">VYBZ AI ARCADE SYSTEM // COPYRIGHT © 2026</p>
        <p className="tagline-pixel">TRAINED ON UNFILTERED FRIENDSHIP CHAOS & GROUP CHAT LORE</p>
      </div>

      <div className="speaker-grill">||||||||||||||||</div>
    </footer>
  );
}