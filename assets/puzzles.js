/* ═══════════════════════════════════════════════════
   ПАЗЛЫ — пути к PNG-картинкам
═══════════════════════════════════════════════════ */
var PZ_IMG = {
  car:        'assets/images/puzzle/' + encodeURIComponent('машинка')    + '.png',
  airplane:   'assets/images/puzzle/' + encodeURIComponent('самолёт')    + '.png',
  train:      'assets/images/puzzle/' + encodeURIComponent('поезд')      + '.png',
  cat:        'assets/images/puzzle/' + encodeURIComponent('кошка')      + '.png',
  helicopter: 'assets/images/puzzle/' + encodeURIComponent('вертолёт')   + '.png',
  horse:      'assets/images/puzzle/' + encodeURIComponent('лошадь')     + '.png',
  tractor:    'assets/images/puzzle/' + encodeURIComponent('трактор')    + '.png',
  excavator:  'assets/images/puzzle/' + encodeURIComponent('экскаватор') + '.png',
};

/* ═══════════════════════════════════════════════════
   ПАЗЛЫ — данные
═══════════════════════════════════════════════════ */
var PUZZLES = [
  { id: 'car',        name: 'Машинка',    emoji: '🚗', bg: 'linear-gradient(145deg,#e53935,#ef9a9a)' },
  { id: 'airplane',   name: 'Самолёт',    emoji: '✈️',  bg: 'linear-gradient(145deg,#1565c0,#64b5f6)' },
  { id: 'train',      name: 'Поезд',      emoji: '🚂', bg: 'linear-gradient(145deg,#607d8b,#90a4ae)' },
  { id: 'cat',        name: 'Кошка',      emoji: '🐱', bg: 'linear-gradient(145deg,#9c27b0,#f48fb1)' },
  { id: 'helicopter', name: 'Вертолёт',   emoji: '🚁', bg: 'linear-gradient(145deg,#ff6d00,#ffe082)' },
  { id: 'horse',      name: 'Лошадь',     emoji: '🐴', bg: 'linear-gradient(145deg,#795548,#d7ccc8)' },
  { id: 'tractor',    name: 'Трактор',    emoji: '🚜', bg: 'linear-gradient(145deg,#558b2f,#aed581)' },
  { id: 'excavator',  name: 'Экскаватор', emoji: '🏗️', bg: 'linear-gradient(145deg,#f57f17,#fff176)' },
];
var PZ = {
  current:  null,       // текущий пазл
  arrange:  [],         // arrange[slot] = pieceId
  locked:   [],         // locked[slot] = true/false
  selected: null,       // выбранный слот
  COLS: 2, ROWS: 2, N: 4,
};

function pzShuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
}

function pzOpen(puzzle) {
  PZ.current  = puzzle;
  PZ.locked   = [false,false,false,false];
  PZ.selected = null;
  PZ.arrange  = [0,1,2,3];
  /* перемешиваем, пока хоть одна фигура на своём месте */
  do { pzShuffle(PZ.arrange); }
  while (PZ.arrange.some(function(p,i){ return p === i; }));

  document.getElementById('puzzle-title').textContent = puzzle.name;
  var hint = document.getElementById('puzzle-hint-img');
  hint.style.backgroundImage = "url('" + PZ_IMG[puzzle.id] + "')";

  pzRender();
  showScreen('screen-puzzle-play');
  speak('Собери пазл! ' + puzzle.name);
}

function pzBgPos(pieceId) {
  var col = pieceId % PZ.COLS;
  var row = Math.floor(pieceId / PZ.COLS);
  var bx  = col === 0 ? '0%' : '100%';
  var by  = (row / (PZ.ROWS - 1) * 100).toFixed(2) + '%';
  return bx + ' ' + by;
}

function pzRender() {
  var grid = document.getElementById('puzzle-grid');
  grid.innerHTML = '';
  var img = "url('" + PZ_IMG[PZ.current.id] + "')";

  for (var slot = 0; slot < PZ.N; slot++) {
    (function(slot) {
      var pieceId = PZ.arrange[slot];
      var cell = document.createElement('div');
      cell.className = 'puzzle-cell' +
        (PZ.locked[slot]   ? ' pz-locked'   : '') +
        (PZ.selected === slot ? ' pz-selected' : '');
      cell.style.backgroundImage    = img;
      cell.style.backgroundSize     = (PZ.COLS * 100) + '% ' + (PZ.ROWS * 100) + '%';
      cell.style.backgroundPosition = pzBgPos(pieceId);
      cell.addEventListener('click', function(){ pzClick(slot); });
      grid.appendChild(cell);
    })(slot);
  }

  var done = PZ.locked.filter(Boolean).length;
  document.getElementById('puzzle-progress').textContent = '✅ ' + done + ' / ' + PZ.N;

  /* Явно задаём высоту = ширина ячейки — страховка если padding-bottom:100% не работает */
  setTimeout(function() {
    var g = document.getElementById('puzzle-grid');
    var first = g && g.querySelector('.puzzle-cell');
    if (first && first.offsetWidth > 10) {
      var h = first.offsetWidth + 'px';
      var cells = g.querySelectorAll('.puzzle-cell');
      for (var i = 0; i < cells.length; i++) { cells[i].style.height = h; }
    }
  }, 30);
}

function pzClick(slot) {
  if (PZ.locked[slot] && PZ.selected === null) return;

  if (PZ.selected === null) {
    if (PZ.locked[slot]) return;
    PZ.selected = slot;
    tapSound();
    pzRender();
    return;
  }

  if (slot === PZ.selected) {
    PZ.selected = null;
    pzRender();
    return;
  }

  if (PZ.locked[slot]) {
    PZ.selected = null;
    pzRender();
    return;
  }

  /* меняем местами */
  var t = PZ.arrange[PZ.selected];
  PZ.arrange[PZ.selected] = PZ.arrange[slot];
  PZ.arrange[slot] = t;
  tapSound();

  var lockedBefore = PZ.locked.filter(Boolean).length;

  /* проверяем, встали ли на правильные места */
  if (PZ.arrange[slot] === slot) {
    PZ.locked[slot] = true;
    tone(523 + slot * 40, 0.25, 'triangle', 0.28);
  }
  if (PZ.arrange[PZ.selected] === PZ.selected) {
    PZ.locked[PZ.selected] = true;
    tone(523 + PZ.selected * 40, 0.25, 'triangle', 0.28);
  }

  PZ.selected = null;
  pzRender();

  var lockedNow = PZ.locked.filter(Boolean).length;

  if (PZ.locked.every(Boolean)) {
    setTimeout(function() {
      successSound();
      launchConfetti(130);
      speak('Ура! Пазл собран! Ты молодец!');
    }, 350);
  } else if (lockedNow > lockedBefore) {
    var remaining = PZ.N - lockedNow;
    setTimeout(function() {
      speak('Правильно! Ещё ' + remaining + '!');
    }, 300);
  }
}