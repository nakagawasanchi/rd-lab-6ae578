/* 共通：保存・レベル・画像フォールバック。localStorageは失敗しても動く */
(function(){
  var KEY = 'shuri_s5_v1';
  var mem = { read: {} };
  var D = window.S5 || { areas: [], eps: [] };
  var ROOT = (document.body && document.body.getAttribute('data-root')) || '';

  function load(){
    try {
      var r = localStorage.getItem(KEY);
      if (r) { var o = JSON.parse(r); if (o && o.read) { mem = o; } }
    } catch (e) {}
    return mem;
  }
  function save(d){
    mem = d;
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }
  function readCount(d){ return Object.keys((d || load()).read).length; }
  function level(d){ return 1 + readCount(d); }
  var RANKS = [
    [0, '見習い冒険者'], [3, '駆け出しクリエイター'], [7, 'ネタ探しの旅人'],
    [11, '宿の常連冒険者'], [15, '腕利きクリエイター'], [19, '一人前まであと少し'],
    [22, 'プロインフルエンサー']
  ];
  function rank(n){
    var r = RANKS[0][1];
    for (var i = 0; i < RANKS.length; i++) { if (n >= RANKS[i][0]) r = RANKS[i][1]; }
    return r;
  }
  function epById(id){
    for (var i = 0; i < D.eps.length; i++) if (D.eps[i].id === id) return D.eps[i];
    return null;
  }
  function areaById(id){
    for (var i = 0; i < D.areas.length; i++) if (D.areas[i].id === id) return D.areas[i];
    return null;
  }
  function reset(){ save({ read: {} }); }

  /* 画像：候補を順に試し、全部失敗したらプレースホルダー表示 */
  var bad = {};
  function setPortrait(box, list){
    var img = box.querySelector('img');
    var cand = list.filter(function(s){ return !bad[s]; });
    function next(){
      var s = cand.shift();
      if (!s) { box.classList.add('noimg'); return; }
      box.classList.remove('noimg');
      img.onerror = function(){ bad[s] = 1; next(); };
      img.src = s;
    }
    next();
  }
  var EMOJI = { scroll: '📜', camera: '📷', chest: '🧰', potion: '🧪' };
  function iconNode(kind){
    var wrap = document.createElement('div');
    wrap.className = 'ic';
    var im = document.createElement('img');
    im.alt = '';
    im.onerror = function(){ wrap.textContent = EMOJI[kind] || '⭐'; };
    im.src = ROOT + 'img/item_' + kind + '.png';
    wrap.appendChild(im);
    return wrap;
  }

  window.S5app = {
    ROOT: ROOT, load: load, save: save, readCount: readCount, level: level,
    rank: rank, epById: epById, areaById: areaById, reset: reset,
    setPortrait: setPortrait, iconNode: iconNode, data: D
  };
})();
