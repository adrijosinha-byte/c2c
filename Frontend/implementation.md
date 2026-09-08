# Backend → Frontend Integration Plan

## 1. Executive Summary

This document presents a comprehensive, production-grade audit and integration blueprint for the **VYBZ // ARCADE SYSTEM 01.04** repository. 

### Current State
1. **Frontend**: A highly polished, cyberpunk/retro-arcade interactive web application built with **Next.js 16.3.4 (App Router)**, **React 19.2.8**, **TypeScript 5**, **GSAP 3.15** (ScrollTrigger), and **Tailwind CSS v4**. Currently, all gameplay mechanics (chat ingestion, trivia question display, answer validation, scoring, cartridge loading, and player memory profiling) run entirely on **mock, simulated client-side state** with zero network requests.
2. **Backend**: An independent backend prototype located in `gemini services/` (and duplicated in `c2c-main/`) that contains Gemini AI models and interactions integration (`@google/genai`), Supabase client initialization (`@supabase/supabase-js`), a relational PostgreSQL schema (`schema.prisma`), prototype Next.js Route Handlers, and standalone persistence/moderation scripts.
3. **Integration Status**: The backend was written in isolation and has **never been wired to the frontend**. Core packages (`@google/genai`, `@supabase/supabase-js`, `@prisma/client`, `prisma`) are not installed in the root project; route handlers reference missing paths (`@/lib/gemini`, `@/lib/supabase`); and data contract mismatches exist between Gemini's trivia output and the frontend's 4-option labeled button arcade UI.

### Integration Verdict & Recommended Architecture
The backend should be integrated **directly into the Next.js App Router** (Option A: Monolithic Next.js Full-Stack App) using standard App Router Route Handlers (`app/api/**/route.ts`) backed by a normalized service layer in `lib/`. 

Running a separate Node.js microservice is strongly discouraged because both sides are already written for Next.js App Router, and direct Route Handlers eliminate CORS overhead, simplify deployment to a single Vercel/Node target, maintain zero-latency in-memory pipeline transitions, and allow unified TypeScript contracts across client and server.

---

## 2. Current Architecture

### Repository Directory Map
```
nishant-chat/
├── app/
│   ├── favicon.ico
│   ├── globals.css              # Custom phosphor/arcade design tokens & CRT shaders
│   ├── layout.tsx               # Root layout importing Space Grotesk & JetBrains Mono
│   └── page.tsx                 # 4,433-line monolithic interactive client showcase
├── components/
│   ├── sections/                # 13 modular section components + HeaderNav + Footer
│   │   ├── Footer.tsx
│   │   ├── HeaderNav.tsx
│   │   ├── Section01BootHero.tsx
│   │   ├── Section02Input.tsx
│   │   ├── Section03DataPort.tsx
│   │   ├── Section04Analysis.tsx
│   │   ├── Section05Transform.tsx
│   │   ├── Section06ArcadeShelf.tsx
│   │   ├── Section07Gameplay.tsx
│   │   ├── Section08Memory.tsx
│   │   ├── Section09MemoryBank.tsx
│   │   ├── Section10GameLoop.tsx
│   │   ├── Section11Editorial.tsx
│   │   ├── Section12Status.tsx
│   │   └── Section13FinalCta.tsx
│   └── ui/                      # 5 shared UI & audio modules
│       ├── Barcode.tsx
│       ├── CrtOverlay.tsx
│       ├── CustomCursor.tsx
│       ├── ScrambleText.tsx
│       └── SoundSystem.ts       # Retro 8-bit Web Audio synthesizer
├── lib/
│   └── motion.ts                # GSAP animations (scrambleText, crtPowerOn, magnetic buttons)
├── gemini services/             # Independent Backend Prototype (Scaffolded as "vybz-nextjs")
│   ├── AI Game master.js        # Prototype Route Handler for AI referee
│   ├── Save generated questions.js # Standalone script snippet saving to Prisma
│   ├── Video moderation.js      # Standalone script snippet using Gemini File API
│   ├── gemini.js / gemini.ts    # GoogleGenAI client singleton
│   ├── route.js                 # Prototype Route Handler for question generation
│   ├── route.ts                 # Prototype Route Handler for media moderation
│   ├── schema.prisma            # PostgreSQL schema (User, Game, Question, Media)
│   ├── supabase.js              # Supabase client singleton
│   └── package.json             # Lists @google/genai and @supabase/supabase-js
├── c2c-main/                    # Redundant uncommitted duplicate of "gemini services/"
├── .env                         # Empty 0-byte root environment file
├── next.config.ts
├── package.json                 # Frontend dependencies (next, react, gsap, tailwind)
└── tsconfig.json                # Paths alias: "@/*": ["./*"]
```

### Key Architectural Observations
1. **Frontend Architecture**:
   - `app/page.tsx` is an all-in-one 4,433-line client component that contains all 13 arcade sections inline.
   - `components/sections/` contains modular versions of each section (`Section01` to `Section13`), but `app/page.tsx` does **not** import them. `app/page.tsx` is the live entrypoint.
   - All state is local React state. No `fetch()`, `axios`, React Query, or SWR exists anywhere in the frontend.
