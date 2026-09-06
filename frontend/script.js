/**
 * PIXELBOND // RETRO ARCADE SCRIPT
 * Web Audio API 8-Bit Chiptune Synthesizer, Dynamic AI Trivia Engine,
 * Memory Vault Database & Friendship Compatibility Analyzer.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. NATIVE WEB AUDIO API 8-BIT SOUND SYNTHESIZER
     No external audio files required. Authentic retro chiptune sounds.
     ========================================================================== */
  let audioCtx = null;
  let soundEnabled = true;

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  // Helper: Play a synthetic note
  const playTone = (freq, type, duration, startTime = 0, gainLevel = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  // 8-Bit Coin Sound (Iconic Mario style)
  const playCoinSound = () => {
    playTone(987.77, 'square', 0.08, 0, 0.18); // B5
    playTone(1318.51, 'square', 0.28, 0.08, 0.18); // E6
  };

  // Navigation Click Blip
  const playBlipSound = () => {
    playTone(650, 'triangle', 0.05, 0, 0.12);
  };

  // Soft Button Hover Micro-Tick
  let lastHoverSoundTime = 0;
  const playHoverSound = () => {
    const now = Date.now();
    if (now - lastHoverSoundTime < 60) return; // Debounce
    lastHoverSoundTime = now;
    playTone(850, 'triangle', 0.025, 0, 0.04);
  };

  // Urgent Timer Tick Sound (Heartbeat panic)
  const playTickSound = () => {
    playTone(1200, 'square', 0.03, 0, 0.08);
  };

  // Correct Answer Chime (Ascending arpeggio)
  const playCorrectSound = () => {
    playTone(523.25, 'square', 0.1, 0, 0.15); // C5
    playTone(659.25, 'square', 0.1, 0.08, 0.15); // E5
    playTone(783.99, 'square', 0.1, 0.16, 0.15); // G5
    playTone(1046.50, 'square', 0.25, 0.24, 0.18); // C6
  };

  // Wrong Answer Buzzer (Low sawtooth buzz)
  const playWrongSound = () => {
    playTone(150, 'sawtooth', 0.15, 0, 0.22);
    playTone(110, 'sawtooth', 0.25, 0.12, 0.22);
  };

  // Victory Fanfare
  const playVictorySound = () => {
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.35, t: 0.36 },
      { f: 880.00, d: 0.15, t: 0.55 },
      { f: 1046.50, d: 0.5, t: 0.70 }
    ];
    notes.forEach((n) => playTone(n.f, 'square', n.d, n.t, 0.18));
  };

  /* ==========================================================================
     ARCADE PARTICLE SPARK & FLOATING SCORE ENGINE
     ========================================================================== */
  const particleContainer = document.getElementById('particle-container');

  // Spawn pixel sparks around a target coordinate
  const createPixelBurst = (x, y, count = 12, colors = ['#00f0ff', '#ff007f', '#ffe600', '#39ff14', '#ffffff']) => {
    if (!particleContainer) return;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'pixel-spark';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.floor(Math.random() * 6) + 4;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 75 + 25;
      
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 6px ${color}`;
      spark.style.setProperty('--dx', `${dx}px`);
      spark.style.setProperty('--dy', `${dy}px`);

      particleContainer.appendChild(spark);
      setTimeout(() => spark.remove(), 750);
    }
  };

  // Spawn floating score/combo tag
  const spawnFloatingScore = (x, y, text, color = '#39ff14') => {
    if (!particleContainer) return;
    const floater = document.createElement('div');
    floater.className = 'floating-score';
    floater.textContent = text;
    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    floater.style.color = color;

    particleContainer.appendChild(floater);
    setTimeout(() => floater.remove(), 1200);
  };

  /* ==========================================================================
     2. ARCADE CONTROLS & HUD LISTENERS
     ========================================================================== */
  // CRT Scanline Toggle
  const toggleCrtBtn = document.getElementById('toggle-crt-btn');
  if (toggleCrtBtn) {
    toggleCrtBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-enabled');
      const isEnabled = document.body.classList.contains('crt-enabled');
      toggleCrtBtn.querySelector('.hud-toggle-text').textContent = `CRT: ${isEnabled ? 'ON' : 'OFF'}`;
      playBlipSound();
    });
  }

  // Sound FX Toggle
  const toggleSoundBtn = document.getElementById('toggle-sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
      toggleSoundBtn.querySelector('.hud-toggle-text').textContent = `SFX: ${soundEnabled ? 'ON' : 'OFF'}`;
      if (soundEnabled) playCoinSound();
    });
  }

  // Insert Coin Button
  const insertCoinBtn = document.getElementById('insert-coin-btn');
  const creditCount = document.getElementById('credit-count');
  let credits = 4;
  if (insertCoinBtn && creditCount) {
    insertCoinBtn.addEventListener('click', () => {
      credits++;
      creditCount.textContent = credits < 10 ? `0${credits}` : `${credits}`;
      playCoinSound();
      creditCount.classList.remove('pulse');
      void creditCount.offsetWidth; // Trigger reflow
      creditCount.classList.add('pulse');
    });
  }

  // Navigation Tab Switching
  const tabButtons = document.querySelectorAll('.arcade-tab-btn');
  const sections = document.querySelectorAll('.arcade-section');

  const switchTab = (targetTabId) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });
    sections.forEach((sec) => {
      sec.classList.toggle('active', sec.id === targetTabId);
    });
    playBlipSound();
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const goToGameBtn = document.getElementById('go-to-game-btn');
  if (goToGameBtn) {
    goToGameBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }

  // Universal Interactive Button Sound & Particle FX Engine
  const setupInteractiveButtons = () => {
    const allButtons = document.querySelectorAll(
      '.btn-retro, .option-btn, .btn-retro-mini, .arcade-tab-btn, .btn-toggle-hud, .vault-filter-btn, .btn-retro-file'
    );

    allButtons.forEach((btn) => {
      // Hover micro-tick sound
      btn.addEventListener('mouseenter', () => {
        playHoverSound();
      });

      // Click pixel spark burst
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const clickX = e.clientX || rect.left + rect.width / 2;
        const clickY = e.clientY || rect.top + rect.height / 2;
        createPixelBurst(clickX, clickY, 12);
      });
    });
  };

  setupInteractiveButtons();

  // Periodic Glitch Burst on Title
  const glitchTitle = document.querySelector('.glitch-text');
  if (glitchTitle) {
    setInterval(() => {
      glitchTitle.classList.add('glitching');
      setTimeout(() => {
        glitchTitle.classList.remove('glitching');
      }, 400);
    }, 7000);
  }

  /* ==========================================================================
     3. DATABASE & MEMORY REPOSITORY ENGINE
     ========================================================================== */
  const dbMemoriesCount = document.getElementById('db-memories-count');
  const memoryCardsGrid = document.getElementById('memory-cards-grid');
  const terminalScreen = document.getElementById('terminal-screen');

  // Initial rich sample memory dataset
  const sampleMemories = [
    {
      id: 'mem-1',
      type: 'chat',
      category: 'Group Chat Quote',
      person: 'Alex',
      date: '2024-03-12',
      content: 'Alex: "I swear I am never eating ghost pepper wings again in my entire human existence." (Narrator: Ordered double hot wings 10 minutes later)',
      image: null
    },
    {
      id: 'mem-2',
      type: 'photo',
      category: 'Epic Trip Memory',
      person: 'Sam',
      date: '2024-07-19',
      content: 'The 3:15 AM gas station photo where Sam bought 4 giant plush avocados and insisted they were "strategic road pillows".',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"%3E%3Crect width="300" height="180" fill="%231a1630"/%3E%3Ccircle cx="80" cy="90" r="45" fill="%2339ff14" opacity="0.6"/%3E%3Ccircle cx="150" cy="90" r="45" fill="%2300f0ff" opacity="0.6"/%3E%3Ccircle cx="220" cy="90" r="45" fill="%23ff007f" opacity="0.6"/%3E%3Ctext x="150" y="95" fill="%23ffffff" font-family="monospace" font-size="14" text-anchor="middle"%3E[3:15 AM AVOCADO LORE]%3C/text%3E%3C/svg%3E'
    },
    {
      id: 'mem-3',
      type: 'joke',
      category: 'Legendary Inside Joke',
      person: 'Squad',
      date: '2024-09-04',
      content: 'Code Red "Pineapple": The secret safety code word invented when Alex got trapped in an Ikea display bedroom for 25 minutes.',
      image: null
    },
    {
      id: 'mem-4',
      type: 'chat',
      category: 'Late Night Epiphany',
      person: 'Sam',
      date: '2024-11-02',
      content: 'Sam at 2:48 AM: "Guys, what if pigeons in downtown are actually government remote testers for 5G speed?" Alex: "Go to sleep Sam."',
      image: null
    },
    {
      id: 'mem-5',
      type: 'photo',
      category: 'Photo/Video Mystery',
      person: 'Alex',
      date: '2025-01-14',
      content: 'Photo of the legendary ruined birthday cake that survived a 40mph scooter ride across town. Surprisingly delicious.',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"%3E%3Crect width="300" height="180" fill="%232b1328"/%3E%3Cpolygon points="150,30 230,140 70,140" fill="%23ffe600" opacity="0.7"/%3E%3Ctext x="150" y="100" fill="%23ffffff" font-family="monospace" font-size="14" text-anchor="middle"%3E[CAKE ON WHEELS]%3C/text%3E%3C/svg%3E'
    },
    {
      id: 'mem-6',
      type: 'joke',
      category: 'Legendary Inside Joke',
      person: 'Alex & Sam',
      date: '2025-05-22',
      content: 'The "Five-Minute Meeting" that turned into an 8-hour marathon re-watching 90s animated movie trailers in the cafeteria.',
      image: null
    }
  ];

  let activeMemories = [...sampleMemories];

  // Helper: Log terminal output
  const logTerminal = (text, type = 'info') => {
    if (!terminalScreen) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = `> ${text}`;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  };

  // Render Memory Cards in Tab 3
  const renderMemoryCards = (filter = 'all') => {
    if (!memoryCardsGrid) return;
    memoryCardsGrid.innerHTML = '';

    const filtered = activeMemories.filter((m) => {
      if (filter === 'all') return true;
      return m.type === filter;
    });

    if (filtered.length === 0) {
      memoryCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; font-family: var(--font-arcade); font-size: 0.75rem; color: var(--text-dim);">
          NO MEMORIES FOUND IN THIS CLUSTER. UPLOAD NEW MEMORIES IN TAB 1!
        </div>
      `;
      return;
    }

    filtered.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.innerHTML = `
        <div class="memory-card-header">
          <span class="memory-type-tag">[${m.category.toUpperCase()}]</span>
          <span class="memory-date">${m.date}</span>
        </div>
        ${m.image ? `<img src="${m.image}" alt="Memory artifact" class="memory-card-img">` : ''}
        <div class="memory-card-content">${m.content}</div>
        <div class="memory-card-footer">KEY SUBJECT: ${m.person.toUpperCase()}</div>
      `;
      memoryCardsGrid.appendChild(card);
    });

    if (dbMemoriesCount) {
      dbMemoriesCount.textContent = `${activeMemories.length} MEMORIES SYNCED`;
    }
  };

  renderMemoryCards();

  // Vault Filter Buttons
  const vaultFilterBtns = document.querySelectorAll('.vault-filter-btn');
  vaultFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      vaultFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderMemoryCards(filter);
      playBlipSound();
    });
  });

  // Clear Vault Button
  const clearVaultBtn = document.getElementById('clear-vault-btn');
  if (clearVaultBtn) {
    clearVaultBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the memory database?')) {
        activeMemories = [];
        renderMemoryCards();
        logTerminal('MEMORY DATABASE PURGED BY USER OPERATOR.', 'alert');
        playWrongSound();
      }
    });
  }

  // Load Sample Preset Button
  const loadSampleBtn = document.getElementById('load-sample-btn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      activeMemories = [...sampleMemories];
      renderMemoryCards();
      playCoinSound();

      logTerminal('LOADING DEMO VAULT: "THE CHAOS SQUAD"...', 'highlight');
      logTerminal('INGESTED: 18 CHAT LOGS, 6 MEDIA VECTORS, 10 INSIDE JOKES.', 'success');
      logTerminal('NEURAL GRAPH OPTIMIZED. READY TO GENERATE TRIVIA QUESTIONS.', 'system');

      // Animate progress meters
      document.getElementById('meter-val-photos').textContent = '96%';
      document.getElementById('fill-photos').style.width = '96%';
      document.getElementById('meter-val-chats').textContent = '98%';
      document.getElementById('fill-chats').style.width = '98%';
      document.getElementById('meter-val-jokes').textContent = '94%';
      document.getElementById('fill-jokes').style.width = '94%';
    });
  }

  // Media Upload & File Handling
  const mediaFileInput = document.getElementById('media-file-input');
  const dropZone = document.getElementById('drop-zone');
  const mediaPreviews = document.getElementById('media-previews');
  let stagedMedia = [];

  const handleFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const item = {
          file,
          dataUrl: e.target.result,
          name: file.name
        };
        stagedMedia.push(item);
        renderMediaPreviews();
        playBlipSound();
        logTerminal(`MEDIA DETECTED: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, 'info');
      };
      reader.readAsDataURL(file);
    });
  };

  const renderMediaPreviews = () => {
    if (!mediaPreviews) return;
    mediaPreviews.innerHTML = '';
    stagedMedia.forEach((m, idx) => {
      const el = document.createElement('div');
      el.className = 'media-preview-item';
      el.innerHTML = `
        <img src="${m.dataUrl}" alt="${m.name}">
        <button type="button" class="remove-media-btn" data-index="${idx}">&times;</button>
      `;
      mediaPreviews.appendChild(el);
    });

    mediaPreviews.querySelectorAll('.remove-media-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        stagedMedia.splice(i, 1);
        renderMediaPreviews();
        playBlipSound();
      });
    });
  };

  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  }

  if (dropZone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }

  // Memory Ingest Form Submission
  const memoryForm = document.getElementById('memory-ingest-form');
  const chatTextInput = document.getElementById('chat-text-input');
  const categorySelect = document.getElementById('memory-category');
  const targetPersonInput = document.getElementById('target-person');

  if (memoryForm) {
    memoryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const text = chatTextInput.value.trim();
      const category = categorySelect.value;
      const person = targetPersonInput.value.trim() || 'Duo';

      if (!text && stagedMedia.length === 0) {
        alert('Please enter chat texts/memories or upload a photo/video first!');
        return;
      }

      playCoinSound();

      logTerminal('SCANNING SUBMITTED MEMORY BATCH...', 'highlight');

      // Ingest text memories
      if (text) {
        const textMem = {
          id: `mem-${Date.now()}`,
          type: category.toLowerCase().includes('chat') ? 'chat' : 'joke',
          category,
          person,
          date: new Date().toISOString().split('T')[0],
          content: text,
          image: null
        };
        activeMemories.unshift(textMem);
      }

      // Ingest staged media
      stagedMedia.forEach((m, idx) => {
        const mediaMem = {
          id: `mem-${Date.now()}-${idx}`,
          type: 'photo',
          category: 'Photo/Video Mystery',
          person,
          date: new Date().toISOString().split('T')[0],
          content: text ? `Associated with: "${text.slice(0, 80)}..."` : `Captured memory artifact: ${m.name}`,
          image: m.dataUrl
        };
        activeMemories.unshift(mediaMem);
      });

      // Clear staged
      chatTextInput.value = '';
      targetPersonInput.value = '';
      stagedMedia = [];
      renderMediaPreviews();
      renderMemoryCards();

      logTerminal(`SUCCESS: ${activeMemories.length} TOTAL MEMORIES IN DATABASE.`, 'success');
      logTerminal('AI MODEL HAS COMPILED FRESH TRIVIA QUESTIONS.', 'system');
    });
  }

  /* ==========================================================================
     4. TRIVIA GAMEPLAY & BATTLE ENGINE
     ========================================================================== */
  const stageSetup = document.getElementById('stage-setup');
  const stageArena = document.getElementById('stage-arena');
  const stageResults = document.getElementById('stage-results');

  const player1Input = document.getElementById('player1-name');
  const player2Input = document.getElementById('player2-name');
  const roundSelect = document.getElementById('round-select');
  const timerSelect = document.getElementById('timer-select');
  const startMatchBtn = document.getElementById('start-match-btn');

  // HUD Elements
  const liveScoreEl = document.getElementById('live-score');
  const questionTrackerEl = document.getElementById('question-tracker');
  const streakCounterEl = document.getElementById('streak-counter');
  const timerBar = document.getElementById('timer-bar');
  const timerDisplay = document.getElementById('timer-display');

  // Question Elements
  const questionCategory = document.getElementById('question-category');
  const questionPoints = document.getElementById('question-points');
  const questionPrompt = document.getElementById('question-prompt');
  const questionMediaWrap = document.getElementById('question-media-wrap');
  const questionMediaContent = document.getElementById('question-media-content');
  const optionsGrid = document.getElementById('options-grid');
  const feedbackBanner = document.getElementById('feedback-banner');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackText = document.getElementById('feedback-text');
  const feedbackSub = document.getElementById('feedback-sub');

  let p1Name = 'Alex';
  let p2Name = 'Sam';
  let totalQuestionsCount = 5;
  let questionTimeLimit = 15;

  let currentQuestionIndex = 0;
  let activeQuestions = [];
  let score = 0;
  let streak = 0;
  let correctCount = 0;
  let responseTimes = [];
  let currentTimerInterval = null;
  let timeRemaining = 15;
  let isAnswered = false;

  // Dynamic Trivia Generator based on active database
  const generateTriviaBank = () => {
    const p1 = p1Name || 'Alex';
    const p2 = p2Name || 'Sam';

    // Base template questions dynamically referencing players & memories
    return [
      {
        category: 'GROUP CHAT LORE',
        prompt: `In the squad group chat, who famously sent: "I swear I am never eating ghost pepper wings again in my entire life"?`,
        options: [p1, p2, 'The Delivery Driver', 'A Ghost'],
        correct: 0,
        explanation: `${p1} made that bold declaration at 9:42 PM, only to order more wings 10 minutes later!`
      },
      {
        category: 'EPIC TRIP MEMORY',
        prompt: `During the infamous 3:15 AM road trip stop, what emergency item did ${p2} insist on purchasing?`,
        options: [
          '4 Giant Plush Avocados',
          'A Gallon of Chocolate Milk',
          'A Pair of Neon Sunglasses',
          '3 Bags of Sour Gummy Worms'
        ],
        correct: 0,
        explanation: `${p2} defended the avocados as "aerodynamic strategic travel pillows".`
      },
      {
        category: 'LEGENDARY INSIDE JOKE',
        prompt: `What was the agreed-upon emergency code word when ${p1} got stuck inside an Ikea display bedroom?`,
        options: [
          'Code Red "Pineapple"',
          'Operation Meatball',
          'SOS Swedish Flag',
          'Blue Backpack'
        ],
        correct: 0,
        explanation: `Code Red "Pineapple" is still honored in every furniture store to this day.`
      },
      {
        category: 'LATE NIGHT DISCORD CHATS',
        prompt: `At 2:48 AM, what bizarre philosophical theory did ${p2} pitch to the entire chat?`,
        options: [
          'Pigeons are government 5G signal test units',
          'Cereal is technically cold soup',
          'Trees make noise when nobody is walking',
          'Time travel was invented in 1994'
        ],
        correct: 0,
        explanation: `${p2} typed a 600-word essay about pigeon antennae before falling asleep.`
      },
      {
        category: 'PHOTO / INCIDENT RECALL',
        prompt: `How did the legendary birthday cake cross town before arriving in a famously tilted state?`,
        options: [
          'A 40mph electric scooter ride',
          'In a bicycle basket during a rainstorm',
          'On top of a skateboard',
          'Carried while sprinting on foot'
        ],
        correct: 0,
        explanation: `It arrived at a 45-degree tilt on the electric scooter, but tasted 10/10.`
      },
      {
        category: 'SHARED TRIVIA',
        prompt: `What did the "Five-Minute Catchup Meeting" accidentally morph into?`,
        options: [
          'An 8-hour marathon of 90s animated movie trailers',
          'A competitive ping pong championship',
          'Cooking 12 boxes of instant noodles',
          'A complete redesign of the living room'
        ],
        correct: 0,
        explanation: `Neither ${p1} nor ${p2} stopped until every Disney and Pixar trailer had been reviewed.`
      },
      {
        category: 'FRIENDSHIP HABITS',
        prompt: `When ordering takeout together, what is guaranteed to happen 99% of the time?`,
        options: [
          'One person says "I\'m not hungry" then eats half the fries',
          'They order from 3 different restaurants simultaneously',
          'They debate for 45 minutes and end up with pizza',
          'Both of the above options'
        ],
        correct: 3,
        explanation: `Classic duo synchronization: infinite debate followed by fry theft.`
      }
    ];
  };

  // Start Match
  if (startMatchBtn) {
    startMatchBtn.addEventListener('click', () => {
      p1Name = player1Input.value.trim() || 'Alex';
      p2Name = player2Input.value.trim() || 'Sam';
      totalQuestionsCount = parseInt(roundSelect.value, 10) || 5;
      questionTimeLimit = parseInt(timerSelect.value, 10) || 15;

      const bank = generateTriviaBank();
      // Shuffle & slice to round count
      activeQuestions = [...bank].sort(() => 0.5 - Math.random()).slice(0, totalQuestionsCount);

      // Reset Match State
      currentQuestionIndex = 0;
      score = 0;
      streak = 0;
      correctCount = 0;
      responseTimes = [];

      stageSetup.classList.remove('active');
      stageResults.classList.remove('active');
      stageArena.classList.add('active');

      playCoinSound();
      loadQuestion(0);
    });
  }

  // Load Question into Arena
  const loadQuestion = (index) => {
    isAnswered = false;
    currentQuestionIndex = index;
    feedbackBanner.classList.remove('show', 'is-wrong');

    const q = activeQuestions[index];

    // Update HUD
    liveScoreEl.textContent = score.toString().padStart(5, '0');
    questionTrackerEl.textContent = `${(index + 1).toString().padStart(2, '0')} / ${totalQuestionsCount.toString().padStart(2, '0')}`;
    streakCounterEl.textContent = streak > 1 ? `${streak}x COMBO` : `${streak}x`;

    // Render Question
    questionCategory.textContent = `CATEGORY: ${q.category}`;
    questionPrompt.textContent = q.prompt;

    // Reset and start timer
    timeRemaining = questionTimeLimit;
    timerDisplay.textContent = `${timeRemaining}s`;
    timerBar.style.width = '100%';
    timerBar.style.background = 'var(--neon-green)';
    const timerBox = document.querySelector('.hud-box.timer-box');
    if (timerBox) timerBox.classList.remove('panic');

    clearInterval(currentTimerInterval);
    const startTime = Date.now();

    currentTimerInterval = setInterval(() => {
      timeRemaining--;
      timerDisplay.textContent = `${timeRemaining}s`;
      const pct = (timeRemaining / questionTimeLimit) * 100;
      timerBar.style.width = `${pct}%`;

      if (pct < 30) {
        timerBar.style.background = 'var(--neon-red)';
      } else if (pct < 60) {
        timerBar.style.background = 'var(--neon-yellow)';
      }

      // Panic Mode Warning (< 5 seconds)
      if (timeRemaining <= 4 && timeRemaining > 0) {
        if (timerBox) timerBox.classList.add('panic');
        playTickSound();
      }

      if (timeRemaining <= 0) {
        if (timerBox) timerBox.classList.remove('panic');
        clearInterval(currentTimerInterval);
        handleAnswer(-1, Date.now() - startTime); // Timeout
      }
    }, 1000);

    // Render Option Buttons
    const optionButtons = optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, i) => {
      btn.className = 'option-btn';
      btn.disabled = false;
      const textSpan = btn.querySelector('.option-text');
      if (textSpan) textSpan.textContent = q.options[i] || '';
    });
  };

  // Option Click Handler
  const optionButtons = optionsGrid.querySelectorAll('.option-btn');
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (isAnswered) return;
      const chosenIndex = parseInt(btn.getAttribute('data-index'), 10);
      const latency = (questionTimeLimit - timeRemaining) * 1000;
      handleAnswer(chosenIndex, latency);
    });
  });

  // Keyboard Shortcuts (A, B, C, D or 1, 2, 3, 4)
  document.addEventListener('keydown', (e) => {
    if (!stageArena.classList.contains('active') || isAnswered) return;
    const keyMap = {
      KeyA: 0, Digit1: 0,
      KeyB: 1, Digit2: 1,
      KeyC: 2, Digit3: 2,
      KeyD: 3, Digit4: 3
    };
    if (e.code in keyMap) {
      const idx = keyMap[e.code];
      const latency = (questionTimeLimit - timeRemaining) * 1000;
      handleAnswer(idx, latency);
    }
  });

  // Process Answer
  const handleAnswer = (chosenIndex, latencyMs) => {
    isAnswered = true;
    clearInterval(currentTimerInterval);
    const timerBox = document.querySelector('.hud-box.timer-box');
    if (timerBox) timerBox.classList.remove('panic');
    responseTimes.push(latencyMs);

    const q = activeQuestions[currentQuestionIndex];
    const optionBtns = optionsGrid.querySelectorAll('.option-btn');

    optionBtns.forEach((b) => (b.disabled = true));

    const isCorrect = chosenIndex === q.correct;

    if (isCorrect) {
      streak++;
      correctCount++;
      const speedBonus = Math.max(0, timeRemaining * 50);
      const streakMultiplier = Math.min(4, Math.max(1, streak));
      const gained = 1000 * streakMultiplier + speedBonus;
      score += gained;

      liveScoreEl.textContent = score.toString().padStart(5, '0');
      streakCounterEl.textContent = streak > 1 ? `${streak}x COMBO` : `${streak}x`;

      // Visual feedback, floating scores, and particle sparks
      if (chosenIndex >= 0 && optionBtns[chosenIndex]) {
        optionBtns[chosenIndex].classList.add('correct');
        const rect = optionBtns[chosenIndex].getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        createPixelBurst(centerX, centerY, 18);
        spawnFloatingScore(centerX, rect.top - 10, `+${gained} PTS!`, '#39ff14');
        if (streak > 1) {
          setTimeout(() => {
            spawnFloatingScore(centerX, rect.top - 36, `🔥 ${streak}x COMBO!`, '#ffe600');
          }, 150);
        }
      }

      feedbackBanner.className = 'feedback-banner show';
      feedbackIcon.textContent = '✓';
      feedbackText.textContent = `CORRECT! MEMORY SYNC +${gained} PTS`;
      feedbackSub.textContent = q.explanation;

      playCorrectSound();
    } else {
      streak = 0;
      streakCounterEl.textContent = '0x';

      if (chosenIndex >= 0 && optionBtns[chosenIndex]) {
        optionBtns[chosenIndex].classList.add('wrong');
        const rect = optionBtns[chosenIndex].getBoundingClientRect();
        createPixelBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, ['#ff2a4b', '#ff007f']);
      }
      if (optionBtns[q.correct]) {
        optionBtns[q.correct].classList.add('correct');
      }

      // Screen shake
      document.querySelector('.arcade-cabinet').classList.add('shake-screen');
      setTimeout(() => {
        document.querySelector('.arcade-cabinet').classList.remove('shake-screen');
      }, 400);

      feedbackBanner.className = 'feedback-banner show is-wrong';
      feedbackIcon.textContent = chosenIndex === -1 ? '⏰' : '✗';
      feedbackText.textContent = chosenIndex === -1 ? 'TIME EXPIRED! MEMORY SLIP!' : 'MEMORY MISMATCH!';
      feedbackSub.textContent = q.explanation;

      playWrongSound();
    }

    // Advance to next question or results
    setTimeout(() => {
      if (currentQuestionIndex + 1 < activeQuestions.length) {
        loadQuestion(currentQuestionIndex + 1);
      } else {
        finishGame();
      }
    }, 2200);
  };

  /* ==========================================================================
     5. AI FRIENDSHIP & COMPATIBILITY ANALYSIS SCREEN
     ========================================================================== */
  const resP1 = document.getElementById('res-p1');
  const resP2 = document.getElementById('res-p2');
  const rankLetter = document.getElementById('rank-letter');
  const rankTitle = document.getElementById('rank-title');
  const syncScoreNumber = document.getElementById('sync-score-number');
  const syncSummaryStatement = document.getElementById('sync-summary-statement');
  const aiCommentary = document.getElementById('ai-commentary');

  const diagJokesFill = document.getElementById('diag-jokes-fill');
  const diagJokesStat = document.getElementById('diag-jokes-stat');
  const diagChatsFill = document.getElementById('diag-chats-fill');
  const diagChatsStat = document.getElementById('diag-chats-stat');
  const diagPhotosFill = document.getElementById('diag-photos-fill');
  const diagPhotosStat = document.getElementById('diag-photos-stat');
  const diagSpeedFill = document.getElementById('diag-speed-fill');
  const diagSpeedStat = document.getElementById('diag-speed-stat');

  const finishGame = () => {
    stageArena.classList.remove('active');
    stageResults.classList.add('active');
    playVictorySound();

    // Celebration Confetti Particle Waves
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        for (let c = 0; c < 16; c++) {
          const rx = Math.random() * window.innerWidth;
          const ry = Math.random() * (window.innerHeight * 0.7);
          createPixelBurst(rx, ry, 10, ['#00f0ff', '#ff007f', '#ffe600', '#39ff14', '#ffffff']);
        }
      }, wave * 350);
    }

    // Calculate Friendship Sync Score (0 - 100%)
    const rawAccuracy = (correctCount / totalQuestionsCount) * 100;
    const avgLatency = responseTimes.length
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 5000;
    const latencyFactor = Math.max(0, 100 - (avgLatency / 1000) * 8);

    // Weighted sync score
    const syncPct = Math.round(rawAccuracy * 0.75 + latencyFactor * 0.25);
    const boundedSync = Math.min(99, Math.max(15, syncPct));

    resP1.textContent = p1Name.toUpperCase();
    resP2.textContent = p2Name.toUpperCase();
    syncScoreNumber.textContent = `${boundedSync}%`;

    // Assign Rank & Commentary
    let rank = 'B';
    let title = 'CASUAL CHUMS';
    let summary = '';
    let commentary = '';

    if (boundedSync >= 88) {
      rank = 'S';
      title = 'SOULMATE TIER';
      summary = `"EXTREME RESONANCE DETECTED! ${p2Name} has near telepathic recall of ${p1Name}'s lore, inside jokes, and group chat antics."`;
      commentary = `"Subject ${p2Name} exhibited instantaneous recall across travel memories and quote archives. Neural latency clocked under 2.4s. The inside joke matrix indicates this duo has experienced catastrophic cafeteria and late-night adventures together with 100% memory synchronization."`;
    } else if (boundedSync >= 72) {
      rank = 'A';
      title = 'CERTIFIED BESTIES';
      summary = `"HIGH COMPATIBILITY! Strong recall of core milestones with only slight latency on late-night chat dates."`;
      commentary = `"${p2Name} recognized the major inside jokes and trip highlights with great precision. Minor memory slips occurred in obscure quote trivia, but the duo bond is undeniably certified at top-tier friendship status."`;
    } else if (boundedSync >= 55) {
      rank = 'B';
      title = 'CHAOTIC ACCOMPLICES';
      summary = `"SOLID BOND! You know each other's loud moments, but some subtle chat lore slipped through the cracks."`;
      commentary = `"Solid execution on primary events, but ${p2Name} fumbled on the fine details of late-night grocery runs and code words. Recommend an emergency 3 AM pizza debrief to resync memory banks."`;
    } else {
      rank = 'F';
      title = 'SUSPICIOUS STRANGERS';
      summary = `"LOW SYNC SCORE DETECTED! Are you two sure you're in the same group chat?"`;
      commentary = `"Critical memory divergence! ${p2Name} failed to identify key inside jokes and timeline events involving ${p1Name}. AI model suspects one of you has the group chat muted on permanent archive."`;
    }

    rankLetter.textContent = rank;
    rankTitle.textContent = title;
    syncSummaryStatement.textContent = summary;
    aiCommentary.textContent = commentary;

    // Diagnostics bars
    const jokeVal = Math.min(100, Math.round(boundedSync * 1.05));
    diagJokesFill.style.width = `${jokeVal}%`;
    diagJokesStat.textContent = `${jokeVal}%`;

    const chatVal = Math.min(100, Math.round(boundedSync * 0.95));
    diagChatsFill.style.width = `${chatVal}%`;
    diagChatsStat.textContent = `${chatVal}%`;

    const photoVal = Math.min(100, Math.round(boundedSync * 1.02));
    diagPhotosFill.style.width = `${photoVal}%`;
    diagPhotosStat.textContent = `${photoVal}%`;

    const secAvg = (avgLatency / 1000).toFixed(1);
    diagSpeedStat.textContent = `${secAvg}s Avg Latency`;
    diagSpeedFill.style.width = `${Math.min(100, Math.max(20, Math.round(100 - secAvg * 8)))}%`;
  };

  // Play Again Button
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      stageResults.classList.remove('active');
      stageSetup.classList.add('active');
      playBlipSound();
    });
  }

  // Print Retro Arcade Card Button
  const printCardBtn = document.getElementById('print-card-btn');
  if (printCardBtn) {
    printCardBtn.addEventListener('click', () => {
      playCoinSound();
      window.print();
    });
  }

  // Save to Leaderboard Button
  const saveScoreBtn = document.getElementById('save-score-btn');
  if (saveScoreBtn) {
    saveScoreBtn.addEventListener('click', () => {
      const duoCode = `${(p1Name.slice(0, 2) + p2Name.slice(0, 2)).toUpperCase()}`;
      addLeaderboardEntry(duoCode, score, syncScoreNumber.textContent, rankLetter.textContent);
      playCoinSound();
      saveScoreBtn.textContent = '✓ SAVED TO HALL OF FAME!';
      saveScoreBtn.disabled = true;
      setTimeout(() => {
        switchTab('tab-scores');
      }, 600);
    });
  }

  /* ==========================================================================
     6. HIGH SCORES LEADERBOARD ENGINE
     ========================================================================== */
  const leaderboardBody = document.getElementById('leaderboard-body');

  const defaultHighScores = [
    { rank: '01', duo: 'ALEX & SAM', score: 14850, sync: '96%', grade: 'S', date: '2026-08-30' },
    { rank: '02', duo: 'MAYA & LEO', score: 12400, sync: '91%', grade: 'S', date: '2026-09-01' },
    { rank: '03', duo: 'KAI & NOAH', score: 9800, sync: '84%', grade: 'A', date: '2026-09-03' },
    { rank: '04', duo: 'ZAC & CHLOE', score: 7600, sync: '74%', grade: 'B', date: '2026-09-05' },
    { rank: '05', duo: 'BEN & RILEY', score: 4200, sync: '48%', grade: 'C', date: '2026-09-06' }
  ];

  const renderLeaderboard = () => {
    if (!leaderboardBody) return;
    const stored = localStorage.getItem('vybz_highscores');
    const list = stored ? JSON.parse(stored) : defaultHighScores;

    leaderboardBody.innerHTML = '';
    list.forEach((entry, idx) => {
      const row = document.createElement('tr');
      const rankClass = idx === 0 ? 'rank-num-1' : idx === 1 ? 'rank-num-2' : idx === 2 ? 'rank-num-3' : '';
      row.innerHTML = `
        <td class="${rankClass}">#${entry.rank || (idx + 1).toString().padStart(2, '0')}</td>
        <td>${entry.duo}</td>
        <td>${entry.score.toLocaleString()}</td>
        <td>${entry.sync}</td>
        <td><span class="badge-neon">${entry.grade}</span></td>
        <td>${entry.date}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  };

  const addLeaderboardEntry = (duo, sc, sync, grade) => {
    const stored = localStorage.getItem('vybz_highscores');
    const list = stored ? JSON.parse(stored) : [...defaultHighScores];

    list.push({
      rank: '',
      duo,
      score: sc,
      sync,
      grade,
      date: new Date().toISOString().split('T')[0]
    });

    list.sort((a, b) => b.score - a.score);
    list.forEach((item, i) => {
      item.rank = (i + 1).toString().padStart(2, '0');
    });

    localStorage.setItem('vybz_highscores', JSON.stringify(list.slice(0, 10)));
    renderLeaderboard();
  };

  renderLeaderboard();
});
