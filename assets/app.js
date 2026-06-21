/* Совместимая замена querySelectorAll().forEach() для старых Android WebView */
function qsa(sel, fn) {
  var els = document.querySelectorAll(sel);
  for (var i = 0; i < els.length; i++) { fn(els[i]); }
}

/* iOS: разблокировать AudioContext при первом касании */
document.addEventListener('touchstart', function unlockCtx() {
  document.removeEventListener('touchstart', unlockCtx);
  try { getCtx(); } catch(e) {}
}, { passive: true });

/* Остановить всё аудио: клипы + голос */
function stopAllAudio() {
  try { stopAllClips(); } catch(e) {}
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch(e) {}
}

/* ═══════════════════════════════════════════════════
   WEB AUDIO ENGINE
═══════════════════════════════════════════════════ */
var AudioCtx = null;

function getCtx() {
  if (!AudioCtx) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) AudioCtx = new AC();
    } catch(e) {}
  }
  if (AudioCtx && AudioCtx.state === 'suspended') {
    try { AudioCtx.resume(); } catch(e) {}
  }
  return AudioCtx;
}

function tone(freq, dur, type, vol, delay) {
  var ctx = getCtx();
  if (!ctx) return;
  try {
    type  = type  || 'sine';
    vol   = vol   || 0.3;
    delay = delay || 0;
    var t   = ctx.currentTime + delay;
    var osc = ctx.createOscillator();
    var g   = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch(e) {}
}

/* звуковые подписи животных */
function animalSound(id) {
  switch (id) {
    case 'cat':
      tone(880, 0.2, 'sine', 0.35);
      tone(698, 0.35, 'sine', 0.28, 0.25);
      break;
    case 'dog':
      tone(220, 0.12, 'square', 0.35);
      tone(196, 0.18, 'square', 0.30, 0.18);
      tone(220, 0.12, 'square', 0.35, 0.42);
      tone(196, 0.18, 'square', 0.30, 0.60);
      break;
    case 'cow':
      tone(110, 0.9, 'sine', 0.38);
      tone(130, 0.4, 'sine', 0.25, 0.9);
      break;
    case 'frog':
      [0, 0.22, 0.44].forEach(function (d) { tone(392, 0.14, 'square', 0.32, d); });
      break;
    case 'duck':
      tone(554, 0.15, 'sine', 0.35);
      tone(415, 0.22, 'sine', 0.30, 0.22);
      tone(554, 0.15, 'sine', 0.28, 0.5);
      tone(415, 0.22, 'sine', 0.25, 0.72);
      break;
    case 'horse':
      [262, 330, 392, 523, 659].forEach(function (f, i) {
        tone(f, 0.14, 'sine', 0.28, i * 0.12);
      });
      break;
    case 'sheep':
      tone(370, 0.55, 'sine', 0.32);
      tone(392, 0.35, 'sine', 0.22, 0.6);
      break;
    case 'pig':
      [294, 262, 294, 277].forEach(function (f, i) {
        tone(f, 0.12, 'triangle', 0.32, i * 0.14);
      });
      break;
  }
}

function successSound() {
  [523, 659, 784, 1047].forEach(function (f, i) {
    tone(f, 0.22, 'triangle', 0.22, i * 0.12);
  });
}

function tapSound() {
  tone(600, 0.06, 'sine', 0.18);
}


/* ═══════════════════════════════════════════════════
   РЕЧЬ — Web Speech API
═══════════════════════════════════════════════════ */
var _speakHeartbeat = null;

function speak(text) {
  if (!window.speechSynthesis) return;
  try { speechSynthesis.cancel(); } catch(e) {}
  if (_speakHeartbeat) { clearInterval(_speakHeartbeat); _speakHeartbeat = null; }

  function doSpeak() {
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang   = 'ru-RU';
      u.rate   = 0.8;
      u.pitch  = 1.2;
      u.volume = 1;

      var voices  = speechSynthesis.getVoices();
      var ruVoice = voices.filter(function(v) { return v.lang && v.lang.startsWith('ru'); })[0];
      if (ruVoice) u.voice = ruVoice;

      u.onend = u.onerror = function() {
        if (_speakHeartbeat) { clearInterval(_speakHeartbeat); _speakHeartbeat = null; }
      };

      speechSynthesis.speak(u);

      /* iOS-фикс: SpeechSynthesis «засыпает» через ~15 сек — будим его каждые 10 сек */
      _speakHeartbeat = setInterval(function() {
        if (!window.speechSynthesis || !speechSynthesis.speaking) {
          clearInterval(_speakHeartbeat); _speakHeartbeat = null; return;
        }
        speechSynthesis.pause();
        speechSynthesis.resume();
      }, 10000);
    } catch(e) {}
  }

  /* iOS: getVoices() первый раз возвращает [] — ждём voiceschanged или таймаут */
  if (speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    var voiceFallback = setTimeout(doSpeak, 500);
    try {
      speechSynthesis.onvoiceschanged = function() {
        speechSynthesis.onvoiceschanged = null;
        clearTimeout(voiceFallback);
        doSpeak();
      };
    } catch(e) {}
  }
}