2. **Backend Architecture**:
   - `gemini services/` was initialized as a Next.js 16 app (`name: "vybz-nextjs"`).
   - Some files are App Router route handlers (`route.ts`, `route.js`, `AI Game master.js`), but their filenames contain spaces (`AI Game master.js`) or are sitting in the root of `gemini services/` rather than within an `app/api/...` directory structure.
   - Other files (`Save generated questions.js`, `Video moderation.js`) are standalone code snippets with free, undeclared variables (`data`, `gameId`, `videoPath`).
   - Route handlers import `@/lib/gemini` and `@/lib/supabase`, but these files do not exist in `lib/`.
   - `c2c-main/` is a byte-for-byte duplicate clone of `gemini services/` that produces redundant TypeScript errors.

---

## 3. Frontend Audit

### Framework & Environment
- **Framework**: Next.js 16.3.4 (App Router).
- **React**: React 19.2.8.
- **Language**: TypeScript 5.
- **Client vs Server**: 100% of frontend rendering code is declared with `"use client"`.

### State Management (`app/page.tsx`)
| State Variable | Type | Current Purpose | Backend Connection Needed |
| :--- | :--- | :--- | :--- |
| `coins` | `number` | Arcade credits counter (starts at 2) | Optional: sync with `GamePlayer.credits` or keep client-side session |
| `muted` | `boolean` | Web Audio sound engine toggle | Client-side only |
| `activeCart` | `number` | Selected ROM cartridge index (0–4) | Fetch cartridge metadata & game rules from backend |
| `uploadStage` | `number` | Simulated ingestion stage (0=Idle, 1=70%, 2=88%, 3=100%, 4=Ready) | Connect to real upload, parsing, and indexing progress |
| `score` | `number` | Current player score (starts at 8420) | Sync with `GamePlayer.score` via API |
| `selectedAns` | `string \| null` | Key of selected answer option ("A".."D") | Client gameplay state |
| `answerState` | `null \| "correct" \| "wrong"` | Validation state of selected answer | Backend answer verification / scoring |
| `telemetryStatus` | `string` | Dynamic HUD banner string (e.g. `● ONLINE`) | Can reflect real AI and API health status |
| `activeSectionId` | `string` | Active scroll position ID | UI navigation only |

### Current Interaction Flows

#### 1. Ingestion Flow (Section 03 Data Port — lines 978–993, 2220–2415)
- User clicks "DROP CHAT FILE HERE" or "SELECT FILE →".
- Invokes `simulateUpload()`:
  ```typescript
  const simulateUpload = useCallback(() => {
    snd.click();
    setUploadStage(1); // "INGESTING..." 70%
    setTimeout(() => { snd.click(); setUploadStage(2); }, 700);  // "PARSING..." 88%
    setTimeout(() => { snd.click(); setUploadStage(3); }, 1400); // "INDEXING..." 100%
    setTimeout(() => { snd.success(); setUploadStage(4); }, 2200); // "READY // SYSTEM READY FOR ANALYSIS"
  }, []);
  ```
- **Limitation**: No `<input type="file">`, no file reader, no payload sent to server, no chat parsing.

#### 2. Gameplay Flow (Section 07 Gameplay — lines 956–976, 3360–3475)
- Displays a single hardcoded question:
  - Quote: `"I literally told you guys not to touch the aux cord five minutes ago"`
  - Options:
    - `A`: Alex — THE AUX TYRANT (`correct: true`)
    - `B`: Maya — LORE KEEPER (`correct: false`)
    - `C`: Sam — VOICE NOTE POET (`correct: false`)
    - `D`: Liam — SERIAL CONTRARIAN (`correct: false`)
- User clicks option: `pickAnswer(key, correct)`:
  - If `correct`: `setAnswerState("correct")`, `setScore(s => s + 500)`, plays success chime.
  - If `!correct`: `setAnswerState("wrong")`, plays error buzz.
- User clicks "NEXT →": `nextQuestion()` resets `answerState` and `selectedAns` to `null`.
- **Limitation**: Clicking "NEXT →" does not load a new question; it simply clears the buttons on the same question.

#### 3. Arcade Cartridge Flow (Section 06 Arcade Shelf — lines 320–366)
- 5 ROM cartridges are hardcoded in an array:
  - `ROM // 001`: "WHO SAID IT?" (Author identification)
  - `ROM // 002`: "MEMORY BANK" (Chronological recall)
  - `ROM // 003`: "FRIENDSHIP QUIZ" (Behavior prediction)
  - `ROM // 004`: "HOT TAKE MACHINE" (Controversy metric)
  - `ROM // 005`: "CHAOS MODE" (Speedrun unfiltered)
- **Limitation**: Clicking different cartridges updates `activeCart` in state, but does not alter the gameplay questions or load different game modes.

#### 4. Player Profiling & Memory Flow (Section 08 & 09 — lines 3480–3750)
- Hardcoded stats for 4 participants:
  - Alex: 94% Aux tyrant
  - Maya: 88% Lore keeper
  - Sam: 72% Voice note poet
  - Liam: 64% Chronic contrarian
- **Limitation**: Clicking "TRIGGER ADAPTATION" runs a GSAP glitch animation but changes no underlying data.

---

## 4. Backend / Gemini Services Audit

### File-by-File Breakdown

#### `gemini services/gemini.ts` & `gemini.js`
- **Role**: Gemini SDK client instance.
- **Implementation**:
  ```typescript
  import { GoogleGenAI } from "@google/genai";
  export const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  ```
- **Type**: Server-side helper module.
- **Dependencies**: `@google/genai` (Google Gen AI SDK v2).
- **Environment Dependency**: `process.env.GEMINI_API_KEY`.
- **Issues**:
  - Missing in root `node_modules`.
  - Imported by other files as `@/lib/gemini`, but stored in `gemini services/`.
  - Should be relocated to `lib/gemini.ts`.

