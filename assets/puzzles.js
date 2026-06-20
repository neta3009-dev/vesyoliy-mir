/* ═══════════════════════════════════════════════════
   ПАЗЛЫ — данные
═══════════════════════════════════════════════════ */
var PUZZLES = [
  { id: 'car',        name: 'Машинка',    emoji: '🚗', bg: 'linear-gradient(145deg,#e53935,#ef9a9a)' },
  { id: 'airplane',   name: 'Самолёт',    emoji: '✈️',  bg: 'linear-gradient(145deg,#1565c0,#64b5f6)' },
  { id: 'tank',       name: 'Танк',       emoji: '🪖',  bg: 'linear-gradient(145deg,#558b2f,#aed581)' },
  { id: 'cat',        name: 'Кошка',      emoji: '🐱', bg: 'linear-gradient(145deg,#9c27b0,#f48fb1)' },
  { id: 'helicopter', name: 'Вертолёт',   emoji: '🚁', bg: 'linear-gradient(145deg,#ff6d00,#ffe082)' },
  { id: 'horse',      name: 'Лошадь',     emoji: '🐴', bg: 'linear-gradient(145deg,#795548,#d7ccc8)' },
  { id: 'truck',      name: 'Грузовик',   emoji: '🚛', bg: 'linear-gradient(145deg,#c62828,#ef9a9a)' },
  { id: 'excavator',  name: 'Экскаватор', emoji: '🚜', bg: 'linear-gradient(145deg,#f57f17,#fff176)' },
];

/* ═══════════════════════════════════════════════════
   ПАЗЛЫ — игровое состояние
═══════════════════════════════════════════════════ */
var PZ = {
  current:  null,       // текущий пазл
  arrange:  [],         // arrange[slot] = pieceId
  locked:   [],         // locked[slot] = true/false
  selected: null,       // выбранный слот
  COLS: 2, ROWS: 4, N: 8,
};

function pzShuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
}

function pzOpen(puzzle) {
  PZ.current  = puzzle;
  PZ.locked   = [false,false,false,false,false,false,false,false];
  PZ.selected = null;
  PZ.arrange  = [0,1,2,3,4,5,6,7];
  /* перемешиваем, пока хоть одна фигура на своём месте */
  do { pzShuffle(PZ.arrange); }
  while (PZ.arrange.some(function(p,i){ return p === i; }));

  document.getElementById('puzzle-title').textContent = puzzle.name;
  var ref = document.getElementById('puzzle-reference');
  ref.style.backgroundImage = "url('assets/images/puzzle/" + puzzle.id + ".png')";

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
  var img = "url('assets/images/puzzle/" + PZ.current.id + ".png')";

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

  if (PZ.locked.every(Boolean)) {
    setTimeout(function() {
      successSound();
      launchConfetti(130);
      speak('Ура! Пазл собран! Ты молодец!');
    }, 350);
  }
}
