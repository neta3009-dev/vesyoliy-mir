/* ═══════════════════════════════════════════════════
   AUDIO — пользовательские записи
═══════════════════════════════════════════════════ */
var CLIPS = {};

(function preload() {
  var keys = [
    /* животные */
    'snd_cat','snd_dog','snd_cow','snd_frog',
    'snd_duck','snd_horse','snd_sheep','snd_pig',
    /* цифры-счёт (старые, для возможного повтора) */
    'snd_n1','snd_n2','snd_n3','snd_n4','snd_n5',
    'snd_n6','snd_n7','snd_n8','snd_n9','snd_n10','snd_done',
    /* формы */
    'snd_circle','snd_square','snd_triangle',
    'snd_star','snd_heart','snd_rectangle',
    /* фразы — приветствие */
    'snd_hello',
    /* фразы — задания форм */
    'snd_task_circle','snd_task_square','snd_task_triangle',
    'snd_task_star','snd_task_heart','snd_task_rectangle',
    /* фразы — правильно (формы) */
    'snd_ok_circle','snd_ok_square','snd_ok_triangle',
    'snd_ok_star','snd_ok_heart','snd_ok_rectangle',
    /* фразы — задания цифр 1–20 */
    'snd_num_1','snd_num_2','snd_num_3','snd_num_4','snd_num_5',
    'snd_num_6','snd_num_7','snd_num_8','snd_num_9','snd_num_10',
    'snd_num_11','snd_num_12','snd_num_13','snd_num_14','snd_num_15',
    'snd_num_16','snd_num_17','snd_num_18','snd_num_19','snd_num_20',
    /* фразы — молодец (5 вариантов) */
    'snd_numok_0','snd_numok_1','snd_numok_2','snd_numok_3','snd_numok_4',
    /* фразы — не верно (3 варианта) */
    'snd_numno_0','snd_numno_1','snd_numno_2',
  ];
  for (var i = 0; i < 30; i++) keys.push('snd_al_' + i);

  keys.forEach(function(k) {
    var a = new Audio('assets/audio/' + k + '.m4a');
    a.preload = 'none'; /* не грузить файлы заранее — они могут не существовать */
    CLIPS[k] = a;
  });
})();

/* Остановить все клипы */
function stopAllClips() {
  for (var k in CLIPS) {
    try { CLIPS[k].pause(); CLIPS[k].currentTime = 0; } catch(e) {}
  }
}

/* Файлы, которых не существует — запоминаем, чтобы следующий вызов был мгновенным */
var DEAD_CLIPS = {};

/* Воспроизвести клип; новый звук останавливает все предыдущие.
   fallbackText — фраза для speak() ТОЛЬКО если файл реально не загрузился */
function playClip(key, onEnd, fallbackText) {
  stopAllClips();

  /* Уже знаем, что файл не существует — сразу говорим */
  if (DEAD_CLIPS[key]) {
    if (fallbackText) { try { speak(fallbackText); } catch(e) {} }
    if (onEnd) onEnd();
    return;
  }

  var clip = CLIPS[key];
  if (!clip) {
    if (fallbackText) { try { speak(fallbackText); } catch(e) {} }
    if (onEnd) onEnd();
    return;
  }
  try { clip.currentTime = 0; } catch(e) {}

  var finished = false;

  function finish() {
    if (finished) return; finished = true;
    clip.removeEventListener('ended', onDone);
    clip.removeEventListener('error', onErr);
    if (onEnd) onEnd();
  }
  function onDone() { finish(); }
  function onErr() {
    DEAD_CLIPS[key] = true; /* помним: этот файл не существует */
    if (fallbackText) { try { speak(fallbackText); } catch(e) {} }
    finish();
  }

  clip.addEventListener('ended', onDone);
  clip.addEventListener('error', onErr);

  try {
    var p = clip.play();
    if (p && p.catch) { p.catch(function() { if (!finished) onErr(); }); }
  } catch(e) { onErr(); }
}

/* Буква алфавита: idx = индекс в массиве ALPHABET (0..29)
   Каждый клип snd_al_N содержит полную фразу "Буква. Слово" */
function playAlpha(idx) {
  playClip('snd_al_' + idx);
}