#### `gemini services/supabase.js`
- **Role**: Supabase client instance.
- **Implementation**:
  ```javascript
  import { createClient } from "@supabase/supabase-js";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase environment variables are missing.");
  }
  export const supabase = createClient(supabaseUrl, supabasePublishableKey);
  ```
- **Type**: Client/Server helper module.
- **Dependencies**: `@supabase/supabase-js`.
- **Environment Dependency**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Side Effect**: **Throws a fatal exception on module import** if environment variables are not populated. In Next.js, importing this without `.env` set crashes the server/build process. Must be made resilient with lazy evaluation or clean validation.

#### `gemini services/schema.prisma`
- **Role**: Relational database schema for PostgreSQL.
- **Datasource**: PostgreSQL via `env("DATABASE_URL")`.
- **Models**:
  - `User`: `id` (cuid), `username`, `interests`, `createdAt`, relations to `GamePlayer` and `Media`.
  - `Game`: `id` (cuid), `name`, `status` (default "LOBBY"), `category`, `difficulty`, `createdAt`, relations to `GamePlayer` and `Question`.
  - `GamePlayer`: `id` (cuid), `userId`, `gameId`, `score` (default 0), unique `[userId, gameId]`.
  - `Question`: `id` (cuid), `gameId`, `question`, `options` (Json), `answer`, `explanation`, `difficulty`, `category`.
  - `Media`: `id` (cuid), `userId`, `url`, `type`, `moderationStatus`, `moderationReason`, `createdAt`.
- **Dependencies**: `@prisma/client` and `prisma` (neither is currently installed).
- **Discrepancies**:
  - `schema.prisma` defines table `Media` with fields `moderationStatus` and `moderationReason`.
  - But `gemini services/route.ts` executes an update against table `"memories"` with fields `allowed`, `confidence`, and `reason`.

#### `gemini services/route.js` (Question Generator)
- **Role**: Next.js App Router POST handler to generate trivia questions.
- **Target Route**: `app/api/questions/generate/route.ts`.
- **Input**: `{ interests: string[], difficulty?: string, count?: number }`.
- **Logic**:
  - Prompts Gemini to act as trivia question generator.
  - Calls `gemini.interactions.create` with `model: "gemini-3.8-flash"` and structured JSON response format.
  - Returns `Response.json(JSON.parse(response.output_text))`.
- **Issues**:
  - Expects `interests: string[]`. Does not accept raw chat exports.
  - Generates plain string array for `options` (`["Option 1", "Option 2", ...]`), whereas frontend requires labeled option objects (`[{ key: "A", label: "Alex", tag: "THE AUX TYRANT" }, ...]`).
  - Does not persist generated questions to the database.

#### `gemini services/AI Game master.js` (Game Referee)
- **Role**: Next.js App Router POST handler for dynamic game orchestration.
- **Target Route**: `app/api/game/master/route.ts`.
- **Input**: `{ players, currentQuestion, scores, round }`.
- **Logic**:
  - Prompts Gemini to act as game referee and decide the next game action: `NEXT_QUESTION`, `HINT`, `BONUS_ROUND`, `DIFFICULTY_UP`, `DIFFICULTY_DOWN`, `GAME_END`.
  - Calls `gemini.interactions.create` with structured JSON format: `{ action: string, message: string, difficulty?: string, category?: string }`.
  - Returns `Response.json(JSON.parse(response.output_text))`.
- **Issues**:
  - Invalid filename (spaces in filename).
  - Uses `@/lib/gemini` import which doesn't exist.

#### `gemini services/route.ts` (Media Safety Moderation)
- **Role**: Next.js App Router POST handler for content moderation.
- **Target Route**: `app/api/media/moderate/route.ts`.
- **Input**: `{ id: string, mimeType: string, base64: string }`.
- **Logic**:
  - Validates `id`, `mimeType`, `base64`.
  - Calls `gemini.models.generateContent` with inline base64 image/video data.
  - Requests JSON: `{ allowed: boolean, category: string, confidence: number, reason: string }`.
  - Updates Supabase table `"memories"` where `id == body.id`.
- **Issues**:
  - Table name mismatch (`memories` vs Prisma `Media`).
  - Base64 payload size limitation: Large video files will fail or cause memory bloat; inline data is only suitable for short clips or images.

#### `gemini services/Save generated questions.js`
- **Role**: Reusable persistence snippet.
- **Logic**: Iterates over `data.questions` and writes to `prisma.question.create`.
- **Issues**:
  - Not an endpoint; raw top-level script snippet with free variables (`data`, `gameId`).
  - Must be encapsulated into a reusable service function: `saveQuestionsToGame(gameId: string, questions: QuestionRecord[])`.

#### `gemini services/Video moderation.js`
- **Role**: Large video moderation snippet using Gemini File API.
- **Logic**: Calls `gemini.files.upload`, polls `gemini.files.get` until `state !== "PROCESSING"`, then calls `gemini.interactions.create`.
- **Issues**: Standalone snippet with free variable `videoPath`. Should be encapsulated into `lib/services/moderation.ts` for handling video uploads exceeding 20MB.

---

## 5. Current Data Flow vs Target Data Flow

