/* トップ・マップ */
(function(){
  var A = window.S5app, D = A.data, page = document.body.getAttribute('data-page');
  function $(id){ return document.getElementById(id); }

  if (page === 'top') {
    var st = A.load(), n = A.readCount(st), total = D.eps.length;
    $('lv').textContent = A.level(st);
    $('rank').textContent = A.rank(n);
    $('read').textContent = n + ' / ' + total + ' 話';
    $('pct').textContent = Math.round(n / total * 100) + '%';
    setTimeout(function(){ $('bar').style.width = (n / total * 100) + '%'; }, 80);
    var box = $('skills');
    var learned = D.eps.filter(function(e){ return st.read[e.id]; });
    if (!learned.length) {
      box.innerHTML = '<span class="none">まだ覚えたスキルはないよ。宿に入ってみよう！</span>';
    } else {
      learned.forEach(function(e){
        var s = document.createElement('span');
        s.className = 'skill-chip';
        s.textContent = e.skill;
        box.appendChild(s);
      });
    }
    var innImg = $('innimg');
    innImg.onerror = function(){ innImg.style.display = 'none'; $('innph').style.display = 'flex'; };
    if (innImg.complete && innImg.naturalWidth === 0) innImg.onerror();
    $('resetbtn').onclick = function(){
      if (confirm('冒険の記録（レベル・読んだ話）を消しますか？')) { A.reset(); location.reload(); }
    };
    $('enter').textContent = n ? '▶ 宿にもどる' : '▶ 宿に入る';
  }

  if (page === 'map') {
    var st2 = A.load();
    var mapbox = $('mapbox'), mapimg = $('mapimg');
    mapimg.onerror = function(){ mapimg.style.display = 'none'; mapbox.classList.add('noimg'); };
    if (mapimg.complete && mapimg.naturalWidth === 0) mapimg.onerror();
    $('lvmini').textContent = 'Lv.' + A.level(st2) + '　' + A.rank(A.readCount(st2));

    function inArea(id){ return D.eps.filter(function(e){ return e.area === id; }); }
    function firstUnreadArea(){
      for (var i = 0; i < D.areas.length; i++) {
        var l = inArea(D.areas[i].id);
        if (l.some(function(e){ return !st2.read[e.id]; })) return D.areas[i].id;
      }
      return D.areas[0].id;
    }
    var btns = {};
    D.areas.forEach(function(a){
      var list = inArea(a.id);
      var done = list.filter(function(e){ return st2.read[e.id]; }).length;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'area-btn' + (done === list.length ? ' done' : '');
      b.style.setProperty('--x', a.x + '%');
      b.style.setProperty('--y', a.y + '%');
      b.innerHTML = '<span class="em">' + a.emoji + '</span>' + a.name + '<span class="cnt">' + done + '/' + list.length + '</span>';
      b.onclick = function(){ show(a.id, true); };
      mapbox.appendChild(b);
      btns[a.id] = b;
    });
    function show(id, scroll){
      Object.keys(btns).forEach(function(k){ btns[k].classList.toggle('on', k === id); });
      var a = A.areaById(id);
      $('ap-name').textContent = a.emoji + ' ' + a.name;
      $('ap-sub').textContent = a.sub;
      var ul = $('ap-list');
      ul.innerHTML = '';
      inArea(id).forEach(function(e){
        var li = document.createElement('li');
        var isRead = !!st2.read[e.id];
        li.className = isRead ? 'read' : '';
        li.innerHTML = '<a href="episodes/' + e.id + '.html"><span class="mark">' + (isRead ? '既読' : '未読') + '</span>' +
          '<span class="t"></span></a>';
        var t = li.querySelector('.t');
        t.textContent = '「' + e.title + '」';
        var sk = document.createElement('span');
        sk.className = 'sk';
        sk.textContent = 'スキル：' + e.skill;
        t.appendChild(sk);
        ul.appendChild(li);
      });
      try { history.replaceState(null, '', '#' + id); } catch (er) {}
      if (scroll) $('areapanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    var h = (location.hash || '').replace('#', '');
    show(A.areaById(h) ? h : firstUnreadArea(), false);
  }
})();