/* ═══════════════════════════════════════════════════
   КОНФЕТТИ
═══════════════════════════════════════════════════ */
function launchConfetti(count) {
  count = count || 55;
  var container = document.getElementById('confetti-container');
  container.innerHTML = '';
  var colors = ['#ff6b35','#4ecdc4','#ffe66d','#a855f7','#ff4d94','#00c851','#ff9a3c','#45b7d1'];
  for (var i = 0; i < count; i++) {
    var el      = document.createElement('div');
    el.className = 'confetti-piece';
    var size    = 8 + Math.random() * 14;
    var isRound = Math.random() > 0.5;
    var dx      = (Math.random() - 0.5) * 260;
    var dur     = 1.3 + Math.random() * 1.4;
    var delay   = Math.random() * 0.5;
    el.style.cssText =
      'left:'          + (10 + Math.random() * 80) + '%;' +
      'width:'         + size + 'px;' +
      'height:'        + (isRound ? size : size * (0.5 + Math.random())) + 'px;' +
      'background:'    + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'border-radius:' + (isRound ? '50%' : '3px') + ';' +
      '--dx:'          + dx + 'px;' +
      'animation:confettiFall ' + dur + 's ' + delay + 's linear both;';
    container.appendChild(el);
  }
  setTimeout(function () { container.innerHTML = ''; }, 2600);
}