### Flow A: Chat Ingestion & ROM Compilation
```
CURRENT FLOW:
User Clicks "Drop Chat"
  ↓
simulateUpload() in app/page.tsx
  ↓
Four setTimeout() calls (0ms → 700ms → 1400ms → 2200ms)
  ↓
uploadStage state transitions (0 → 1 → 2 → 3 → 4)
  ↓
UI shows "SYSTEM READY FOR ANALYSIS" (NO ACTUAL DATA)

TARGET INTEGRATED FLOW:
User drops WhatsApp .txt / Discord .json / Telegram .csv
  ↓
FileReader reads file in browser
  ↓
POST /api/chat/ingest (FormData or JSON text)
  ↓
Server parser parses participants, timestamps, quotes, themes
  ↓
POST /api/questions/generate (or orchestrated pipeline)
  ↓
Gemini 3.8/2.5 Flash analyzes chat lore & synthesizes questions
  ↓
Prisma saves questions to Game table
  ↓
Response returns compiled Cartridge: { id, title, questions: [...] }
  ↓
Frontend state updates activeCartridge & questions array
  ↓
Section 07 Gameplay displays real quotes and participant tags!
```

### Flow B: Gameplay & AI Game Master Loop
```
CURRENT FLOW:
User clicks Option "A"
  ↓
pickAnswer("A", true)
  ↓
answerState = "correct", score += 500, sound.playSuccess()
  ↓
User clicks "NEXT →"
  ↓
nextQuestion() resets answerState to null (SAME QUESTION REMAINS)

TARGET INTEGRATED FLOW:
User clicks Option "A"
  ↓
Frontend records selection & validates answer (or POST /api/game/answer)
  ↓
score updated, sound triggered, feedback banner shown
  ↓
User clicks "NEXT →"
  ↓
currentQuestionIndex increments → loads Next Question from live array
  ↓
If round completes or difficulty shifts:
  ↓
POST /api/game/master with { players, currentQuestion, scores, round }
  ↓
Gemini decides action: "BONUS_ROUND", "HINT", "DIFFICULTY_UP"
  ↓
Frontend HUD displays Game Master banner and transitions state!
```

---

## 6. Proposed Architecture

### Recommendation: Option A — Monolithic Next.js App Router Full-Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER CLIENT                                │
│  app/page.tsx / components/sections/ / components/ui/                   │
│  - Custom CRT / Phosphor HUD / Audio Synthesizer                        │
│  - Real File Drop & Ingestion State                                     │
│  - Dynamic Trivia & AI Game Master State                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP fetch (JSON / FormData)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS ROUTE HANDLERS (SERVER)                    │
│                                                                         │
│  app/api/chat/ingest/route.ts       ── Parses chat text, extracts lore  │
│  app/api/questions/generate/route.ts── Invokes Gemini for trivia        │
│  app/api/game/create/route.ts       ── Creates Game & GamePlayer in DB  │
│  app/api/game/[id]/route.ts         ── Reads game questions & state     │
│  app/api/game/master/route.ts       ── AI Game Master arbitration       │
│  app/api/media/moderate/route.ts    ── Multimodal content safety check  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Internal function calls
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER (lib/)                          │
│                                                                         │
│  lib/gemini.ts         ── GoogleGenAI client singleton                  │
│  lib/services/ai.ts    ── Question generation & Game Master logic       │
│  lib/services/chat.ts  ── WhatsApp, Telegram, Discord parsers           │
│  lib/db.ts             ── Prisma Client singleton                       │
│  lib/supabase.ts       ── Supabase client (storage/realtime)            │
└──────────────────┬──────────────────────────────────┬───────────────────┘
                   │                                  │
                   ▼                                  ▼
         ┌──────────────────┐               ┌──────────────────┐
         │    GEMINI API    │               │  SUPABASE / PG   │
         │ gemini-3.8-flash │               │  PostgreSQL DB   │
         │ gemini-2.5-flash │               │ (Prisma Managed) │
         └──────────────────┘               └──────────────────┘
