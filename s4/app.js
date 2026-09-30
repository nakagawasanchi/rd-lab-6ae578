(function(){
  var p=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('nav.tabs a').forEach(function(a){if(a.getAttribute('href')===p)a.classList.add('on')});
  window.copyText=function(id,btn){
    var el=document.getElementById(id),t=el.innerText;
    function done(){var o=btn.textContent;btn.textContent='コピーしました';setTimeout(function(){btn.textContent=o},1800)}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,fb)}else fb();
    function fb(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy');done()}catch(e){}s.removeAllRanges()}
  };
  // ロールプレイ：下書き保存と進捗
  var tas=document.querySelectorAll('textarea[data-k]');
  function prog(){
    var bar=document.getElementById('progbar'),lab=document.getElementById('proglab');if(!bar)return;
    var all=document.querySelectorAll('details.model'),n=0;all.forEach(function(d){if(d.open)n++});
    bar.style.width=(all.length?n/all.length*100:0)+'%';lab.textContent=n+' / '+all.length+' 題で模範解答を確認';
    all.forEach(function(d){var q=d.closest('.case');if(!q)return;var c=document.querySelector('#chips a[data-q="'+q.id+'"]');if(c)c.classList.toggle('done',d.open)});
  }
  tas.forEach(function(t){
    try{t.value=localStorage.getItem('s4_'+t.dataset.k)||''}catch(e){}
    t.addEventListener('input',function(){try{localStorage.setItem('s4_'+t.dataset.k,t.value)}catch(e){}});
  });
  document.querySelectorAll('details.model').forEach(function(d){d.addEventListener('toggle',prog)});
  prog();
})();
