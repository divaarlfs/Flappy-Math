// Main Game Loop and Canvas Engine
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // DOM UI Elements
  const valScore = document.getElementById('val-score');
  const valStreak = document.getElementById('val-streak');
  const valTowers = document.getElementById('val-towers');
  const btnSound = document.getElementById('btn-sound');
  const shieldIndicator = document.getElementById('shield-indicator');

  const modalStart = document.getElementById('modal-start');
  const btnStartGame = document.getElementById('btn-start-game');

  const modalQuiz = document.getElementById('modal-quiz');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizInputField = document.getElementById('quiz-input-field');
  const btnSubmitTyped = document.getElementById('btn-submit-typed');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizFeedbackText = document.getElementById('quiz-feedback-text');

  const modalGameOver = document.getElementById('modal-gameover');
  const goScore = document.getElementById('go-score');
  const goTowers = document.getElementById('go-towers');
  const goMaxStreak = document.getElementById('go-max-streak');
  const goAccuracy = document.getElementById('go-accuracy');
  const btnRestartGame = document.getElementById('btn-restart-game');

  // Set Canvas internal size
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Sound toggle
  let soundEnabled = true;
  btnSound.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    window.soundFX.isMuted = !soundEnabled;
    if (!soundEnabled) {
      window.soundFX.stopQuizMusic();
    }
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // GAME STATE
  let gameState = 'START'; // 'START' | 'PLAYING' | 'QUIZ' | 'RESUME_COUNTDOWN' | 'GAMEOVER'
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let towersPassed = 0;
  let totalQuizzes = 0;
  let correctQuizzes = 0;

  // Post-quiz protection
  let shieldTimer = 0;
  const SHIELD_DURATION = 1500; // 1.5s grace period

  // BIRD PROPERTIES (Sangat santai, floaty, tidak gampang jatuh mendadak)
  const bird = {
    x: 80,
    y: 250,
    radius: 17,
    hitboxRadius: 10, // Hitbox lebih toleran dan bersahabat
    velocity: 0,
    gravity: 0.16, // Gravitasi sangat lembut agar melayang halus
    jumpForce: -4.5, // Lompatan lembut dan mudah dikontrol
    maxFallSpeed: 3.8, // Kecepatan jatuh dibatasi agar tidak menukik tajam
    rotation: 0,
    wingAngle: 0
  };

  // OBSTACLE (TOWER) CONFIGURATION (Lapang, Jarak Jauh, Pace Stabil)
  let towers = [];
  let baseSpeed = 1.4; // Pace santai dan stabil
  let currentSpeed = 1.4;
  let baseGap = 220; // Celah sangat lebar & nyaman
  let currentGap = 220;
  let towerDistance = 380; // Jarak horizontal antar tower jauh dan lapang
  let towerWidth = 54;

  // PARTICLES
  let particles = [];
  let floatingTexts = [];

  // Clouds for Classic Flappy Sky
  let clouds = [
    { x: 30, y: 80, scale: 1.2, speed: 0.25 },
    { x: 180, y: 140, scale: 0.9, speed: 0.18 },
    { x: 320, y: 60, scale: 1.5, speed: 0.3 }
  ];

  // Ground scrolling offset
  let groundOffset = 0;
  const groundHeight = 60;

  // City / Bush silhouette in background
  let bushes = [
    { x: 0, w: 80, h: 40 },
    { x: 100, w: 90, h: 50 },
    { x: 210, w: 75, h: 35 },
    { x: 310, w: 85, h: 45 },
    { x: 410, w: 95, h: 55 }
  ];

  // Reset Game Function
  function resetGame() {
    window.soundFX.stopQuizMusic();
    score = 0;
    streak = 0;
    maxStreak = 0;
    towersPassed = 0;
    totalQuizzes = 0;
    correctQuizzes = 0;
    shieldTimer = 0;
    currentSpeed = baseSpeed;
    currentGap = baseGap;

    bird.x = 80;
    bird.y = canvas.height * 0.4;
    bird.velocity = 0;
    bird.rotation = 0;

    towers = [];
    particles = [];
    floatingTexts = [];

    // Spawn first tower far enough ahead
    spawnTower(canvas.width + 120);
    updateHUD();
  }

  function spawnTower(startX) {
    // Peningkatan kesulitan yang sangat halus dan bertahap
    currentSpeed = baseSpeed + Math.min(0.6, towersPassed * 0.02);
    currentGap = Math.max(180, baseGap - Math.floor(towersPassed * 0.8));

    const minHeight = 60;
    const availableHeight = canvas.height - groundHeight - currentGap - minHeight;
    const topHeight = Math.floor(Math.random() * (availableHeight - minHeight)) + minHeight;

    towers.push({
      x: startX,
      topHeight: topHeight,
      gap: currentGap,
      width: towerWidth,
      passed: false,
      destroyed: false
    });
  }

  function updateHUD() {
    valScore.textContent = score;
    valStreak.textContent = streak;
    valTowers.textContent = towersPassed;
  }

  function addFloatingText(text, x, y, color = '#2ecc71') {
    floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.2,
      life: 60
    });
  }

  // Bird Flap
  function flap() {
    if (gameState !== 'PLAYING' && gameState !== 'RESUME_COUNTDOWN') return;
    bird.velocity = bird.jumpForce;
    window.soundFX.playFlap();

    // Small puff particles
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: bird.x - 10,
        y: bird.y + 4,
        vx: -(Math.random() * 1.0 + 0.5),
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 3 + 2,
        color: '#ffffff',
        alpha: 0.8,
        decay: 0.05
      });
    }
  }

  // Trigger Quiz (Triggered every 3 towers passed)
  function triggerQuiz(activeTower) {
    gameState = 'QUIZ';
    // Mainkan musik BGM kuis menarik & ritmis
    window.soundFX.startQuizMusic();

    const quiz = window.mathEngine.generateQuiz(towersPassed, streak);

    quizQuestionText.textContent = `${quiz.questionText} = ?`;
    quizInputField.value = '';
    quizFeedbackText.textContent = '';
    quizFeedbackText.className = 'quiz-feedback';

    quizOptionsContainer.innerHTML = '';
    quizOptionsContainer.className = `quiz-options-grid options-${quiz.optionCount}`;

    quiz.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="key-hint">${idx + 1}</span> ${opt}`;
      btn.addEventListener('click', () => handleQuizAnswer(opt, activeTower, btn));
      quizOptionsContainer.appendChild(btn);
    });

    modalQuiz.classList.add('active');
    setTimeout(() => {
      quizInputField.focus();
    }, 100);
  }

  // Handle Quiz Answer
  function handleQuizAnswer(userAns, activeTower, clickedBtn = null) {
    if (gameState !== 'QUIZ') return;
    totalQuizzes++;

    const isCorrect = window.mathEngine.validateAnswer(userAns);

    if (isCorrect) {
      correctQuizzes++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      const points = 100 + streak * 30;
      score += points;

      window.soundFX.playCorrectDestroy();

      if (clickedBtn) clickedBtn.classList.add('btn-correct');
      quizFeedbackText.textContent = `🎉 BENAR! +${points} Poin & Tower Meledak!`;
      quizFeedbackText.className = 'quiz-feedback correct';

      // Hancurkan tower berikutnya di depan burung
      const nextTower = towers.find(t => !t.destroyed && t.x + t.width > bird.x);
      if (nextTower) {
        destroyTower(nextTower);
      } else if (activeTower) {
        destroyTower(activeTower);
      }
      addFloatingText(`+${points}`, bird.x + 30, bird.y - 20, '#f1c40f');
    } else {
      streak = 0;
      // Konsekuensi: Skor dikurang 100 (tidak boleh minus di bawah 0)
      score = Math.max(0, score - 100);

      window.soundFX.playWrongPenalty();

      if (clickedBtn) clickedBtn.classList.add('btn-wrong');
      quizFeedbackText.textContent = `❌ SALAH (-100 Poin)! Jawaban: ${window.mathEngine.currentQuiz.correctAnswer}. Tower tetap utuh!`;
      quizFeedbackText.className = 'quiz-feedback wrong';

      // Penambahan kecepatan sangat ringan saat salah
      currentSpeed = Math.min(2.2, currentSpeed + 0.05);
      addFloatingText('-100', bird.x + 30, bird.y - 20, '#e74c3c');
    }

    updateHUD();

    const allBtns = quizOptionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    quizInputField.disabled = true;
    btnSubmitTyped.disabled = true;

    setTimeout(() => {
      modalQuiz.classList.remove('active');
      quizInputField.disabled = false;
      btnSubmitTyped.disabled = false;
      resumeWithShield();
    }, 900);
  }

  function submitTyped() {
    const val = quizInputField.value.trim();
    if (val === '') return;
    const aheadTower = towers.find(t => !t.destroyed && t.x + t.width >= bird.x - 20);
    handleQuizAnswer(val, aheadTower);
  }

  btnSubmitTyped.addEventListener('click', submitTyped);
  quizInputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitTyped();
  });

  window.addEventListener('keydown', (e) => {
    if (gameState === 'QUIZ') {
      const numKey = parseInt(e.key, 10);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= 4) {
        const btns = quizOptionsContainer.querySelectorAll('.option-btn');
        if (btns[numKey - 1]) {
          btns[numKey - 1].click();
        }
      }
    } else if (gameState === 'PLAYING' || gameState === 'RESUME_COUNTDOWN') {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    }
  });

  function resumeWithShield() {
    gameState = 'RESUME_COUNTDOWN';
    shieldTimer = SHIELD_DURATION;
    bird.velocity = -1.0; // Angkat sedikit secara halus
    window.soundFX.playShieldReady();
    shieldIndicator.classList.add('active');
  }

  function destroyTower(tower) {
    tower.destroyed = true;
    const centerX = tower.x + tower.width / 2;
    for (let i = 0; i < 35; i++) {
      const isTop = Math.random() < 0.5;
      const py = isTop 
        ? Math.random() * tower.topHeight 
        : tower.topHeight + tower.gap + Math.random() * (canvas.height - groundHeight - (tower.topHeight + tower.gap));

      particles.push({
        x: centerX + (Math.random() - 0.5) * tower.width,
        y: py,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        radius: Math.random() * 5 + 3,
        color: Math.random() < 0.6 ? '#73be2e' : (Math.random() < 0.5 ? '#f7d02c' : '#ffffff'),
        alpha: 1,
        decay: Math.random() * 0.025 + 0.02
      });
    }
  }

  // Flappy Bird KALAH saat tabrakan
  function triggerGameOver() {
    if (gameState === 'GAMEOVER') return;
    gameState = 'GAMEOVER';
    window.soundFX.playGameOver();

    goScore.textContent = score;
    goTowers.textContent = towersPassed;
    goMaxStreak.textContent = maxStreak;

    const acc = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 100;
    goAccuracy.textContent = `${acc}% (${correctQuizzes}/${totalQuizzes})`;

    modalGameOver.classList.add('active');
  }

  btnStartGame.addEventListener('click', () => {
    window.soundFX.init();
    modalStart.classList.remove('active');
    resetGame();
    gameState = 'PLAYING';
    flap();
  });

  btnRestartGame.addEventListener('click', () => {
    window.soundFX.init();
    modalGameOver.classList.remove('active');
    resetGame();
    gameState = 'PLAYING';
    flap();
  });

  canvas.addEventListener('pointerdown', () => {
    if (gameState === 'PLAYING' || gameState === 'RESUME_COUNTDOWN') {
      flap();
    }
  });

  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = Math.min(32, now - lastTime);
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    // Cloud scroll
    clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x < -80) c.x = canvas.width + 50;
    });

    // Particles update
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Floating text update
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    if (gameState === 'START' || gameState === 'GAMEOVER') {
      bird.y = canvas.height * 0.4 + Math.sin(nowGlobal * 0.004) * 6;
      bird.wingAngle = Math.sin(nowGlobal * 0.012) * 0.4;
      return;
    }

    if (gameState === 'QUIZ') {
      bird.wingAngle = Math.sin(nowGlobal * 0.008) * 0.3;
      return;
    }

    // Ground scrolling
    groundOffset = (groundOffset + currentSpeed) % 24;

    // Shield Timer
    if (gameState === 'RESUME_COUNTDOWN') {
      shieldTimer -= dt;
      if (shieldTimer <= 0) {
        gameState = 'PLAYING';
        shieldIndicator.classList.remove('active');
      }
    }

    // BIRD PHYSICS (Smooth, floaty, controlled)
    bird.velocity += bird.gravity;
    if (bird.velocity > bird.maxFallSpeed) bird.velocity = bird.maxFallSpeed;
    bird.y += bird.velocity;

    // Bird angle rotation halus
    if (bird.velocity < 0) {
      bird.rotation = -0.22;
    } else {
      bird.rotation = Math.min(Math.PI / 3.5, bird.rotation + 0.025);
    }
    bird.wingAngle = Math.sin(nowGlobal * 0.018) * 0.45;

    // Ceiling boundary
    if (bird.y - bird.radius < 0) {
      bird.y = bird.radius;
      bird.velocity = 0;
    }

    // Ground collision -> KALAH
    if (bird.y + bird.radius >= canvas.height - groundHeight) {
      bird.y = canvas.height - groundHeight - bird.radius;
      triggerGameOver();
      return;
    }

    // MOVE TOWERS & COLLISION DETECTION
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      t.x -= currentSpeed;

      // Check passing tower
      if (!t.passed && t.x + t.width < bird.x) {
        t.passed = true;
        towersPassed++;
        score += 10;
        updateHUD();
        addFloatingText('+10', bird.x + 10, bird.y - 15, '#2ecc71');

        // KUIS MUNCUL SETIAP 3 TOWER
        if (towersPassed % 3 === 0) {
          triggerQuiz(t);
          return; // Auto-pause
        }
      }

      // COLLISION DETECTION DENGAN TOWER
      if (!t.destroyed && (gameState === 'PLAYING' || gameState === 'RESUME_COUNTDOWN')) {
        if (gameState !== 'RESUME_COUNTDOWN') {
          // Toleran hitbox
          const inX = (bird.x + bird.hitboxRadius > t.x) && (bird.x - bird.hitboxRadius < t.x + t.width);
          if (inX) {
            const hitTopPipe = (bird.y - bird.hitboxRadius < t.topHeight);
            const hitBottomPipe = (bird.y + bird.hitboxRadius > t.topHeight + t.gap);

            if (hitTopPipe || hitBottomPipe) {
              triggerGameOver();
              return;
            }
          }
        }
      }
    }

    // Remove passed off-screen towers
    if (towers.length > 0 && towers[0].x + towers[0].width < -40) {
      towers.shift();
    }

    // Spawn next tower (Jarak lapang)
    const lastTower = towers[towers.length - 1];
    if (lastTower && lastTower.x < canvas.width + 100 - towerDistance) {
      spawnTower(canvas.width + 80);
    }
  }

  let nowGlobal = 0;

  // RENDERING ENGINE
  function render() {
    nowGlobal = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Sky & Background
    drawSky();

    // 2. City / Bush Skyline
    drawCitySkyline();

    // 3. Flappy Green Pipes
    drawPipes();

    // 4. Ground
    drawGround();

    // 5. Particles
    drawParticles();

    // 6. Flappy Bird
    drawBird();

    // 7. Floating score / popup text
    drawFloatingTexts();
  }

  function drawSky() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 20 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 22 * c.scale, c.y - 8 * c.scale, 24 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 44 * c.scale, c.y, 18 * c.scale, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawCitySkyline() {
    const gy = canvas.height - groundHeight;

    ctx.fillStyle = '#89d4dc';
    ctx.fillRect(0, gy - 60, canvas.width, 60);

    ctx.fillStyle = '#61b9c3';
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.fillRect(x + 5, gy - 75, 25, 75);
    }

    ctx.fillStyle = '#6ab04c';
    bushes.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, gy, b.w / 2, Math.PI, 0);
      ctx.fill();
    });
  }

  function drawPipes() {
    towers.forEach(t => {
      if (t.destroyed) return;

      // Top Pipe
      drawClassicPipe(t.x, 0, t.width, t.topHeight, true);

      // Bottom Pipe
      const bottomY = t.topHeight + t.gap;
      const bottomHeight = canvas.height - groundHeight - bottomY;
      drawClassicPipe(t.x, bottomY, t.width, bottomHeight, false);
    });
  }

  function drawClassicPipe(x, y, w, h, isTop) {
    if (h <= 0) return;

    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#9ce659';
    ctx.fillRect(x + 3, y, 6, h);

    ctx.fillStyle = '#558022';
    ctx.fillRect(x + w - 8, y, 8, h);

    ctx.strokeStyle = '#2d4216';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    const capHeight = 22;
    const capExtend = 4;
    const capY = isTop ? y + h - capHeight : y;

    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(x - capExtend, capY, w + capExtend * 2, capHeight);

    ctx.fillStyle = '#9ce659';
    ctx.fillRect(x - capExtend + 3, capY, 7, capHeight);

    ctx.fillStyle = '#558022';
    ctx.fillRect(x + w + capExtend - 9, capY, 9, capHeight);

    ctx.strokeRect(x - capExtend, capY, w + capExtend * 2, capHeight);
  }

  function drawGround() {
    const gy = canvas.height - groundHeight;

    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, gy, canvas.width, groundHeight);

    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, gy, canvas.width, 14);

    ctx.fillStyle = '#9ce659';
    ctx.fillRect(0, gy + 14, canvas.width, 3);

    ctx.strokeStyle = '#2d4216';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(canvas.width, gy);
    ctx.stroke();

    ctx.fillStyle = '#558022';
    for (let x = -groundOffset; x < canvas.width + 30; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x - 8, gy + 14);
      ctx.lineTo(x - 3, gy + 14);
      ctx.lineTo(x + 5, gy);
      ctx.fill();
    }
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Shield Aura
    if (gameState === 'RESUME_COUNTDOWN') {
      ctx.save();
      const pulse = Math.sin(nowGlobal * 0.01) * 3;
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius + 7 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
      ctx.fill();
      ctx.restore();
    }

    // Yellow Flappy Bird Body
    ctx.fillStyle = '#f7d02c';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Belly Highlight
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(-2, 4, bird.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(-5, 2);
    ctx.rotate(bird.wingAngle);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Big Classic Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(7, -5, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(9, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Orange Lips / Beak
    ctx.fillStyle = '#e17055';
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(22, 2);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawFloatingTexts() {
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = '900 18px Outfit, sans-serif';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  requestAnimationFrame(gameLoop);
});