```

### Why This Fits This Specific Repository
1. **Zero New Server Infrastructure**: Avoids configuring Express, Fastify, CORS origins, separate SSL, or multi-port local dev.
2. **Next.js 16 Native**: Next.js 16 App Router handles both high-performance streaming API endpoints and client components seamlessly.
3. **Type Safety Across Boundaries**: Client and server can import the same TypeScript interfaces from `types/api.ts`.
4. **Protects Secrets**: Server-side Route Handlers ensure `GEMINI_API_KEY` and `DATABASE_URL` are never bundled into client JavaScript.

---

## 7. API Contract

### 1. `POST /api/chat/ingest`
- **Purpose**: Ingest raw chat export file (`.txt`, `.json`, `.csv`), parse participant identities, and extract quote candidates.
- **Headers**: `Content-Type: multipart/form-data` or `application/json`.
- **Request Body (JSON format)**:
  ```json
  {
    "rawText": "[12/04/2024, 14:32:10] Alex: bro no way\n[12/04/2024, 14:33:05] Maya: remember last summer?...",
    "sourceType": "whatsapp"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "participants": ["Alex", "Maya", "Sam", "Liam"],
    "messageCount": 1420,
    "topQuotes": [
      { "author": "Alex", "text": "I literally told you guys not to touch the aux cord five minutes ago", "timestamp": "14:32" },
      { "author": "Liam", "text": "you literally said the opposite yesterday", "timestamp": "14:35" }
    ],
    "inferredInterests": ["music", "road trips", "gaming", "arguments"]
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  { "error": "Invalid or empty chat text provided" }
  ```

### 2. `POST /api/questions/generate`
- **Purpose**: Generate structured trivia questions based on participants and chat lore.
- **Headers**: `Content-Type: application/json`.
- **Request Body**:
  ```json
  {
    "gameId": "game_clx123456",
    "participants": ["Alex", "Maya", "Sam", "Liam"],
    "interests": ["music", "aux cord", "summer trips"],
    "quotes": [
      "I literally told you guys not to touch the aux cord five minutes ago"
    ],
    "difficulty": "medium",
    "count": 5
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "questions": [
      {
        "id": "q_001",
        "round": "ROUND 01 / 05",
        "category": "ROM // 001: WHO SAID IT?",
        "prompt": "WHO WOULD MOST LIKELY SAY THIS?",
        "quote": "\"I literally told you guys not to touch the aux cord five minutes ago\"",
        "correctAnswer": "A",
        "options": [
          { "key": "A", "label": "Alex", "tag": "THE AUX TYRANT" },
          { "key": "B", "label": "Maya", "tag": "LORE KEEPER" },
          { "key": "C", "label": "Sam", "tag": "VOICE NOTE POET" },
          { "key": "D", "label": "Liam", "tag": "SERIAL CONTRARIAN" }
        ],
        "explanation": "Alex sent this during the road trip on July 14th after 3 songs were skipped.",
        "difficulty": "medium"
      }
    ]
  }
  ```

### 3. `POST /api/game/master`
- **Purpose**: AI Game Master arbitration between rounds.
- **Headers**: `Content-Type: application/json`.
- **Request Body**:
  ```json
  {
    "round": 3,
    "players": [
      { "id": "p1", "name": "Alex", "score": 1500 },
      { "id": "p2", "name": "Maya", "score": 1200 }
    ],
    "currentQuestion": {
      "id": "q_003",
      "quote": "bro no way"
    },
    "scores": { "Alex": 1500, "Maya": 1200 }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "action": "BONUS_ROUND",
    "message": "Scores are neck-and-neck! Initiating 30-second speed challenge.",
    "difficulty": "hard",
    "category": "ROM // 004: HOT TAKE MACHINE"
  }
  ```

### 4. `POST /api/media/moderate`
- **Purpose**: Moderates uploaded image/video media for community safety.
- **Headers**: `Content-Type: application/json`.
- **Request Body**:
  ```json
  {
    "id": "med_123456",
    "mimeType": "image/jpeg",
    "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "allowed": true,
    "category": "safe",
    "confidence": 0.98,
    "reason": "Media contains benign group photo, no prohibited content detected"
  }
  ```
- **Error Response (500 Internal Server Error)**:
  ```json
  {
    "allowed": false,
    "category": "review",
    "confidence": 0,
    "reason": "Moderation inspection failed"
  }
  ```

---

## 8. Data Models / Type Contracts

### Shared TypeScript Definitions (`types/api.ts`)

```typescript
// Option in the arcade 4-button layout
export interface ArcadeOption {
  key: "A" | "B" | "C" | "D";
  label: string;
  tag: string;
}

// Full Question Contract used by Frontend & Backend
export interface ArcadeQuestion {
  id: string;
  round: string;
  category: string;
  prompt: string;
  quote: string;
  options: ArcadeOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
}

// Chat Ingestion Request & Result
export interface ChatIngestRequest {
  rawText: string;
  sourceType?: "whatsapp" | "discord" | "telegram" | "generic";
}

export interface ChatIngestResponse {
  participants: string[];
  messageCount: number;
  topQuotes: { author: string; text: string; timestamp?: string }[];
  inferredInterests: string[];
}

// Question Generation Request & Response
export interface GenerateQuestionsRequest {
  gameId?: string;
  participants: string[];
  interests: string[];
  quotes?: string[];
  difficulty?: string;
  count?: number;
}

export interface GenerateQuestionsResponse {
  questions: ArcadeQuestion[];
}

// AI Game Master Request & Response
export interface GameMasterRequest {
  round: number;
  players: { id: string; name: string; score: number }[];
  currentQuestion?: Partial<ArcadeQuestion>;
  scores: Record<string, number>;
}

export interface GameMasterResponse {
  action: "NEXT_QUESTION" | "HINT" | "BONUS_ROUND" | "DIFFICULTY_UP" | "DIFFICULTY_DOWN" | "GAME_END";
  message: string;
  difficulty?: string;
  category?: string;
}

// Media Moderation Request & Response
export interface ModerationRequest {
  id: string;
  mimeType: string;
  base64: string;
}

export interface ModerationResponse {
  allowed: boolean;
  category: string;
  confidence: number;
  reason: string;
}
```

### Data Mismatch Reconciliation Adapter
Because Gemini's initial prototype in `route.js` outputted a plain `string[]` for options, the service layer must normalize it to `ArcadeOption[]`:
```typescript
export function normalizeTriviaToArcadeQuestion(
  raw: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    difficulty: string;
    category: string;
  },
  index: number
): ArcadeQuestion {
  const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
  
  // Find correct key by matching answer string against options
  const correctIdx = raw.options.findIndex(
    (opt) => opt.toLowerCase().trim() === raw.answer.toLowerCase().trim()
  );
  const correctAnswer = keys[correctIdx >= 0 ? correctIdx : 0];

  return {
    id: `q_${Date.now()}_${index}`,
    round: `ROUND ${String(index + 1).padStart(2, "0")} / 05`,
    category: raw.category || "ROM // 001: WHO SAID IT?",
    prompt: "WHO SAID OR WOULD MOST LIKELY SAY THIS?",
    quote: raw.question.startsWith('"') ? raw.question : `"${raw.question}"`,
    correctAnswer,
    options: raw.options.slice(0, 4).map((opt, i) => ({
      key: keys[i],
      label: opt,
      tag: `ARCHIVE // LOG #${i + 1}`,
    })),
    explanation: raw.explanation,
    difficulty: (raw.difficulty as ArcadeQuestion["difficulty"]) || "medium",
  };
}
```

---

## 9. Database Integration

### Current Persistence State
1. **Prisma**: Defined in `gemini services/schema.prisma`. Targets `DATABASE_URL` (PostgreSQL).
2. **Supabase**: Defined in `gemini services/supabase.js`. Uses `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. **Database Discrepancy**:
   - `route.ts` runs an update against Supabase table `"memories"` (`allowed`, `confidence`, `reason`).
   - `schema.prisma` declares table `Media` (`moderationStatus`, `moderationReason`).

