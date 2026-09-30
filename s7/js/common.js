// s7 試作サイト共通スクリプト（ダミーの状態管理のみ・localStorage）
(function(){
  function key(k){ return "s7_" + k; }

  window.s7Like = function(btn, id, base){
    var k = key("like_" + id);
    var on = localStorage.getItem(k) === "1";
    on = !on;
    localStorage.setItem(k, on ? "1" : "0");
    var count = base + (on ? 1 : 0);
    btn.classList.toggle("on", on);
    var cEl = btn.querySelector(".c");
    if (cEl) cEl.textContent = count;
  };

  window.s7InitLike = function(btn, id, base){
    var k = key("like_" + id);
    var on = localStorage.getItem(k) === "1";
    btn.classList.toggle("on", on);
    var cEl = btn.querySelector(".c");
    if (cEl) cEl.textContent = base + (on ? 1 : 0);
  };

  window.s7Copy = function(btn){
    var pre = btn.closest(".tmpl").querySelector("pre");
    var text = pre ? pre.textContent : "";
    var done = function(){
      var orig = btn.textContent;
      btn.textContent = "コピーしました";
      btn.classList.add("copied");
      setTimeout(function(){ btn.textContent = orig; btn.classList.remove("copied"); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      done();
    }
  };

  window.s7Support = function(btn){
    var orig = btn.textContent;
    btn.textContent = "ありがとうございます！（試作のため決済はできません）";
    btn.disabled = true;
    setTimeout(function(){ btn.textContent = orig; btn.disabled = false; }, 2400);
  };

  window.s7AddComment = function(formEl, listSel){
    var input = formEl.querySelector("input");
    var v = (input.value || "").trim();
    if (!v) return false;
    var list = document.querySelector(listSel);
    var item = document.createElement("div");
    item.className = "c-item";
    item.innerHTML = '<div class="c-avatar">🙂</div><div class="c-body"><div class="c-name">あなた</div><div class="c-text"></div></div>';
    item.querySelector(".c-text").textContent = v;
    list.appendChild(item);
    input.value = "";
    return false;
  };
})();
