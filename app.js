(function () {
  var S = window.SITE || {};

  if (S.metrikaId) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(S.metrikaId,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  if (S.vkPixelId) {
    var _tmr = window._tmr || (window._tmr = []);
    _tmr.push({id: S.vkPixelId, type: 'pageView', start: Date.now()});
    var t = document.createElement('script'); t.async = true; t.src = 'https://top-fwz1.mail.ru/js/code.js'; document.head.appendChild(t);
  }
  function goal(name) {
    try { if (S.metrikaId && window.ym) ym(S.metrikaId, 'reachGoal', name); } catch (e) {}
    try { if (S.vkPixelId) (window._tmr = window._tmr || []).push({type: 'reachGoal', id: S.vkPixelId, goal: name}); } catch (e) {}
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-goal]'); if (a) goal(a.getAttribute('data-goal')); });

  document.querySelectorAll('.js-tg').forEach(function (a) { a.href = S.telegram; });
  var mx = document.querySelector('.js-mx');
  document.querySelectorAll('.js-max').forEach(function (a) {
    if (S.max) { a.href = S.max; return; }
    a.removeAttribute('target');
    a.addEventListener('click', function (e) { e.preventDefault(); if (mx.showModal) mx.showModal(); else location.href = 'tel:' + S.phone; });
  });
  document.querySelector('.js-mx-close').addEventListener('click', function () { mx.close(); });
  mx.addEventListener('click', function (e) { if (e.target === mx) mx.close(); });
  document.querySelector('.js-mx-copy').addEventListener('click', function () {
    var b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(S.phone) : Promise.reject()).then(function () { b.textContent = 'Скопировано ✓'; }, function () { b.textContent = S.phone; });
    setTimeout(function () { b.textContent = 'Скопировать'; }, 2500);
  });

  var qs = new URLSearchParams(location.search), utm = {};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (k) { if (qs.get(k)) utm[k] = qs.get(k); });
  try {
    if (Object.keys(utm).length) sessionStorage.setItem('lp_utm', JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem('lp_utm') || '{}');
  } catch (e) {}

  /* ---------- карта ---------- */
  function R(x1, y1, x2, y2) { return [[x1,y1],[x2,y1],[x2,y2],[x1,y2]]; }
  // координаты по схеме межевания (812 x 1478)
  var LOTS = [
    {n:314, a:5150, line:2, p:R(207,8,518,118)},
    {n:320, a:5171, line:2, p:R(207,118,518,230)},
    {n:321, a:5294, line:2, p:R(207,230,518,345)},
    {n:322, a:5252, line:2, p:R(207,345,518,458)},
    {n:323, a:5168, line:2, p:R(207,458,518,567)},
    {n:326, a:6990, line:2, p:R(550,8,775,217)},
    {n:327, a:5077, line:2, p:R(550,217,775,371)},
    {n:315, a:5063, line:2, p:R(550,371,775,524)},
    {n:316, a:4962, line:2, p:R(550,524,775,676)},
    {n:317, a:5054, line:2, p:R(550,676,775,829)},
    {n:318, a:5034, line:2, p:R(550,829,775,983)},
    {n:319, a:4996, line:2, p:R(550,983,775,1137)},
    {n:308, a:9797, line:1, p:R(550,1137,775,1445), price:300000},
    {n:313, a:2500, line:1, p:R(378,1283,488,1440)}
  ];
  var OTHER = [
    {t:'№324', s:'не продаётся', cls:'ln', p:[[198,567],[518,567],[518,1440],[488,1440],[488,1283],[270,1283],[270,1160],[32,1160],[40,753]], c:[300,900]},
    {t:'Проезд', cls:'ln', p:R(518,8,550,1440), road:true},
    {t:'№306', s:'продан', cls:'lx', p:R(270,1283,378,1440)},
    {t:'Продан', cls:'lx', p:R(10,1160,270,1472)}
  ];
  LOTS.forEach(function (l) { l.price = l.price || 250000; l.sot = l.a / 100; l.cost = l.sot * l.price; });

  var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU').replace(/[\u00a0\u202f,]/g, ' '); };
  var mln = function (n) { return (n / 1e6).toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' млн ₽'; };
  var disc = function (sot) { return sot >= 500 ? 0.108 : sot >= 200 ? 0.08 : sot >= 101 ? 0.05 : 0; };
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.querySelector('.js-svg'), tip = document.querySelector('.js-tip'), mapEl = document.getElementById('map');
  var mq = window.matchMedia('(max-width:1180px)');
  var vertNow = null;
  var sel = {};

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function draw() {
    var col = mapEl.clientWidth, hgt = mapEl.clientHeight;
    var vert = col < 760;
    if (vert === vertNow) return;
    vertNow = vert;
    var tr = vert ? function (pt) { return pt; } : function (pt) { return [pt[1], 812 - pt[0]]; };
    svg.setAttribute('viewBox', vert ? '0 0 812 1480' : '0 2 1480 806');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = '';
    function shape(g, pts) {
      var q = pts.map(tr);
      el('path', {d: 'M' + q.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + 'Z'}, g);
      var xs = q.map(function (p) { return p[0]; }), ys = q.map(function (p) { return p[1]; });
      return {x: (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, y: (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2,
        w: Math.max.apply(0, xs) - Math.min.apply(0, xs), h: Math.max.apply(0, ys) - Math.min.apply(0, ys)};
    }
    function label(g, c, a, b, big) {
      var t1 = el('text', {x: c.x, y: b ? c.y - 4 : c.y + 8, 'text-anchor': 'middle', 'font-size': big, 'font-weight': 600, 'font-family': 'Golos Text, sans-serif'}, g);
      t1.textContent = a;
      if (b) { var t2 = el('text', {x: c.x, y: c.y + big * 0.8, 'text-anchor': 'middle', 'font-size': Math.round(big * (vertNow ? 0.74 : 0.8)), 'font-family': 'Golos Text, sans-serif'}, g); t2.textContent = b; }
    }
    OTHER.forEach(function (o) {
      var g = el('g', {'class': o.cls}, svg);
      var c = shape(g, o.p);
      if (o.c) { var cc = tr(o.c); c.x = cc[0]; c.y = cc[1]; }
      if (o.road) {
        var t = el('text', {x: c.x, y: c.y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 18, 'letter-spacing': 6, 'font-family': 'Golos Text, sans-serif', transform: vert ? 'rotate(-90 ' + c.x + ' ' + c.y + ')' : ''}, g);
        t.textContent = 'ПРОЕЗД · №325';
      } else label(g, c, o.t, o.s, o.s ? 26 : 26);
    });
    LOTS.forEach(function (l) {
      var g = el('g', {'class': 'lp' + (sel[l.n] ? ' on' : ''), tabindex: 0, role: 'button', 'data-n': l.n, 'aria-label': 'Участок ' + l.n + ', ' + fmt(l.a) + ' м², ' + mln(l.cost)}, svg);
      var c = shape(g, l.p);
      var big = vert ? Math.min(44, c.h * 0.36) : Math.min(34, Math.min(c.w, c.h * 1.6) * 0.28);
      label(g, c, '№' + l.n, fmt(l.a) + ' м²', Math.max(24, Math.round(big)));
    });
  }
  draw();
  (mq.addEventListener ? mq.addEventListener('change', draw) : mq.addListener(draw));
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 120); });

  var listEl = document.querySelector('.js-list'), sortK = 'n', sortD = 1;
  function drawList() {
    var rows = LOTS.slice().sort(function (a, b) { return (a[sortK] - b[sortK]) * sortD; });
    var arr = function (k) { return sortK === k ? (sortD > 0 ? '↑' : '↓') : ''; };
    listEl.innerHTML = '<table><thead><tr>' +
      '<th><button type="button" data-k="n">Участок ' + arr('n') + '</button></th>' +
      '<th class="c-line">Линия</th>' +
      '<th><button type="button" data-k="a">Площадь ' + arr('a') + '</button></th>' +
      '<th><button type="button" data-k="cost">Цена ' + arr('cost') + '</button></th><th></th></tr></thead><tbody>' +
      rows.map(function (l) {
        return '<tr class="' + (sel[l.n] ? 'on' : '') + '" data-n="' + l.n + '"><td><b>№' + l.n + '</b></td>' +
          '<td class="c-line">' + (l.line === 1 ? '<span class="t1">1-я линия</span>' : '<span class="t2">2-я линия</span>') + '</td>' +
          '<td>' + fmt(l.a) + ' м²<br><span class="t2">' + l.sot.toLocaleString('ru-RU') + ' сот.</span></td>' +
          '<td><b>' + mln(l.cost) + '</b></td>' +
          '<td style="text-align:right"><button type="button" class="add" aria-label="' + (sel[l.n] ? 'Убрать' : 'Добавить') + ' №' + l.n + '">' + (sel[l.n] ? '✓' : '+') + '</button></td></tr>';
      }).join('') + '</tbody></table>';
  }
  listEl.addEventListener('click', function (e) {
    var s = e.target.closest('th button');
    if (s) { var k = s.getAttribute('data-k'); if (sortK === k) sortD = -sortD; else { sortK = k; sortD = 1; } drawList(); return; }
    var tr = e.target.closest('tr[data-n]'); if (tr) toggle(tr.getAttribute('data-n'));
  });
  document.querySelectorAll('.js-view').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-v');
      document.querySelectorAll('.js-view').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelector('.map-svg').hidden = v !== 'map';
      listEl.hidden = v !== 'list';
      document.querySelector('.js-mhint').textContent = v === 'map' ? 'Нажмите на участок, чтобы добавить его в расчёт' : 'Нажмите на строку, чтобы добавить участок в расчёт. Сортировка - по заголовкам';
      tip.classList.remove('show');
      goal('view_' + v);
    });
  });
  function lotBy(n) { return LOTS.filter(function (l) { return String(l.n) === String(n); })[0]; }
  function toggle(n) { if (sel[n]) delete sel[n]; else sel[n] = 1; update(); goal('lot_pick'); }
  svg.addEventListener('click', function (e) { var g = e.target.closest('.lp'); if (g) toggle(g.getAttribute('data-n')); });
  svg.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var g = e.target.closest('.lp'); if (g) { e.preventDefault(); toggle(g.getAttribute('data-n')); }
  });
  svg.addEventListener('mousemove', function (e) {
    var g = e.target.closest('.lp');
    if (!g) { tip.classList.remove('show'); return; }
    var l = lotBy(g.getAttribute('data-n')), r = mapEl.getBoundingClientRect();
    tip.innerHTML = '<b>№' + l.n + '</b> · ' + l.line + '-я линия<br>' + fmt(l.a) + ' м² · ' + mln(l.cost) + '<br><span style="color:#ff9b63">' + (sel[l.n] ? 'Нажмите, чтобы убрать' : 'Нажмите, чтобы добавить') + '</span>';
    tip.style.left = Math.min(Math.max(e.clientX - r.left, 110), r.width - 110) + 'px';
    tip.style.top = (e.clientY - r.top) + 'px';
    tip.classList.add('show');
  });
  svg.addEventListener('mouseleave', function () { tip.classList.remove('show'); });

  var $ = function (s) { return document.querySelector(s); };
  var mainBtn = $('.js-main-btn'), lotInput = $('.js-lot'), mbar = $('.js-mbar');
  function update() {
    drawList();
    svg.querySelectorAll('.lp').forEach(function (g) { g.classList.toggle('on', !!sel[g.getAttribute('data-n')]); });
    var list = LOTS.filter(function (l) { return sel[l.n]; });
    var has = list.length > 0;
    $('.js-empty').hidden = has; $('.js-sel').hidden = !has; $('.js-clear').hidden = !has;
    mbar.classList.toggle('has', has);
    if (!has) {
      mainBtn.textContent = 'Получить презентацию участков';
      lotInput.value = 'Общий запрос: презентация всего массива';
      return;
    }
    var area = 0, base = 0;
    list.forEach(function (l) { area += l.a; base += l.cost; });
    var sot = area / 100, d = disc(sot), total = base * (1 - d);
    $('.js-chips').innerHTML = list.map(function (l) { return '<button type="button" class="chip" data-n="' + l.n + '" aria-label="Убрать №' + l.n + '">№' + l.n + '<span>×</span></button>'; }).join('');
    $('.js-sum').textContent = mln(total);
    $('.js-old').textContent = d ? mln(base) : '';
    $('.js-meta').textContent = list.length + ' уч. · ' + sot.toLocaleString('ru-RU', {maximumFractionDigits: 2}) + ' сот.' + (d ? ' · скидка ' + String(d * 100).replace('.', ',') + '%, экономия ' + mln(base - total) : '');
    $('.js-bar').style.width = Math.min(100, sot / 755 * 100) + '%';
    $('.js-hint').textContent = sot < 101 ? 'Добавьте ещё ' + Math.ceil(101 - sot) + ' сот. и получите скидку 5%' :
      sot < 200 ? 'Ещё ' + Math.ceil(200 - sot) + ' сот. до скидки 8%' :
      sot < 500 ? 'Ещё ' + Math.ceil(500 - sot) + ' сот. до скидки 10,8%' : 'У вас максимальная скидка 10,8%';
    mainBtn.textContent = 'Получить документы на ' + (list.length === 1 ? 'участок' : 'участки');
    lotInput.value = 'Участки №' + list.map(function (l) { return l.n; }).join(', №') + ' (' + fmt(area) + ' м²), расчёт ' + mln(total) + (d ? ' со скидкой ' + String(d * 100).replace('.', ',') + '%' : '');
    $('.js-mb-t').textContent = list.length + ' уч. · ' + mln(total);
  }
  $('.js-chips').addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (c) toggle(c.getAttribute('data-n')); });
  $('.js-clear').addEventListener('click', function () { sel = {}; update(); });
  $('.js-mb-sel').addEventListener('click', function () {
    var p = document.querySelector('.p-sel');
    window.scrollTo({top: p.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth'});
    setTimeout(function () { $('.js-main-form input[name=phone]').focus({preventScroll: true}); }, 600);
  });
  update();

  /* ---------- окно заявки ---------- */
  var rq = document.querySelector('.js-rq');
  document.querySelectorAll('.js-req').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = rq.querySelector('form');
      if (f.classList.contains('sent')) f.classList.remove('sent');
      var any = Object.keys(sel).length;
      rq.querySelector('.js-rq-lot').value = any ? lotInput.value : '';
      if (rq.showModal) rq.showModal(); else location.href = '#contact';
      setTimeout(function () { f.phone.focus(); }, 50);
      goal('req_open');
    });
  });
  document.querySelector('.js-rq-close').addEventListener('click', function () { rq.close(); });
  rq.addEventListener('click', function (e) { if (e.target === rq) rq.close(); });

  /* ---------- телефон ---------- */
  document.querySelectorAll('input[type=tel]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var d = inp.value.replace(/\D/g, '');
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d && d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var r = d ? '+7' : '';
      if (d.length > 1) r += ' ' + d.slice(1, 4);
      if (d.length > 4) r += ' ' + d.slice(4, 7);
      if (d.length > 7) r += '-' + d.slice(7, 9);
      if (d.length > 9) r += '-' + d.slice(9, 11);
      inp.value = r;
    });
  });

  /* ---------- отправка: Telegram-бот + почта ---------- */
  function sendTg(text) {
    if (!S.tgBotToken || !S.tgChatId) return Promise.reject();
    return fetch('https://api.telegram.org/bot' + S.tgBotToken + '/sendMessage', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({chat_id: S.tgChatId, text: text})
    }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw 0; });
  }
  function sendMail(data) {
    return fetch('https://formsubmit.co/ajax/' + S.email, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (String(j.success) !== 'true') { console.warn('FormSubmit:', j.message || j); throw 0; }
    }).catch(function (e) { return sendMailFallback(data).then(function () { throw e; }); });
  }
  // запасной путь: обычная отправка формы в скрытый iframe (не зависит от CORS)
  function sendMailFallback(data) {
    return new Promise(function (res) {
      var fr = document.createElement('iframe'); fr.name = 'fs' + Date.now(); fr.style.display = 'none'; document.body.appendChild(fr);
      var f = document.createElement('form'); f.method = 'POST'; f.action = 'https://formsubmit.co/' + S.email; f.target = fr.name; f.style.display = 'none';
      Object.keys(data).forEach(function (k) { var i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = data[k]; f.appendChild(i); });
      document.body.appendChild(f); f.submit(); setTimeout(res, 1500);
    });
  }
  document.querySelectorAll('.js-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.js-msg'), btn = form.querySelector('button[type=submit]'), label = btn.textContent;
      var phone = form.phone.value.replace(/\D/g, '');
      msg.textContent = '';
      if (phone.length !== 11) { msg.textContent = 'Укажите номер телефона полностью.'; form.phone.focus(); return; }
      if (!form.agree.checked) { msg.textContent = 'Нужно согласие на обработку данных.'; return; }
      var ch = (form.querySelector('input[name=channel]:checked') || {}).value || '';
      var name = form.name && form.name.value ? form.name.value.trim() : '';
      var lot = form.lot ? form.lot.value : '';
      var src = Object.keys(utm).map(function (k) { return k + '=' + utm[k]; }).join(', ');
      var text = 'Заявка с сайта участков\nТелефон: ' + form.phone.value + (name ? '\nИмя: ' + name : '') +
        '\nСвязаться: ' + ch + '\nИнтересует: ' + lot + (src ? '\nИсточник: ' + src : '');
      var data = {_subject: 'Заявка: участки Верхняя Подстепновка', _template: 'table', _captcha: 'false',
        'Телефон': form.phone.value, 'Имя': name, 'Связаться': ch, 'Интересует': lot, 'Источник': src || '-'};
      btn.disabled = true; btn.textContent = 'Отправляем…';
      var a = sendTg(text).then(function () { return 1; }, function () { return 0; });
      var b = sendMail(data).then(function () { return 1; }, function () { return 0; });
      Promise.all([a, b]).then(function (r) {
        btn.disabled = false; btn.textContent = label;
        if (r[0] || r[1]) { form.classList.add('sent'); goal('lead'); }
        else msg.innerHTML = 'Не удалось отправить. Позвоните: <a href="tel:' + S.phone + '" style="text-decoration:underline">' + S.phoneText + '</a> или напишите в <a href="' + S.telegram + '" target="_blank" style="text-decoration:underline">Telegram</a>.';
      });
    });
  });
})();