### Source of Truth Recommendation
- **Single Source of Truth**: The PostgreSQL database hosted on **Supabase**.
- **ORM / Access Layer**: Use **Prisma Client** as the primary data access layer inside Next.js Route Handlers.
  - Generates type-safe client models for `User`, `Game`, `GamePlayer`, `Question`, `Media`.
  - Connects to Supabase Postgres via `DATABASE_URL = "postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"`.
- **Supabase JS Client**: Keep for:
  1. Client-side authentication (if added later).
  2. Supabase Storage (uploading raw chat files or media).
  3. Realtime subscriptions (multiplayer scoreboard syncing).

### Prisma Singleton Pattern for Next.js (`lib/db.ts`)
To prevent connection pool exhaustion during Next.js hot-reloading:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

---

## 10. Gemini / AI Integration

### Complete Pipeline Trace
1. **Input Preparation**:
   - Chat parser extracts candidate quotes and user handles from uploaded chat export.
   - Summarizes participant quirks and chat themes.
2. **Model Selection**:
   - Primary: `"gemini-2.5-flash"` or `"gemini-3.8-flash"` via `@google/genai`.
   - Fallback: `"gemini-2.0-flash"` if 3.8/2.5 is unavailable in the API key's region.
3. **Structured Outputs**:
   - Use `config: { responseMimeType: "application/json", responseSchema: ... }` on `ai.models.generateContent` or `response_format` on `ai.interactions.create`.
   - Never rely on unconstrained text output.
4. **Resilience & Parsing**:
   - Clean markdown code fences (```json ... ```) prior to `JSON.parse`.
   - Wrap in `try/catch` with a fallback trivia generator if Gemini returns truncated JSON.
5. **Token Limits & Latency**:
   - Chat exports can be hundreds of thousands of lines. Chat exports must be chunked or sampled client-side/server-side before sending to Gemini (e.g. sample top 100 interesting messages rather than dumping 50MB of logs).

---

## 11. Environment Variables

| Variable | Used By | Server/Client | Purpose | Required? | Secret? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | `@google/genai` | **Server Only** | Authenticates with Google Gemini API | **YES** | **YES (Never expose)** |
| `DATABASE_URL` | Prisma Client | **Server Only** | PostgreSQL connection string to Supabase | **YES** | **YES (Never expose)** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Client | Server & Client | Supabase Project URL | **YES** | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Client | Server & Client | Supabase public anonymous API key | **YES** | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Server Admin | **Server Only** | Privileged Supabase key for bypassing RLS | Optional | **YES (Never expose)** |

> [!CAUTION]
> `GEMINI_API_KEY` and `DATABASE_URL` must NEVER have the `NEXT_PUBLIC_` prefix. If either variable is exposed to the browser, API quotas and database contents can be compromised.

---

## 12. Dependency Changes

### Comparison & Requirements

| Package | In Frontend `package.json`? | In `gemini services/package.json`? | Action Required in Root |
| :--- | :---: | :---: | :--- |
| `@google/genai` | ❌ No | ✅ `^2.21.0` | **Install in root** (`npm install @google/genai`) |
| `@supabase/supabase-js` | ❌ No | ✅ `^2.115.0` | **Install in root** (`npm install @supabase/supabase-js`) |
| `@prisma/client` | ❌ No | ❌ No | **Install in root** (`npm install @prisma/client`) |
| `prisma` | ❌ No | ❌ No | **Install in root as devDep** (`npm install -D prisma`) |
| `gsap` & `@gsap/react` | ✅ Yes | ❌ No | Keep existing |
| `next` | ✅ `16.3.4` | ✅ `16.3.4` | Keep existing |
| `react` & `react-dom` | ✅ `19.2.8` | ✅ `19.2.8` | Keep existing |

### Exact Installation Command (To be run during execution)
```bash
npm install @google/genai @supabase/supabase-js @prisma/client
npm install -D prisma
```

---

## 13. Security Considerations

1. **Server-Side Boundary Enforcement**:
   - `gemini.ts` and `db.ts` must use Next.js `"server-only"` or remain strictly within `/app/api/**` or server utility files.
2. **Prompt Injection Hardening**:
   - Chat logs contain untrusted user text. Prompts must wrap chat text in clearly demarcated delimiters (e.g. `<chat_logs>...</chat_logs>`) with explicit system instructions to ignore meta-instructions found inside messages.
3. **Payload Sanitization & Size Limits**:
   - `POST /api/chat/ingest`: Limit file upload payload size to 10MB to prevent memory exhaustion.
   - `POST /api/media/moderate`: Reject base64 strings larger than 15MB.
4. **Database Access & RLS**:
   - When using Prisma, all database transactions run server-side over SSL.
   - If client Supabase calls are used, ensure Row Level Security (RLS) policies are active on `memories`, `games`, and `questions`.

---