/* ═══════════════════════════════════════════════════
   ЭКРАНЫ
═══════════════════════════════════════════════════ */
function showScreen(id) {
  qsa('.screen', function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

/* ═══════════════════════════════════════════════════
   ЗАСТАВКА
═══════════════════════════════════════════════════ */
(function initSplash() {
  var splash = document.getElementById('screen-splash');
  var icons  = ['⭐','🌟','✨','🌈','🎈','🎉','💫','🦋'];
  for (var i = 0; i < 18; i++) {
    var s = document.createElement('span');
    s.className   = 'splash-bg-star';
    s.textContent = icons[i % icons.length];
    s.style.cssText =
      'left:' + Math.random() * 100 + '%;' +
      'top:'  + Math.random() * 100 + '%;' +
      '--d:'  + (1.5 + Math.random() * 2.5) + 's;' +
      '--sz:' + (20  + Math.random() * 24)  + 'px;' +
      '--delay:' + Math.random() * 2 + 's;';
    splash.appendChild(s);
  }

  document.getElementById('btn-play').addEventListener('click', function () {
    try { getCtx(); successSound(); playClip('snd_hello', undefined, 'Привет! Давай играть!'); } catch(e) {}
    showScreen('screen-menu');
  });
})();

/* ═══════════════════════════════════════════════════
   МЕНЮ
═══════════════════════════════════════════════════ */
qsa('[data-goto]', function (card) {
  card.addEventListener('click', function () {
    stopAllAudio();
    tapSound();
    var target = card.dataset.goto;
    showScreen(target);
    if (target === 'screen-alphabet') renderAlphabetPage();
    if (target === 'screen-numbers')  resetNumbers();
    if (target === 'screen-shapes')   setTimeout(function() { try { playClip('snd_task_' + TASKS[taskIdx].targetId, undefined, TASKS[taskIdx].text.replace('👇 ', '')); } catch(e){} }, 500);
    if (target === 'screen-puzzles')  initPuzzleSelect();
  });
});

qsa('.btn-back', function (btn) {
  btn.addEventListener('click', function () {
    stopAllAudio();
    tapSound();
    var fromPuzzlePlay = (btn.id === 'puzzle-play-back');
    showScreen(fromPuzzlePlay ? 'screen-puzzles' : 'screen-menu');
  });
});

/* ── Инициализация экрана выбора пазла ── */
function initPuzzleSelect() {
  var grid = document.getElementById('puzzle-select-grid');
  grid.innerHTML = '';
  PUZZLES.forEach(function(p) {
    var card = document.createElement('div');
    card.className = 'puzzle-option-card';
    card.style.background = p.bg;
    var thumb = document.createElement('div');
    thumb.className = 'puzzle-option-thumb';
    thumb.style.backgroundImage = "url('" + PZ_IMG[p.id] + "')";
    var label = document.createElement('div');
    label.className = 'puzzle-option-name';
    label.textContent = p.emoji + ' ' + p.name;
    card.appendChild(thumb);
    card.appendChild(label);
    card.addEventListener('click', function() { stopAllAudio(); tapSound(); pzOpen(p); });
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════
   РЕЧЕВОЙ ПУЗЫРЬ
═══════════════════════════════════════════════════ */
function showBubble(text, card, color) {
  var bubble = document.getElementById('speech-bubble');
  var rect   = card.getBoundingClientRect();
  bubble.textContent = text;
  bubble.style.color = color || '#333';
  bubble.style.left  = (rect.left + rect.width / 2) + 'px';
  bubble.style.top   = (rect.top + window.scrollY - 20) + 'px';
  bubble.classList.remove('hidden', 'bubble-anim');
  void bubble.offsetWidth;
  bubble.classList.add('bubble-anim');
  clearTimeout(bubble._t);
  bubble._t = setTimeout(function () { bubble.classList.add('hidden'); }, 1800);
}

/* ═══════════════════════════════════════════════════
   1. ЖИВОТНЫЕ
═══════════════════════════════════════════════════ */
(function initAnimals() {
  var grid = document.getElementById('animals-grid');
  ANIMALS.forEach(function (a) {
    var card = document.createElement('div');
    card.className = 'animal-card';
    card.style.background = a.bg;

    var wrapper = document.createElement('div');
    wrapper.className = 'anim-wrapper ' + a.idle;

    var emoji = document.createElement('span');
    emoji.className = 'animal-emoji';
    if (a.emoji && a.emoji.charAt(0) === '<') {
      emoji.innerHTML = a.emoji; /* SVG-утка — innerHTML для поддержки старых Android */
    } else {
      emoji.textContent = a.emoji;
    }

    var name = document.createElement('span');
    name.className   = 'animal-name';
    name.textContent = a.name;

    wrapper.appendChild(emoji);
    card.appendChild(wrapper);
    card.appendChild(name);

    var busy = false;
    var busyTimer = null;
    card.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      wrapper.className = 'anim-wrapper ' + a.click;
      function resetBusy() {
        wrapper.className = 'anim-wrapper ' + a.idle;
        busy = false;
        if (busyTimer) { clearTimeout(busyTimer); busyTimer = null; }
      }
      wrapper.addEventListener('animationend', resetBusy, { once: true });
      busyTimer = setTimeout(resetBusy, 900); /* запасной, если animationend не сработает */

      animalSound(a.id);
      playClip('snd_' + a.id, undefined, a.phrase);
      showBubble(a.sound, card, a.glow);
      launchConfetti(45);
    });

    grid.appendChild(card);
  });
})();

/* ═══════════════════════════════════════════════════
   2. ЦВЕТА И ФОРМЫ
═══════════════════════════════════════════════════ */
var SHAPES = [
  { id: 'circle',    name: 'Красный круг',            color: '#e63946',
    svg: '<circle cx="45" cy="45" r="40" fill="#e63946"/>' },
  { id: 'square',    name: 'Синий квадрат',            color: '#4361ee',
    svg: '<rect x="5" y="5" width="80" height="80" fill="#4361ee" rx="10"/>' },
  { id: 'triangle',  name: 'Жёлтый треугольник',       color: '#f4c430',
    svg: '<polygon points="45,4 88,86 2,86" fill="#f4c430"/>' },
  { id: 'star',      name: 'Зелёная звезда',           color: '#2dc653',
    svg: '<polygon points="45,5 57,35 90,35 64,57 74,88 45,68 16,88 26,57 0,35 33,35" fill="#2dc653"/>' },
  { id: 'heart',     name: 'Оранжевое сердце',         color: '#ff6b35',
    svg: '<path d="M45 78 C18 58 4 43 4 28 C4 14 18 7 45 28 C72 7 86 14 86 28 C86 43 72 58 45 78Z" fill="#ff6b35"/>' },
  { id: 'rectangle', name: 'Фиолетовый прямоугольник', color: '#a855f7',
    svg: '<rect x="4" y="20" width="82" height="50" fill="#a855f7" rx="10"/>' },
];
var TASKS = [
  { text: '👇 Найди красный круг!',             targetId: 'circle',    ok: 'Молодец! Это красный круг!' },
  { text: '👇 Найди синий квадрат!',            targetId: 'square',    ok: 'Отлично! Это синий квадрат!' },
  { text: '👇 Найди жёлтый треугольник!',       targetId: 'triangle',  ok: 'Супер! Это жёлтый треугольник!' },
  { text: '👇 Найди зелёную звезду!',           targetId: 'star',      ok: 'Ура! Это зелёная звезда!' },
  { text: '👇 Найди оранжевое сердце!',         targetId: 'heart',     ok: 'Классно! Это оранжевое сердце!' },
  { text: '👇 Найди фиолетовый прямоугольник!', targetId: 'rectangle', ok: 'Великолепно! Это фиолетовый прямоугольник!' },
];
var taskIdx = 0;

function highlightTask(autoSpeak) {
  qsa('.shape-card', function (c) {
    c.classList.remove('task-target');
    c.style.removeProperty('--glow');
  });
  var t    = TASKS[taskIdx];
  var shp  = SHAPES.filter(function (s) { return s.id === t.targetId; })[0];
  var card = document.querySelector('.shape-card[data-sid="' + t.targetId + '"]');
  if (card && shp) { card.classList.add('task-target'); card.style.setProperty('--glow', shp.color); }
  document.getElementById('task-bar').textContent = t.text;
  if (autoSpeak) setTimeout(function() { playClip('snd_task_' + t.targetId, undefined, t.text.replace('👇 ', '')); }, 300);
}

(function initShapes() {
  var grid = document.getElementById('shapes-grid');
  SHAPES.forEach(function (s) {
    var card = document.createElement('div');
    card.className   = 'shape-card';
    card.dataset.sid = s.id;
    card.innerHTML   =
      '<svg class="shape-svg" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">' +
      s.svg + '</svg><span class="shape-name">' + s.name + '</span>';
    card.addEventListener('click', function () {
      card.classList.remove('grow');
      void card.offsetWidth;
      card.classList.add('grow');
      card.addEventListener('animationend', function () { card.classList.remove('grow'); }, { once: true });
      if (s.id === TASKS[taskIdx].targetId) {
        var okText = TASKS[taskIdx].ok;
        taskIdx = (taskIdx + 1) % TASKS.length;
        try { fanfareSound(); launchConfetti(); } catch(e) {}
        var bar = document.getElementById('task-bar');
        try { bar.classList.add('task-success'); bar.addEventListener('animationend', function () { bar.classList.remove('task-success'); }, { once: true }); } catch(e) {}
        playClip('snd_ok_' + s.id, function() {
          setTimeout(function() { try { highlightTask(true); } catch(e) { highlightTask(false); } }, 500);
        }, okText);
      } else {
        tapSound();
        playClip('snd_' + s.id, undefined, s.name);
      }
    });
    grid.appendChild(card);
  });
  document.getElementById('task-bar').addEventListener('click', function () {
    playClip('snd_task_' + TASKS[taskIdx].targetId, undefined, TASKS[taskIdx].text.replace('👇 ', ''));
  });
  highlightTask();
})();

/* ═══════════════════════════════════════════════════
   3. ЦИФРЫ — найди нужную!
═══════════════════════════════════════════════════ */
var NUM_COLORS = [
  'linear-gradient(145deg,#ff6b6b,#ee5a24)','linear-gradient(145deg,#ffa726,#fb8c00)',
  'linear-gradient(145deg,#66bb6a,#2e7d32)','linear-gradient(145deg,#42a5f5,#1565c0)',
  'linear-gradient(145deg,#ab47bc,#6a1b9a)','linear-gradient(145deg,#26c6da,#00838f)',
  'linear-gradient(145deg,#ec407a,#880e4f)','linear-gradient(145deg,#ff7043,#bf360c)',
  'linear-gradient(145deg,#8d6e63,#4e342e)','linear-gradient(145deg,#546e7a,#263238)',
];

var numTarget = 0;
var numBusy   = false;

function fanfareSound() {
  [523, 659, 784, 1047, 1319].forEach(function (f, i) {
    tone(f, 0.22, 'triangle', 0.22, i * 0.1);
  });
  [784, 988, 1175].forEach(function (f) { tone(f, 0.45, 'sine', 0.18, 0.58); });
}

function wrongSound() {
  tone(260, 0.14, 'square', 0.25);
  tone(210, 0.22, 'square', 0.2, 0.18);
}

function newNumberTask() {
  numBusy = false;
  var prev = numTarget;
  do { numTarget = Math.floor(Math.random() * 20) + 1; } while (numTarget === prev);
  document.getElementById('num-task-big').textContent = numTarget;
  qsa('.number-card', function (c) { c.classList.remove('num-correct', 'num-wrong'); });
  setTimeout(function () { try { playClip('snd_num_' + numTarget, undefined, 'Найди цифру ' + numTarget + '!'); } catch(e) {} }, 350);
}

function resetNumbers() {
  numBusy   = false;
  numTarget = 0;
  document.getElementById('num-task-big').textContent = '?';
  qsa('.number-card', function (c) { c.classList.remove('num-correct', 'num-wrong'); });
  setTimeout(newNumberTask, 700);
}

(function initNumbers() {
  var grid = document.getElementById('numbers-grid');
  for (var n = 1; n <= 20; n++) {
    (function (n) {
      var card = document.createElement('div');
      card.className = 'number-card';
      card.textContent = n;
      card.style.background = NUM_COLORS[(n - 1) % NUM_COLORS.length];
      card.addEventListener('click', function () {
        if (numBusy) return;
        tapSound();
        if (n === numTarget) {
          numBusy = true;
          card.classList.add('num-correct');
          try { fanfareSound(); launchConfetti(100); } catch(e) {}
          setTimeout(function() {
            try { playClip('snd_numok_' + Math.floor(Math.random() * 5), undefined, 'Молодец! Правильно!'); } catch(e) {}
          }, 500);
          setTimeout(newNumberTask, 2900);
        } else {
          card.classList.add('num-wrong');
          card.addEventListener('animationend', function () {
            card.classList.remove('num-wrong');
          }, { once: true });
          wrongSound();
          var noIdx = Math.floor(Math.random() * 3);
          setTimeout(function() {
            playClip('snd_numno_' + noIdx, function() {
              setTimeout(function() { playClip('snd_num_' + numTarget, undefined, 'Найди цифру ' + numTarget + '!'); }, 200);
            }, 'Не верно! Найди цифру ' + numTarget + '!');
          }, 500);
        }
      });
      grid.appendChild(card);
    })(n);
  }

  document.getElementById('num-task-bar').addEventListener('click', function () {
    if (numTarget > 0) playClip('snd_num_' + numTarget, undefined, 'Найди цифру ' + numTarget + '!');
  });
})();

/* ═══════════════════════════════════════════════════
   4. АЛФАВИТ
═══════════════════════════════════════════════════ */
var LETTERS_PER_PAGE = 6;
var alphaPage = 0;
var LETTER_BG = [
  'linear-gradient(145deg,#ffb3c6,#ff6b9d)','linear-gradient(145deg,#ffe29a,#f7971e)',
  'linear-gradient(145deg,#a8edea,#43b89c)','linear-gradient(145deg,#b7f7c0,#2dc653)',
  'linear-gradient(145deg,#d4b3f7,#7b5ea7)','linear-gradient(145deg,#d0e8ff,#5b9bd5)',
];

function renderAlphabetPage() {
  var grid  = document.getElementById('letters-grid');
  grid.innerHTML = '';
  var start = alphaPage * LETTERS_PER_PAGE;
  var slice = ALPHABET.slice(start, start + LETTERS_PER_PAGE);
  slice.forEach(function (item, idx) {
    var card  = document.createElement('div');
    card.className = 'letter-card';
    var inner = document.createElement('div');
    inner.className = 'letter-card-inner';
    var front = document.createElement('div');
    front.className = 'letter-card-front';
    front.style.background = LETTER_BG[idx % LETTER_BG.length];
    front.innerHTML = '<span class="letter-big" style="color:#fff;text-shadow:0 3px 10px rgba(0,0,0,.25)">' + item.letter + '</span>';
    var back = document.createElement('div');
    back.className = 'letter-card-back';
    back.innerHTML = '<span class="letter-emoji">' + item.emoji + '</span><span class="letter-word">' + item.word + '</span>';
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    var flipped = false;
    card.addEventListener('click', function () {
      tapSound();
      if (!flipped) {
        card.classList.add('flipped');
        flipped = true;
        playAlpha(start + idx);
        launchConfetti(30);
      } else {
        card.classList.remove('flipped');
        flipped = false;
        playAlpha(start + idx);
      }
    });
    grid.appendChild(card);
  });
  var total = Math.ceil(ALPHABET.length / LETTERS_PER_PAGE);
  document.getElementById('page-indicator').textContent = (alphaPage + 1) + ' / ' + total;
  document.getElementById('btn-prev').disabled = (alphaPage === 0);
  document.getElementById('btn-next').disabled = (alphaPage >= total - 1);
}

document.getElementById('btn-prev').addEventListener('click', function () {
  if (alphaPage > 0) { tapSound(); alphaPage--; renderAlphabetPage(); }
});
document.getElementById('btn-next').addEventListener('click', function () {
  var total = Math.ceil(ALPHABET.length / LETTERS_PER_PAGE);
  if (alphaPage < total - 1) { tapSound(); alphaPage++; renderAlphabetPage(); }
});
