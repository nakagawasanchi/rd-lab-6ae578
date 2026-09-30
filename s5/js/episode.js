/* 話ページ：会話の再生・持ち帰りアイテム・レベルアップ演出 */
(function(){
  var A = window.S5app, D = A.data, ROOT = A.ROOT;
  function $(id){ return document.getElementById(id); }
  var epId = document.body.getAttribute('data-ep');
  var meta = A.epById(epId);
  var area = A.areaById(meta.area);
  var data = JSON.parse($('ep-data').textContent);

  var pHero = $('p-hero'), pShuri = $('p-shuri');
  var dialog = $('dialog'), nameEl = $('name'), textEl = $('text'), nextEl = $('next');
  var choicesEl = $('choices'), prevBtn = $('prev'), bar = $('bar');

  /* 会話キュー（選択肢の返事は途中に差し込む） */
  var flat = data.lines.map(function(l){
    return l.w === '?' ? { k: 'choice', done: false, opts: data.choice } : { k: 'line', w: l.w, f: l.f, t: l.t };
  });
  var idx = 0, typing = false, timer = null, cur = null, inItems = false;

  function expr(who, upto){
    var e = '';
    for (var i = 0; i <= upto; i++) {
      var l = flat[i];
      if (l.k === 'line' && l.w === who) e = l.f;
    }
    return e;
  }
  function portraitList(who, e){
    var base = ROOT + 'img/' + (who === 'h' ? 'hero' : 'shuri');
    var list = [];
    if (e) list.push(base + '_' + e + '.png');
    list.push(base + '.png');
    return list;
  }
  var lastHeroKey = '', lastShuriKey = '';
  function setFaces(upto){
    var he = expr('h', upto), se = expr('s', upto);
    var hk = 'h' + he, sk = 's' + se;
    if (hk !== lastHeroKey) { A.setPortrait(pHero, portraitList('h', he)); lastHeroKey = hk; }
    if (sk !== lastShuriKey) { A.setPortrait(pShuri, portraitList('s', se)); lastShuriKey = sk; }
  }

  function stopType(){ if (timer) { clearInterval(timer); timer = null; } typing = false; }
  function finishType(){
    stopType();
    textEl.textContent = cur ? cur.t : '';
    nextEl.style.visibility = 'visible';
  }
  function typeText(t){
    stopType();
    var chars = Array.from(t), i = 0;
    typing = true;
    textEl.textContent = '';
    nextEl.style.visibility = 'hidden';
    timer = setInterval(function(){
      i++;
      textEl.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) finishType();
    }, 32);
  }

  function setSpeaker(w){
    pHero.classList.toggle('dim', w !== 'h');
    pShuri.classList.toggle('dim', w !== 's');
    var box = w === 'h' ? pHero : (w === 's' ? pShuri : null);
    if (box) { box.classList.remove('talk'); void box.offsetWidth; box.classList.add('talk'); }
  }

  function show(i){
    idx = i;
    var e = flat[idx];
    choicesEl.innerHTML = '';
    choicesEl.classList.add('hidden');
    bar.style.width = Math.min(100, Math.round((idx + 1) / flat.length * 100)) + '%';
    prevBtn.disabled = idx === 0;
    if (e.k === 'choice') {
      setFaces(idx);
      setSpeaker('h');
      cur = null;
      nameEl.className = 'name h'; nameEl.textContent = '冒険者さん';
      textEl.className = 'narr';
      stopType();
      textEl.textContent = '（どうしよう…）';
      nextEl.style.visibility = 'hidden';
      choicesEl.classList.remove('hidden');
      e.opts.forEach(function(o){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'choice';
        b.textContent = o.label;
        b.onclick = function(ev){
          ev.stopPropagation();
          e.done = true;
          var ins = (o.reply || []).map(function(r){ return { k: 'line', w: r.w, f: r.f, t: r.t }; });
          Array.prototype.splice.apply(flat, [idx + 1, 0].concat(ins));
          show(idx + 1);
        };
        choicesEl.appendChild(b);
      });
      return;
    }
    cur = e;
    setFaces(idx);
    setSpeaker(e.w);
    nameEl.className = 'name ' + e.w;
    nameEl.textContent = e.w === 's' ? 'しゅり' : (e.w === 'h' ? '冒険者さん' : '');
    textEl.className = e.w === 'n' ? 'narr' : '';
    typeText(e.t);
  }

  function advance(){
    if (inItems) return;
    if (typing) { finishType(); return; }
    var e = flat[idx];
    if (e.k === 'choice') return;
    var n = idx + 1;
    while (n < flat.length && flat[n].k === 'choice' && flat[n].done) n++;
    if (n >= flat.length) { showItems(); return; }
    show(n);
  }
  function back(){
    if (inItems) return;
    var n = idx - 1;
    while (n > 0 && flat[n].k === 'choice') n--;
    if (n < 0) return;
    show(n);
  }

  /* 持ち帰りアイテム */
  function showItems(){
    inItems = true;
    stopType();
    dialog.classList.add('hidden');
    pHero.classList.remove('dim'); pShuri.classList.remove('dim');
    A.setPortrait(pHero, portraitList('h', 'happy')); lastHeroKey = 'hhappy';
    A.setPortrait(pShuri, portraitList('s', 'smile')); lastShuriKey = 'ssmile';
    bar.style.width = '100%';
    var box = $('items'), list = $('itemlist');
    list.innerHTML = '';
    data.items.forEach(function(it){
      var row = document.createElement('div');
      row.className = 'item';
      row.appendChild(A.iconNode(area.icon));
      var tx = document.createElement('div');
      var b = document.createElement('b'); b.textContent = it.name;
      var s = document.createElement('span'); s.textContent = it.desc;
      tx.appendChild(b); tx.appendChild(s);
      row.appendChild(tx);
      list.appendChild(row);
    });
    box.classList.remove('hidden');
  }

  /* 宿で休む → レベルアップ */
  function rest(){
    var st = A.load();
    var already = !!st.read[epId];
    var beforeN = A.readCount(st), before = A.level(st);
    if (!already) { st.read[epId] = Date.now(); A.save(st); }
    var afterN = A.readCount(st), after = A.level(st);
    var total = D.eps.length;

    var lu = $('lu');
    lu.classList.remove('hidden');
    setTimeout(function(){ $('zz').classList.add('on'); }, 500);

    $('lu-old').textContent = before;
    $('lu-new').textContent = after;
    if (already) {
      $('lu-h').textContent = 'ぐっすり眠った！';
      $('lu-h').style.fontSize = '30px';
      $('lu-line').innerHTML = 'Lv.<span class="new">' + after + '</span>';
      $('lu-learned-s').textContent = 'この話のスキルは、もう覚えているよ';
    } else {
      $('lu-learned-s').textContent = '新しいスキルを覚えた！';
    }
    $('lu-skill').textContent = meta.skill;
    var r0 = A.rank(beforeN), r1 = A.rank(afterN);
    $('lu-rank').textContent = (r0 !== r1 ? '称号が上がった！　' : '称号：') + r1;
    if (afterN >= total && !already) $('lu-clear').textContent = '全部の話をクリア！ 立派なプロインフルエンサーだね！';

    var idn = D.eps.map(function(e){ return e.id; }).indexOf(epId);
    var nx = D.eps[idn + 1];
    var act = $('lu-actions');
    act.innerHTML = '';
    if (nx) {
      var a1 = document.createElement('a');
      a1.className = 'btn'; a1.href = nx.id + '.html'; a1.textContent = '▶ 次の話へ';
      act.appendChild(a1);
    }
    var a2 = document.createElement('a');
    a2.className = 'btn sub'; a2.href = '../map.html#' + meta.area; a2.textContent = '冒険マップへ';
    act.appendChild(a2);
    var a3 = document.createElement('a');
    a3.className = 'btn sub small'; a3.href = '../index.html'; a3.textContent = '宿の入口へ';
    act.appendChild(a3);

    setTimeout(function(){
      $('zz').classList.remove('on');
      $('lu-stage').classList.add('on');
      if (!already) burst();
    }, 2200);
  }

  function burst(){
    var box = $('stars');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    for (var i = 0; i < 36; i++) {
      var s = document.createElement('i');
      s.className = 'star';
      s.textContent = i % 3 ? '★' : '✦';
      var ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
      s.style.setProperty('--dx', Math.round(Math.cos(ang) * dist) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(ang) * dist) + 'px');
      s.style.setProperty('--d', (Math.random() * 0.8).toFixed(2) + 's');
      s.style.setProperty('--s', (14 + Math.random() * 18).toFixed(0) + 'px');
      box.appendChild(s);
    }
  }

  /* バッジ画像のフォールバック */
  var badgeImg = $('lu-badge-img');
  badgeImg.onerror = function(){ badgeImg.parentNode.textContent = '⭐'; };
  badgeImg.src = ROOT + 'img/levelup.png';

  /* 入力 */
  dialog.addEventListener('click', function(ev){
    if (ev.target.closest('button')) return;
    advance();
  });
  $('stage').addEventListener('click', advance);
  prevBtn.addEventListener('click', function(ev){ ev.stopPropagation(); back(); });
  $('restbtn').addEventListener('click', rest);
  document.addEventListener('keydown', function(ev){
    if (ev.key === ' ' || ev.key === 'Enter') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      ev.preventDefault(); advance();
    }
  });

  $('chip').textContent = area.name + 'より帰還';
  $('place').textContent = area.name;
  document.title = '「' + meta.title + '」｜宿屋しゅりの冒険者育成';
  show(0);
})();