## 14. Feature-by-Feature Integration

### Feature 1: File Drop & Chat Ingestion (Section 03 Data Port)
- **Frontend Target**: `app/page.tsx` lines 2220–2288.
- **Current**: `onClick={simulateUpload}` with fake timers.
- **Integration**:
  - Add a hidden `<input type="file" accept=".txt,.json,.csv" ref={fileInputRef} />`.
  - On file selection or drop, read file text using `FileReader`.
  - Set `uploadStage = 1` ("INGESTING...").
  - Send text to `POST /api/chat/ingest`.
  - Set `uploadStage = 2` ("PARSING...").
  - On success, set `uploadStage = 3` ("INDEXING...") then `uploadStage = 4` ("READY").
  - Automatically pass participants and extracted quotes to question generation.

### Feature 2: Cartridge Generation & Live Trivia (Section 06 & 07)
- **Frontend Target**: `app/page.tsx` lines 3360–3475.
- **Current**: Single hardcoded question.
- **Integration**:
  - Maintain `questions` state array in `app/page.tsx`: `const [questions, setQuestions] = useState<ArcadeQuestion[]>([])`.
  - Maintain `currentQIndex` state: `const [currentQIndex, setCurrentQIndex] = useState(0)`.
  - Call `POST /api/questions/generate` when user selects a ROM cartridge or completes chat upload.
  - Render `questions[currentQIndex].quote` and `questions[currentQIndex].options`.
  - When user clicks an answer, check against `questions[currentQIndex].correctAnswer`.
  - "NEXT →" advances `currentQIndex += 1`, resetting button states.

### Feature 3: Dynamic AI Game Master Arbitration (Section 07 & 10)
- **Frontend Target**: After question 5 or upon score milestone.
- **Integration**:
  - When round ends, send current scores to `POST /api/game/master`.
  - Game master response triggers HUD banner alert (e.g. `BONUS_ROUND` or `DIFFICULTY_UP`).
  - Audio synthesizer plays `sound.playCoin()` or special fanfare.

---

## 15. Required File Changes

### New Files to Create
1. `lib/gemini.ts`: Relocated and hardened Gemini SDK client with environment validation.
2. `lib/supabase.ts`: Relocated Supabase client with safe fallback initialization.
3. `lib/db.ts`: Prisma Client singleton for Next.js App Router.
4. `lib/services/chat-parser.ts`: Server-side parser for WhatsApp, Discord, and generic chat exports.
5. `lib/services/ai-trivia.ts`: Trivia question generation and Game Master arbitration service.
6. `types/api.ts`: Shared TypeScript interfaces for API contracts, questions, and options.
7. `app/api/chat/ingest/route.ts`: API route handler for chat upload and parsing.
8. `app/api/questions/generate/route.ts`: API route handler for Gemini question generation.
9. `app/api/game/master/route.ts`: API route handler for AI Game Master arbitration.
10. `app/api/media/moderate/route.ts`: API route handler for multimodal safety moderation.

