/* Lume — site. Sem rastreadores, sem requisições externas. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lojas (preencher quando o app for publicado) ---------- */
  var LOJAS = { ios: 'https://apps.apple.com/app/id6828948510', android: '' };
  $$('[data-loja]').forEach(function (a) {
    var url = LOJAS[a.dataset.loja];
    if (url) { a.href = url; a.classList.remove('soon'); a.removeAttribute('aria-disabled'); a.target = '_blank'; a.rel = 'noopener'; }
    else { a.addEventListener('click', function (e) { e.preventDefault(); var f = $('#perguntas'); var q = $$('details', f)[6]; if (q) { q.open = true; f.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth' }); } }); }
  });

  /* ---------- Tema claro/escuro ---------- */
  var temaBtn = $('#tema');
  var SOL = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';
  var LUA = 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z';
  function iconeTema() { $('path', temaBtn).setAttribute('d', root.dataset.theme === 'dark' ? SOL : LUA); temaBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'); }
  iconeTema();
  temaBtn.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('lume-tema', root.dataset.theme === 'dark' ? 'escuro' : 'claro'); } catch (e) {}
    iconeTema();
  });

  /* ---------- Calendário litúrgico (cor do tempo) ---------- */
  function pascoa(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, dd = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - dd - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mes - 1, dia, 12);
  }
  function soma(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n, 12); }
  function tempoDe(hoje) {
    var t = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12).getTime(), y = hoje.getFullYear();
    var E = pascoa(y), N = function (dt) { return dt.getTime(); };
    var natal = new Date(y, 11, 25, 12), w = natal.getDay(), adv = soma(natal, -(w === 0 ? 28 : 21 + w));
    var ep = new Date(y, 0, 2, 12); while (ep.getDay() !== 0) ep = soma(ep, 1);
    var batismo = soma(ep, 7);
    if (t >= N(adv) && t < N(natal)) return N(soma(adv, 14)) === t ? { t: 'Advento · Gaudete', c: 'rosa' } : { t: 'Advento', c: 'roxo' };
    if (t >= N(natal) || t <= N(batismo)) return { t: 'Tempo do Natal', c: 'branco' };
    var cinzas = soma(E, -46), ramos = soma(E, -7), pent = soma(E, 49);
    if (t >= N(cinzas) && t < N(ramos)) return N(soma(E, -21)) === t ? { t: 'Quaresma · Laetare', c: 'rosa' } : { t: 'Quaresma', c: 'roxo' };
    if (t === N(ramos)) return { t: 'Domingo de Ramos', c: 'vermelho' };
    if (t > N(ramos) && t < N(soma(E, -3))) return { t: 'Semana Santa', c: 'roxo' };
    if (t === N(soma(E, -3))) return { t: 'Quinta-feira Santa', c: 'branco' };
    if (t === N(soma(E, -2))) return { t: 'Sexta-feira da Paixão', c: 'vermelho' };
    if (t === N(soma(E, -1))) return { t: 'Sábado Santo', c: 'roxo' };
    if (t >= N(E) && t < N(pent)) return { t: 'Tempo Pascal', c: 'branco' };
    if (t === N(pent)) return { t: 'Pentecostes', c: 'vermelho' };
    return { t: 'Tempo Comum', c: 'verde' };
  }
  var NOMES = { verde: 'verde', roxo: 'roxo', rosa: 'rosa', branco: 'branco', vermelho: 'vermelho' };
  var NOTAS = {
    verde: 'Verde, o Tempo Comum: a vida ordinária, vivida com esperança.',
    roxo: 'Roxo, Advento e Quaresma: preparar o caminho e converter-se.',
    rosa: 'Rosa, Gaudete e Laetare: a alegria que já desponta no meio da espera.',
    branco: 'Branco e dourado, Natal, Páscoa e festas: a luz que vence a noite.',
    vermelho: 'Vermelho, Pentecostes, a Paixão e os mártires: o fogo do Espírito e o amor até o fim.'
  };
  var hojeInfo = tempoDe(new Date());
  function setCor(c) {
    root.dataset.cor = c;
    $$('#swatches .sw').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
    $$('#lit .lcard').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
    $('#sw-nota').textContent = NOTAS[c];
  }
  (function () {
    var hoje = new Date(), txt = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    $('#hoje-txt').textContent = txt + ' · ' + hojeInfo.t + ' · ' + NOMES[hojeInfo.c];
    setCor(hojeInfo.c);
  })();
  $$('#swatches .sw, #lit .lcard').forEach(function (b) { b.addEventListener('click', function () { setCor(b.dataset.c); }); });

  /* ---------- Lâmpada interativa ---------- */
  var chips = $$('.chip'), lamp = $('#lamp');
  var MSG = ['A chama já está acesa: a graça chega primeiro. Cada prática acrescenta óleo.', 'Você já se abriu à graça hoje. Um passo de cada vez.', 'Você já se abriu à graça hoje. Um passo de cada vez.', 'Você já se abriu à graça hoje. Um passo de cada vez.', 'Dia entregue a Deus. Descanse em paz.'];
  function lampada() {
    var n = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).length, p = n / 4, nivel = 0.08 + 0.92 * p, dy = (1 - nivel) * 96;
    $('#lamp-luz').style.transform = 'translateY(' + dy + 'px)';
    $('#lamp-luz-top').style.transform = 'translateY(' + dy + 'px)';
    $('#lamp-halo').style.opacity = (0.3 + 0.6 * p).toFixed(2);
    $('#lamp-chama').style.setProperty('--fs', Math.min(1.22, 0.62 + 0.5 * p).toFixed(3));
    $('#m-n').textContent = n + ' de 4';
    $('#m-t').textContent = MSG[n];
    lamp.setAttribute('aria-label', 'Lâmpada com ' + n + ' de 4 práticas vividas hoje');
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); lampada(); }); });
  lampada();

  /* ---------- Cabeçalho, progresso, menu ---------- */
  var hdr = $('.hdr'), prog = $('#progress'), topo = $('#to-top'), nav = $('#nav'), burger = $('#burger');
  function rolar() {
    var y = window.scrollY, h = d.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', y > 8);
    prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ')';
    topo.classList.toggle('show', y > 900);
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  topo.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduzir ? 'auto' : 'smooth' }); });
  burger.addEventListener('click', function () { var a = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', String(a)); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });

  if ('IntersectionObserver' in window) {
    var links = {}; $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === e.target.id); }); } }); }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (k) { var s = d.getElementById(k); if (s) so.observe(s); });
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(function (el) { ro.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Tour do app ---------- */
  var tabs = $$('.tab'), panels = { hoje: $('#p-hoje'), exame: $('#p-exame'), caminhos: $('#p-caminhos'), jornada: $('#p-jornada') };
  var SHOTS = { hoje: ['captura-1', 'captura-2', 'Tela Hoje do Lume com a lâmpada no nicho, o tempo litúrgico e as práticas do dia', 'Tela da Palavra de hoje com gravura e o Evangelho'],
    caminhos: ['captura-3', 'captura-4', 'Tela Caminhos com orações para cada momento e livros', 'Tela Caminhos com novenas, trilhas guiadas e Biblioteca de santos'],
    jornada: ['captura-5', null, 'Tela Jornada com o calendário do mês e o cartão de recomeços', ''] };
  var phA = $('#ph-a'), phB = $('#ph-b'), phones = $('#phones'), exDemo = $('#exame-demo');
  function abrirTab(nome, foco) {
    tabs.forEach(function (t) { var on = t.dataset.tab === nome; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && foco) t.focus(); });
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== nome; });
    var s = SHOTS[nome];
    if (nome === 'exame') { phA.hidden = true; phB.hidden = true; exDemo.hidden = false; phones.classList.add('solo'); exame(0); return; }
    exDemo.hidden = true; phA.hidden = false; phB.hidden = !s[1]; phones.classList.toggle('solo', !s[1]);
    $('img', phA).src = 'img/app/' + s[0] + '.webp'; $('img', phA).alt = s[2];
    if (s[1]) { $('img', phB).src = 'img/app/' + s[1] + '.webp'; $('img', phB).alt = s[3]; }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { abrirTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (j > -1) { e.preventDefault(); abrirTab(tabs[j].dataset.tab, true); }
    });
  });

  /* Exame de consciência: demonstração em 5 passos (Santo Inácio) */
  var PASSOS = [
    ['Agradecer', 'Comece pelo que recebeu.', '“Hoje agradeço por…” — em poucas palavras, no seu tempo. É opcional.'],
    ['Pedir luz', 'Peça ao Espírito Santo.', 'Uma oração curta ao Espírito Santo e um instante de silêncio, antes de olhar o dia.'],
    ['Rever o dia', 'Olhe o dia com calma.', 'O propósito da manhã, com <b>Vivi</b>, <b>Em parte</b> ou <b>Esqueci</b>, mais duas perguntas do exame. Cada resposta recebe uma palavra de misericórdia, nunca de cobrança.', true],
    ['Pedir perdão', 'Entregue o que ficou.', 'Ato de contrição. E, se houver pecado grave, procure a Confissão.'],
    ['Propor', 'Olhe para amanhã.', '“Com a graça de Deus, amanhã eu…” — um propósito pequeno, se quiser.']
  ];
  function exame(i) {
    var h;
    if (i >= PASSOS.length) {
      h = '<div class="dots">' + PASSOS.map(function () { return '<i class="on"></i>'; }).join('') + '</div><div class="night"><svg viewBox="0 0 100 124" width="72" style="margin:0 auto 14px"><use href="#lampada"/></svg><small>Dia entregue a Deus</small><h4 style="font-size:2.4rem">Boa noite.</h4><p class="t" style="flex:none">Exame feito. Descanse em paz.</p></div><div class="nav2"><button type="button" class="go" data-r>Ver de novo</button></div>';
    } else {
      var p = PASSOS[i];
      h = '<div class="dots">' + PASSOS.map(function (_, k) { return '<i class="' + (k <= i ? 'on' : '') + '"></i>'; }).join('') + '</div><small>Passo ' + (i + 1) + ' de 5</small><h4>' + p[0] + '</h4><div class="t"><em>' + p[1] + '</em><p style="margin-top:12px">' + p[2] + '</p>' + (p[3] ? '<div class="opts"><span>Vivi</span><span>Em parte</span><span>Esqueci</span></div>' : '') + '</div><div class="nav2"><button type="button" data-b ' + (i === 0 ? 'disabled' : '') + '>Voltar</button><button type="button" class="go" data-n>' + (i === 4 ? 'Encerrar o dia' : 'Continuar') + '</button></div>';
    }
    exDemo.innerHTML = h; exDemo.dataset.i = i;
    var b = $('[data-b]', exDemo), n = $('[data-n]', exDemo), r = $('[data-r]', exDemo);
    if (b) b.onclick = function () { exame(i - 1); };
    if (n) n.onclick = function () { exame(i + 1); };
    if (r) r.onclick = function () { exame(0); };
  }

  /* ---------- Galeria de gravuras ---------- */
  var ARTE = window.LUME_ARTE || { cenas: [], santos: [] };
  var st = { g: $('#stage-grav'), t: $('#st-t'), s: $('#st-s'), th: $('#thumbs') }, atual = 0, interagiu = false, timer;
  function url(id) { return 'url(img/gravuras/' + id + '.webp)'; }
  ARTE.cenas.forEach(function (c, i) {
    var b = d.createElement('button'); b.type = 'button'; b.className = 'thumb'; b.style.setProperty('--img', url(c.id)); b.setAttribute('aria-label', c.titulo);
    b.addEventListener('click', function () { interagiu = true; clearInterval(timer); mostrar(i); }); st.th.appendChild(b);
  });
  function mostrar(i) {
    var c = ARTE.cenas[i]; if (!c) return; atual = i;
    st.g.classList.add('swap');
    setTimeout(function () {
      st.g.style.setProperty('--ar', c.w + '/' + c.h); st.g.style.setProperty('--img', url(c.id)); st.g.setAttribute('aria-label', 'Gravura: ' + c.titulo);
      st.t.textContent = c.titulo;
      st.s.textContent = c.refs && c.refs[0] ? c.refs[0] : '';
      st.g.classList.remove('swap');
    }, reduzir ? 0 : 220);
    $$('.thumb', st.th).forEach(function (t, k) { if (k === i) { t.setAttribute('aria-current', 'true'); var r = t.getBoundingClientRect(), pr = st.th.getBoundingClientRect(); if (r.left < pr.left || r.right > pr.right) st.th.scrollTo({ left: t.offsetLeft - st.th.clientWidth / 2 + 32, behavior: reduzir ? 'auto' : 'smooth' }); } else t.removeAttribute('aria-current'); });
  }
  if (ARTE.cenas.length) {
    mostrar(0);
    if (!reduzir && 'IntersectionObserver' in window) {
      var vis = false; new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: .3 }).observe(st.g);
      timer = setInterval(function () { if (vis && !interagiu) mostrar((atual + 1) % ARTE.cenas.length); }, 6500);
    }
  }

  /* ---------- Santos ---------- */
  var sg = $('#saints');
  ARTE.santos.forEach(function (s, i) {
    var f = d.createElement('figure'); f.className = 'saint hov rv'; f.style.setProperty('--d', ((i % 6) * 0.05) + 's');
    f.innerHTML = '<div class="grav" role="img" aria-label="' + s.titulo + '"></div><figcaption>' + s.titulo.replace(/ \(.*\)/, '') + '</figcaption>';
    var g = f.firstChild; g.style.setProperty('--ar', s.w + '/' + s.h); g.style.setProperty('--img', url(s.id));
    sg.appendChild(f); if (window.IntersectionObserver) { ro.observe(f); } else { f.classList.add('in'); }
  });

  /* ---------- Orações por momento ---------- */
  (function () {
    var h = new Date().getHours(), agora = h >= 19 || h < 4 ? 'Orações da noite' : h < 12 ? 'Ao começar o dia' : 'Orações de sempre';
    var nomes = ['Orações da noite', 'Orações de sempre', 'Ao começar o dia', 'Apostolado da Oração', 'Nossa Senhora', 'Espírito Santo e Eucaristia', 'Santos, anjos e falecidos', 'À mesa'];
    nomes.sort(function (a, b) { return (b === agora) - (a === agora); });
    $('#tiles').innerHTML = nomes.map(function (n) { return '<div class="ptile' + (n === agora ? ' now' : '') + '"><span>' + (n === agora ? '<small>Agora</small>' : '') + n + '</span></div>'; }).join('');
  })();

  /* ---------- Lume+: recursos por grupo ---------- */
  var PLUS = {
    rever: [['Histórico completo', 'além dos 90 dias gratuitos'], ['Busca no diário', 'por palavra, intenção ou santo'], ['Graças recebidas', 'com a linha do tempo de cada intenção'], ['Retrospectiva de cada tempo litúrgico', 'em tom de gratidão, só comparada com você']],
    aprofundar: [['Todas as novenas e trilhas guiadas', 'além da novena e da trilha gratuitas'], ['Livros clássicos', 'Imitação de Cristo, Confissões e História de uma Alma, um capítulo por vez'], ['A Biblioteca de santos inteira', 'fichas, momentos da vida e palavras']],
    acompanhar: [['Revisão da Regra', 'semanal e mensal: manter, aliviar ou acrescentar uma prática, sem nota'], ['Regra do tempo litúrgico', 'uma proposta para o Advento, a Quaresma e a Páscoa'], ['Evolução de longo prazo', 'sem ranking e sem nota']],
    personalizar: [['Companheiro fixado', 'um santo por uma semana ou por um tempo litúrgico'], ['Lembretes avançados', 'vários horários por prática e lembretes litúrgicos'], ['Livro do ano litúrgico em PDF', 'para guardar, imprimir ou compartilhar']]
  };
  var seg = $$('#plus-seg button'), lista = $('#plus-list');
  function plus(g) {
    seg.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.g === g)); });
    lista.innerHTML = PLUS[g].map(function (x) { return '<li><span>' + x[0] + '<small>' + x[1] + '</small></span></li>'; }).join('');
  }
  seg.forEach(function (b) { b.addEventListener('click', function () { plus(b.dataset.g); }); });
  plus('rever');
})();
