(function () {
  var stage = document.getElementById('stage'), slides = [].slice.call(document.querySelectorAll('.slide'));
  var pager = document.getElementById('pager'), black = document.getElementById('black'), demo = document.getElementById('demo');
  var figs = [].slice.call(document.querySelectorAll('.supr .f'));

  // одна супрематическая композиция: [x, y] в долях зоны, поворот, масштаб — порядок как в svg
  var BASE = {
    doc: [.3, .36, -8, 1], doc2: [.64, .56, 10, 1], stamp: [.76, .2, -12, 1], hash: [.45, .88, -6, .9],
    bubble: [.2, .68, 4, 1], bubble2: [.84, .8, -4, 1], lock: [.08, .14, 10, .9], photo: [.9, .4, 8, 1],
    ring: [.76, .2, 0, 1], line: [.5, .5, -28, 1], dot: [.04, .5, 0, 1], dot2: [.96, .96, 0, 1]
  };
  // где композиция на каждом слайде: зона x, y, w, h, масштаб, поворот, зеркало
  var ZONE = [
    [1340, 70, 500, 940, 1, 0, 0],
    [1440, 90, 400, 880, .75, 12, 1],
    [1000, 30, 860, 250, .5, 0, 1],
    [1500, 80, 360, 900, .7, -14, 0],
    [1520, 120, 330, 840, .65, 16, 1],
    [1380, 90, 470, 900, .85, -8, 0],
    [1420, 110, 420, 860, .8, 18, 1],
    [1420, 90, 430, 900, .8, -16, 0],
    [1520, 110, 330, 860, .65, 10, 1],
    [1360, 40, 520, 420, .7, 0, 0]
  ];
  var cur = -1;
  slides.forEach(function () { pager.appendChild(document.createElement('i')); });
  figs.forEach(function (f, i) {
    f.style.setProperty('--d', (i * .05) + 's');
    f.querySelector('.in').style.setProperty('--t', (7 + (i * 37 % 6)) + 's');
    f.addEventListener('mouseenter', function () {
      f.classList.add('lit');
      clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove('lit'); }, 700);
    });
  });

  function compose(i) {
    var z = ZONE[i], cx = z[0] + z[2] / 2, cy = z[1] + z[3] / 2, a = z[5] * Math.PI / 180;
    figs.forEach(function (f, n) {
      var b = BASE[f.dataset.k], u = z[6] ? 1 - b[0] : b[0];
      var x = z[0] + u * z[2] - cx, y = z[1] + b[1] * z[3] - cy;
      var px = cx + x * Math.cos(a) - y * Math.sin(a), py = cy + x * Math.sin(a) + y * Math.cos(a);
      var rot = (z[6] ? -b[2] : b[2]) + z[5];
      f.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) rotate(' + rot + 'deg) scale(' + (b[3] * z[4]) + ')';
      // композиция «загорается» по мере рассказа: к последнему слайду — вся в полную силу
      f.classList.toggle('on', n < Math.round(figs.length * (i + 1) / slides.length));
    });
  }

  function fit() {
    var k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'scale(' + k + ') translate(-50%, -50%)';
  }
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) slides[cur].classList.remove('on');
    cur = i;
    slides[i].classList.add('on');
    [].forEach.call(pager.children, function (d, k) { d.classList.toggle('on', k === i); });
    compose(i);
    if (slides[i].classList.contains('s3')) clip(0); else demo.pause();
    history.replaceState(null, '', '#' + (i + 1));
  }

  // раз в три секунды вспыхивает одна случайная фигура
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () {
      var f = figs[Math.floor(Math.random() * figs.length)];
      f.classList.add('flash');
      setTimeout(function () { f.classList.remove('flash'); }, 650);
    }, 3000);
  }

  // кликер шлёт PageDown/PageUp или стрелки; F5 — во весь экран, B или точка — чёрный экран
  addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'b' || k === 'B' || k === 'и' || k === 'И' || k === '.' || k === 'ю') { black.hidden = !black.hidden; return; }
    if (k === 'F5' || k === 'f' || k === 'F' || k === 'а' || k === 'А') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen();
      return;
    }
    if (!black.hidden) black.hidden = true;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(k) >= 0) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(k) >= 0) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
  });

  // слайд 3: сценарии по очереди, карточка сценария горит, пока идёт его ролик
  var CLIPS = ['media/sc1.mp4', 'media/sc2.mp4', 'media/sc3.mp4'], scen = [].slice.call(document.querySelectorAll('.scen li')), now = 0;
  function clip(n) {
    now = n;
    if (demo.getAttribute('src') !== CLIPS[n]) demo.src = CLIPS[n];
    demo.currentTime = 0;
    demo.play().catch(function () {});
    scen.forEach(function (li) { li.classList.toggle('on', li.dataset.v === String(n)); });
  }
  // музыка на всю презентацию — «ритм без мелодии» из нашей папки петлёй. Браузер не даёт звук без действия
  // человека, поэтому она начинается с первого нажатия кликера или щелчка; на чёрном экране — пауза
  var music = document.getElementById('music');
  ['keydown', 'pointerdown'].forEach(function (t) {
    addEventListener(t, function () { if (music.paused && black.hidden) music.play().catch(function () {}); });
  });
  new MutationObserver(function () { if (black.hidden) music.play().catch(function () {}); else music.pause(); }).observe(black, { attributes: true, attributeFilter: ['hidden'] });
  demo.addEventListener('ended', function () { clip((now + 1) % CLIPS.length); });
  scen.forEach(function (li) { if (li.dataset.v) li.addEventListener('click', function () { clip(+li.dataset.v); }); });
  demo.addEventListener('click', function () { if (demo.paused) demo.play(); else demo.pause(); });

  var hideT;
  addEventListener('mousemove', function () {
    document.body.classList.add('mouse');
    clearTimeout(hideT); hideT = setTimeout(function () { document.body.classList.remove('mouse'); }, 1500);
  });
  addEventListener('resize', fit);
  fit();
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