### Existing Files to Modify
1. `package.json`: Add `@google/genai`, `@supabase/supabase-js`, `@prisma/client`, and `prisma`.
2. `.env`: Add placeholders for `GEMINI_API_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. `prisma/schema.prisma`: Move `gemini services/schema.prisma` to root `prisma/schema.prisma` (standard Next.js Prisma path).
4. `app/page.tsx`:
   - Replace `simulateUpload()` with real file reader and `fetch('/api/chat/ingest')`.
   - Replace hardcoded `answers` with dynamic `questions` array and `currentQIndex`.
   - Wire real score updates and Game Master alerts.

### Files to Clean Up / Remove After Migration
1. `c2c-main/`: Delete entire directory (redundant uncommitted copy).
2. `gemini services/`: Can be archived or removed once all logic is moved to `lib/` and `app/api/`.

---

## 16. Step-by-Step Implementation Plan

### Phase 1 — Environment & Core Dependencies
- **Task 1.1**: Install dependencies: `@google/genai`, `@supabase/supabase-js`, `@prisma/client`, and `prisma`.
- **Task 1.2**: Move `gemini services/schema.prisma` to standard path `prisma/schema.prisma`. Run `npx prisma generate`.
- **Task 1.3**: Configure root `.env` template.

### Phase 2 — Service Layer Normalization
- **Task 2.1**: Create `lib/gemini.ts` exporting configured `GoogleGenAI` instance.
- **Task 2.2**: Create `lib/supabase.ts` with lazy/safe client instantiation.
- **Task 2.3**: Create `lib/db.ts` with Prisma singleton.
- **Task 2.4**: Create `types/api.ts` with shared TypeScript contracts.
- **Task 2.5**: Create `lib/services/chat-parser.ts` to parse chat formats.
- **Task 2.6**: Create `lib/services/ai-trivia.ts` refactoring logic from `route.js` and `AI Game master.js`.

### Phase 3 — API Route Handlers
- **Task 3.1**: Implement `app/api/chat/ingest/route.ts`.
- **Task 3.2**: Implement `app/api/questions/generate/route.ts`.
- **Task 3.3**: Implement `app/api/game/master/route.ts`.
- **Task 3.4**: Implement `app/api/media/moderate/route.ts`.

### Phase 4 — Frontend Client Integration
- **Task 4.1**: Create lightweight API client in `lib/api-client.ts`.
- **Task 4.2**: Wire Section 03 Data Port dropzone in `app/page.tsx` to real file ingestion.
- **Task 4.3**: Wire Section 06 Arcade Shelf to load questions for selected ROM cartridge.
- **Task 4.4**: Wire Section 07 Gameplay to cycle through dynamic questions with live scoring.
- **Task 4.5**: Wire Section 10 Game Loop to trigger Game Master decisions.

### Phase 5 — Verification & Testing
- **Task 5.1**: Run `npx tsc --noEmit` to ensure zero compilation errors.
- **Task 5.2**: Test upload flow with real WhatsApp export sample.
- **Task 5.3**: Test question answer validation and score incrementing.
- **Task 5.4**: Clean up `c2c-main/` directory.

---

## 17. Blockers and Risks

| Risk / Blocker | Severity | Cause | Solution |
| :--- | :---: | :--- | :--- |
| **Missing Root Packages** | **CRITICAL** | `@google/genai` and `@supabase/supabase-js` are only in `gemini services/package.json` | Run `npm install @google/genai @supabase/supabase-js @prisma/client` in root |
| **Module Crash on Missing Env** | **CRITICAL** | `supabase.js` throws an error immediately on import if env vars are unset | Wrap initialization in a getter or return null with warning in development |
| **Interactions API vs Models API** | **HIGH** | `route.js` and `AI Game master.js` use `gemini.interactions.create`, whereas `route.ts` uses `gemini.models.generateContent` | Use `ai.models.generateContent` with structured JSON schema or verify Interactions API availability |
| **Invalid Backend Filenames** | **HIGH** | `AI Game master.js`, `Save generated questions.js` contain spaces and are outside `app/api/` | Refactor into clean camelCase service modules in `lib/` and clean route names |
| **Option Data Contract Mismatch** | **HIGH** | Gemini generates string options `["A", "B"]`, frontend expects `{ key, label, tag }` | Use `normalizeTriviaToArcadeQuestion()` adapter in the service layer |
| **Missing `DATABASE_URL`** | **MEDIUM** | Prisma cannot connect without active PostgreSQL connection | Support an in-memory/mock fallback mode when `DATABASE_URL` is empty during development |
| **Duplicate `c2c-main/` Folder** | **LOW** | Redundant copy of `gemini services/` | Remove `c2c-main/` |

---

## 18. Testing Plan

### Automated Verification
1. **Type Checking**:
   ```bash
   npx tsc --noEmit
   ```
   Must pass with 0 errors across the entire codebase.
2. **Next.js Build Validation**:
   ```bash
   npm run build
   ```
   Ensures all API routes and client pages compile and bundle correctly.

### Manual Verification Matrix
| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **File Upload (WhatsApp .txt)** | Drag sample `.txt` chat log into Data Port dropzone | `uploadStage` advances 0 → 1 → 2 → 3 → 4; audio plays; questions generate |
| **Trivia Question Display** | Scroll to Section 07 Gameplay | Dynamic quote from uploaded chat appears with 4 labeled participant options |
| **Correct Answer Selection** | Click the correct participant button | Button turns phosphor green; +500 points added; success chime plays |
| **Wrong Answer Selection** | Click incorrect participant button | Button turns phosphor red; error buzz plays; correct answer reveals |
| **Question Advancement** | Click "NEXT →" button | Next question in array loads; button states reset; score is preserved |
| **Cartridge Switching** | Click ROM 002 "MEMORY BANK" | Category and questions reload for chronological recall mode |
| **Audio Toggle** | Click sound toggle in header | Audio mutes/unmutes without throwing Web Audio API errors |

---

## 19. Final Integration Checklist

- [ ] Core packages installed in root (`@google/genai`, `@supabase/supabase-js`, `@prisma/client`, `prisma`).
- [ ] Root `.env` populated with valid development keys.
- [ ] Prisma schema relocated to `prisma/schema.prisma` and client generated.
- [ ] `lib/gemini.ts`, `lib/supabase.ts`, and `lib/db.ts` created without module-level crash side-effects.
- [ ] Chat parser service created in `lib/services/chat-parser.ts`.
- [ ] Trivia service created in `lib/services/ai-trivia.ts`.
- [ ] App Router endpoints created in `app/api/chat/ingest`, `app/api/questions/generate`, `app/api/game/master`, `app/api/media/moderate`.
- [ ] `app/page.tsx` dropzone wired to real file upload API.
- [ ] `app/page.tsx` gameplay wired to live questions array.
- [ ] Redundant `c2c-main/` folder removed.
- [ ] `npx tsc --noEmit` and `next dev` verified with zero errors.

---

## 20. Files That Should NOT Be Modified

To protect the retro-arcade brutalist design, visual identity, and performance:

1. **`app/globals.css`**: Do **NOT** modify or delete CRT scanline shaders, phosphor color tokens, dot-matrix canvas styles, or reset rules.
2. **`lib/motion.ts`**: Do **NOT** rewrite the GSAP animation logic (`scrambleText`, `triggerGlitchSlice`, `crtPowerOn`, `initMagneticButton`, `animateNumericValue`).
3. **`components/ui/SoundSystem.ts`**: Do **NOT** replace the Web Audio retro synthesizer.
4. **`components/ui/Barcode.tsx`**: Do **NOT** modify barcode SVG rendering logic.
5. **`components/ui/CrtOverlay.tsx`**: Do **NOT** alter screen boundary registration marks.
6. **`components/ui/CustomCursor.tsx`**: Do **NOT** alter the square GSAP HUD cursor.
7. **Visual Layout & Typography in `app/page.tsx`**: Do **NOT** alter font styles, colors, padding, borders, or GSAP ScrollTrigger timelines. Only wire state and handlers to real data!
