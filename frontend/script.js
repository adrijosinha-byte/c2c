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
     RETRO IMMERSIVE PARALLAX CANVAS & CURSOR DUST ENGINE
     ========================================================================== */
  const canvas = document.getElementById('retro-bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Starfield particles
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.4 + 0.1,
      brightness: Math.random() * 0.8 + 0.2,
      color: ['#00f0ff', '#ff007f', '#ffe600', '#ffffff'][Math.floor(Math.random() * 4)]
    }));

    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    });

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    let frame = 0;
    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp for subtle immersive parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      const offsetX = (mouseX - width / 2) * 0.04;
      const offsetY = (mouseY - height / 2) * 0.03;

      // Deep arcade cosmic backdrop
      const grad = ctx.createRadialGradient(
        width / 2 + offsetX * 0.5, height * 0.45 + offsetY * 0.5, 10,
        width / 2, height * 0.45, Math.max(width, height) * 0.88
      );
      grad.addColorStop(0, '#26123e');
      grad.addColorStop(0.5, '#0f0a22');
      grad.addColorStop(1, '#05030a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating retro stars (parallax move with scroll and mouse)
      stars.forEach((s) => {
        const px = (s.x - offsetX * s.speed * 1.5 + width) % width;
        const py = (s.y - scrollY * s.speed * 0.25 - offsetY * s.speed + height) % height;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.brightness * (0.6 + 0.4 * Math.sin(frame * 0.04 + s.x));
        ctx.fillRect(px, py, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      // Retro Distant Glowing Synthwave Sun (parallax moves smoothly)
      const sunX = width / 2 + offsetX * 0.6;
      const sunY = height * 0.45 - scrollY * 0.08 + offsetY * 0.6;
      const sunRadius = 78;
      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
      sunGrad.addColorStop(0, '#ffe600');
      sunGrad.addColorStop(0.5, '#ff007f');
      sunGrad.addColorStop(1, '#8000ff');

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 45;
      ctx.fill();
      ctx.restore();

      // Horizon & Cyber Grid
      const horizon = height * 0.52 + offsetY * 0.5;

      // Wireframe Mountain Silhouette along Horizon
      ctx.save();
      ctx.strokeStyle = '#4a2b72';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#0a0614';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (let mx = 0; mx <= width + 50; mx += 60) {
        const my = horizon - Math.sin((mx + scrollY * 0.1 + offsetX * 2) * 0.015) * 35 - Math.cos(mx * 0.03) * 15;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(width, horizon);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Horizon laser glow line
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(width, horizon);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Moving Perspective Cyber Grid on floor (moves with scroll, mouse and time)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1;

      const gridOffset = (scrollY * 0.65 + frame * 0.6) % 36;
      for (let y = horizon; y < height; y += (y - horizon) * 0.2 + 8) {
        const gy = y + (gridOffset * ((y - horizon) / (height - horizon)));
        if (gy < height) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
          ctx.stroke();
        }
      }

      const vanishX = width / 2 + offsetX * 1.2;
      for (let x = -width * 0.8; x < width * 1.8; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(vanishX + (x - vanishX) * 0.12, horizon);
        ctx.stroke();
      }

      frame++;
      requestAnimationFrame(renderCanvas);
    };

    renderCanvas();
  }

  // Particle Container for Minimalist Cursor Dust & Button Sparks
  const particleContainer = document.getElementById('particle-container');

  // Minimalist Particle Effect while moving the mouse
  let lastDustTime = 0;
  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastDustTime < 32) return; // Responsive 30fps throttle for smoothness without lag
    lastDustTime = now;

    if (!particleContainer) return;
    const dust = document.createElement('div');
    dust.className = 'cursor-dust';

    const colors = ['#00f0ff', '#ffe600', '#ff007f', '#39ff14', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 4) + 2; // Sleek, minimalist tiny pixel/dot

    dust.style.left = `${e.clientX}px`;
    dust.style.top = `${e.clientY}px`;
    dust.style.width = `${size}px`;
    dust.style.height = `${size}px`;
    dust.style.backgroundColor = color;
    dust.style.boxShadow = `0 0 6px ${color}`;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 16 + 6;
    dust.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    dust.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);

    particleContainer.appendChild(dust);
    setTimeout(() => dust.remove(), 650);
  });

  /* ==========================================================================
     WELCOME USER & NEURAL LOADING SCREEN CONTROLLER
     ========================================================================== */
  const introSplash = document.getElementById('intro-splash');
  const loaderProgressBar = document.getElementById('loader-progress-bar');
  const loaderPercentage = document.getElementById('loader-percentage');
  const loaderTaskName = document.getElementById('loader-task-name');
  const loaderStatusTag = document.getElementById('loader-status-tag');
  const loaderStream = document.getElementById('loader-terminal-stream');
  const skipLoaderBtn = document.getElementById('skip-loader-btn');

  const loadingSteps = [
    { pct: 15, task: 'IDENTIFYING USER PROFILE...', log: '> BIO-LINK RECOGNITION: WELCOME AUTHORIZED USER.', type: 'highlight' },
    { pct: 35, task: 'FETCHING HISTORICAL MEMORY VECTORS...', log: '> INDEXING CHAT LOGS & MEDIA GALLERIES...', type: 'info' },
    { pct: 60, task: 'CALIBRATING MULTIMODAL VISION MODEL...', log: '> VISION EMBEDDINGS LOADED (4,096 CHANNELS).', type: 'system' },
    { pct: 85, task: 'SYNTHESIZING COMPATIBILITY MATRIX...', log: '> PSYCHOMETRIC TRIVIA ENGINE INITIALIZED: OK.', type: 'success' },
    { pct: 100, task: 'INVITATION ACCEPTED. READY TO ENTER.', log: '> USER DATA MOUNTED. WELCOME TO VYBZ ARCADE!', type: 'success' }
  ];

  let currentStepIdx = 0;
  let loaderProgress = 0;
  let loaderCompleted = false;

  const addLoaderLog = (text, type = 'info') => {
    if (!loaderStream) return;
    const line = document.createElement('div');
    line.className = `loader-term-line ${type}`;
    line.textContent = text;
    loaderStream.appendChild(line);
    loaderStream.scrollTop = loaderStream.scrollHeight;
  };

  const finishLoading = () => {
    if (loaderCompleted) return;
    loaderCompleted = true;
    if (loaderProgressBar) loaderProgressBar.style.width = '100%';
    if (loaderPercentage) loaderPercentage.textContent = '100%';
    if (loaderStatusTag) {
      loaderStatusTag.textContent = 'CONNECTED';
      loaderStatusTag.style.color = 'var(--neon-green)';
      loaderStatusTag.style.borderColor = 'var(--neon-green)';
    }
    if (loaderTaskName) loaderTaskName.textContent = 'ACCESS GRANTED. ENTERING ARENA...';

    playCoinSound();

    setTimeout(() => {
      if (introSplash) {
        introSplash.classList.add('loaded');
      }
    }, 450);
  };

  // Skip loader on click or escape key
  if (skipLoaderBtn) {
    skipLoaderBtn.addEventListener('click', finishLoading);
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.code === 'Space') {
      finishLoading();
    }
  });

  // Step-by-step simulated progress
  const runLoaderStep = () => {
    if (loaderCompleted) return;
    if (currentStepIdx < loadingSteps.length) {
      const step = loadingSteps[currentStepIdx];
      loaderProgress = step.pct;
      if (loaderProgressBar) loaderProgressBar.style.width = `${loaderProgress}%`;
      if (loaderPercentage) loaderPercentage.textContent = `${loaderProgress.toString().padStart(2, '0')}%`;
      if (loaderTaskName) loaderTaskName.textContent = step.task;
      addLoaderLog(step.log, step.type);
      playTone(550 + currentStepIdx * 120, 'triangle', 0.04, 0, 0.06);

      currentStepIdx++;
      const nextDelay = currentStepIdx === loadingSteps.length ? 500 : 380;
      setTimeout(runLoaderStep, nextDelay);
    } else {
      finishLoading();
    }
  };

  setTimeout(runLoaderStep, 250);

  // Clicking Animation Sparks
  const createPixelBurst = (x, y, count = 10, colors = ['#00f0ff', '#ff007f', '#ffe600', '#ffffff']) => {
    if (!particleContainer) return;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'cursor-dust';

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.floor(Math.random() * 5) + 4;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 45 + 15;

      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.backgroundColor = color;
      spark.style.boxShadow = `0 0 8px ${color}`;
      spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);

      particleContainer.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }
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

  // Individual Arcade Tab Switching
  const tabButtons = document.querySelectorAll('.arcade-tab-btn');
  const tabSections = document.querySelectorAll('.arcade-tab-section');

  const switchTab = (targetTabId) => {
    tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });
    tabSections.forEach((sec) => {
      sec.classList.toggle('active', sec.id === targetTabId);
    });
    playBlipSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      switchTab(target);
    });
  });

  const heroPlayBtn = document.getElementById('hero-play-btn');
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
      if (activeMemories.length === 0) {
        alert('Your memory database is currently empty! Feed your first chat quotes, inside jokes, or photos below to train your trivia engine.');
        switchTab('tab-database');
        const chatInput = document.getElementById('chat-text-input');
        if (chatInput) chatInput.focus();
      } else {
        switchTab('tab-game');
      }
    });
  }

  // Universal Interactive Button Sound & Micro FX Engine
  const setupInteractiveButtons = () => {
    const allButtons = document.querySelectorAll(
      '.btn-retro, .btn-primary, .btn-secondary, .btn-retro-mini, .btn-toggle-hud, .arcade-tab-btn, .filter-pill, .option-card, .btn-text-danger, .inline-file-btn'
    );

    allButtons.forEach((btn) => {
      // Hover micro-tick sound
      btn.addEventListener('mouseenter', () => {
        playHoverSound();
      });

      // Click sound & spark burst
      btn.addEventListener('click', (e) => {
        playBlipSound();
        const rect = btn.getBoundingClientRect();
        const clickX = e.clientX || rect.left + rect.width / 2;
        const clickY = e.clientY || rect.top + rect.height / 2;
        createPixelBurst(clickX, clickY, 8);
      });
    });
  };

  setupInteractiveButtons();

  /* ==========================================================================
     3. DATABASE & MEMORY REPOSITORY ENGINE
     ========================================================================== */
  const heroMemCount = document.getElementById('hero-mem-count');
  const memoryCardsGrid = document.getElementById('memory-cards-grid');
  const terminalScreen = document.getElementById('terminal-screen');
  const dbStatusDot = document.getElementById('db-status-dot');
  const dbEmptyWarning = document.getElementById('db-empty-warning');
  const emptyDbGotoBtn = document.getElementById('empty-db-goto-btn');
  const startMatchBtn = document.getElementById('start-match-btn');

  // Database starts completely empty — no preset demo questions or memories!
  let activeMemories = [];

  // Helper: check and enforce database empty state
  const checkDatabaseEmptyState = () => {
    const isEmpty = activeMemories.length === 0;
    if (dbEmptyWarning) {
      dbEmptyWarning.style.display = isEmpty ? 'flex' : 'none';
    }
    if (startMatchBtn) {
      startMatchBtn.disabled = isEmpty;
      if (isEmpty) {
        startMatchBtn.title = 'Feed at least one memory scenario in Tab 1 before playing.';
      } else {
        startMatchBtn.removeAttribute('title');
      }
    }
    if (dbStatusDot) {
      dbStatusDot.textContent = isEmpty ? '● DATABASE EMPTY (FEED SCENARIOS)' : '● MODEL READY & SYNCED';
      dbStatusDot.style.color = isEmpty ? 'var(--neon-yellow)' : 'var(--neon-green)';
    }
  };

  if (emptyDbGotoBtn) {
    emptyDbGotoBtn.addEventListener('click', () => {
      switchTab('tab-database');
    });
  }

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
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; font-family: var(--font-arcade); font-size: 0.75rem; color: var(--text-dim); line-height: 1.8;">
          DATABASE IS EMPTY.<br>
          <span style="color: var(--neon-cyan);">FEED YOUR OWN MEMORIES, CHATS &amp; PHOTOS IN TAB 1 TO BUILD YOUR TRIVIA ENGINE!</span>
        </div>
      `;
      checkDatabaseEmptyState();
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

    if (heroMemCount) {
      heroMemCount.textContent = `${activeMemories.length}`;
    }
    checkDatabaseEmptyState();
  };

  renderMemoryCards();

  // Vault Filter Buttons (Pills)
  const filterPills = document.querySelectorAll('.filter-pill, .vault-filter-btn');
  filterPills.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterPills.forEach((b) => b.classList.remove('active'));
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
        checkDatabaseEmptyState();
      }
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

  // Dynamic Trivia Generator strictly based on user's active database scenarios
  const generateTriviaBank = () => {
    const p1 = p1Name || 'Alex';
    const p2 = p2Name || 'Sam';

    if (activeMemories.length === 0) {
      return [];
    }

    const bank = [];

    // Derive questions from each user-submitted memory
    activeMemories.forEach((mem, index) => {
      const subject = mem.person || p1;
      const otherPerson = subject.toLowerCase() === p1.toLowerCase() ? p2 : p1;
      const snippet = mem.content.length > 80 ? mem.content.slice(0, 77) + '...' : mem.content;
      const dateStr = mem.date ? ` (logged around ${mem.date})` : '';

      // Pattern 1: Who was the key person in this scenario?
      bank.push({
        category: mem.category.toUpperCase(),
        prompt: `According to your memory database, who is the central subject of this moment: "${snippet}"?`,
        options: [
          subject,
          otherPerson,
          'Both of them equally',
          'Someone outside the duo'
        ],
        correct: 0,
        explanation: `${subject} is the key person documented in this scenario${dateStr}.`,
        image: mem.image || null
      });

      // Pattern 2: Scenario recall quote / context
      const words = mem.content.split(' ');
      if (words.length >= 4) {
        const halfLen = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, halfLen).join(' ');
        const secondHalf = words.slice(halfLen).join(' ');

        bank.push({
          category: mem.category.toUpperCase(),
          prompt: `Complete this logged memory: "${firstHalf} ..."`,
          options: [
            secondHalf,
            `"... and nobody ever mentioned it again"`,
            `"... but the group chat didn't believe them"`,
            `"... until ${otherPerson} intervened"`
          ],
          correct: 0,
          explanation: `Full memory: "${mem.content}"`,
          image: mem.image || null
        });
      }

      // Pattern 3: Category classification recall
      const allCategories = [
        'Group Chat Quote',
        'Epic Trip Memory',
        'Legendary Inside Joke',
        'Photo/Video Mystery',
        'Late Night Epiphany'
      ];
      const wrongCategories = allCategories.filter((c) => c !== mem.category).slice(0, 3);
      const categoryOptions = [mem.category, ...wrongCategories].sort(() => 0.5 - Math.random());
      const correctCatIdx = categoryOptions.indexOf(mem.category);

      bank.push({
        category: 'MEMORY CLASSIFICATION',
        prompt: `Under what category was this memory registered: "${snippet}"?`,
        options: categoryOptions,
        correct: correctCatIdx,
        explanation: `This scenario was archived as "${mem.category}" with key subject ${subject}.`,
        image: mem.image || null
      });
    });

    // Shuffle and deduplicate
    return bank.sort(() => 0.5 - Math.random());
  };

  // Start Match — strictly blocks if activeMemories is empty!
  if (startMatchBtn) {
    startMatchBtn.addEventListener('click', () => {
      if (activeMemories.length === 0) {
        alert('Database is empty! You must enter your own scenarios, chat quotes, or photos in Tab 1 (Database) before starting the game.');
        switchTab('tab-database');
        checkDatabaseEmptyState();
        playWrongSound();
        return;
      }

      p1Name = player1Input.value.trim() || 'Alex';
      p2Name = player2Input.value.trim() || 'Sam';
      totalQuestionsCount = parseInt(roundSelect.value, 10) || 5;
      questionTimeLimit = parseInt(timerSelect.value, 10) || 15;

      const bank = generateTriviaBank();
      if (bank.length === 0) {
        alert('Unable to generate trivia: Please enter at least 1 memory scenario in Tab 1.');
        switchTab('tab-database');
        return;
      }

      // If bank has fewer questions than requested round count, use available count
      const matchCount = Math.min(bank.length, totalQuestionsCount);
      activeQuestions = [...bank].slice(0, matchCount);
      totalQuestionsCount = matchCount;

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

    // Optional user-uploaded image/media attachment
    if (questionMediaWrap && questionMediaContent) {
      if (q.image) {
        questionMediaContent.innerHTML = `<img src="${q.image}" alt="Memory photo" style="max-height: 200px; max-width: 100%; border-radius: 4px; object-fit: contain; margin: 0 auto; display: block;">`;
        questionMediaWrap.style.display = 'block';
      } else {
        questionMediaWrap.style.display = 'none';
        questionMediaContent.innerHTML = '';
      }
    }

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
    const optionButtons = optionsGrid.querySelectorAll('.option-card, .option-btn');
    optionButtons.forEach((btn, i) => {
      btn.className = 'option-card';
      btn.disabled = false;
      const textSpan = btn.querySelector('.option-text');
      if (textSpan) textSpan.textContent = q.options[i] || '';
    });
  };

  // Option Click Handler
  const optionButtons = optionsGrid.querySelectorAll('.option-card, .option-btn');
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
    const timerBox = document.getElementById('timer-box') || document.querySelector('.hud-box.timer-box');
    if (timerBox) timerBox.classList.remove('panic');
    responseTimes.push(latencyMs);

    const q = activeQuestions[currentQuestionIndex];
    const optionBtns = optionsGrid.querySelectorAll('.option-card, .option-btn');

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

      // Visual feedback
      if (chosenIndex >= 0 && optionBtns[chosenIndex]) {
        optionBtns[chosenIndex].classList.add('correct');
        const rect = optionBtns[chosenIndex].getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createPixelBurst(centerX, centerY, 8, ['#10b981', '#34d399', '#ffffff']);
      }

      feedbackBanner.className = 'feedback-card show';
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
        createPixelBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6, ['#f43f5e', '#fb7185']);
      }
      if (optionBtns[q.correct]) {
        optionBtns[q.correct].classList.add('correct');
      }

      feedbackBanner.className = 'feedback-card show is-wrong';
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
        switchTab('tab-leaderboard');
      }, 500);
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
