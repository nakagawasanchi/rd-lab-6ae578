(function(){
  var KEY='shuri_s2_read_v2';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
  var st=load();
  function mark(){
    var n=0,tot=0;
    document.querySelectorAll('[data-ch]').forEach(function(a){
      var id=a.getAttribute('data-ch');
      if(a.closest('.side')||a.closest('.toc')){
        if(a.closest('.side'))tot++;
        if(st[id]){a.classList.add('read');if(a.closest('.side'))n++}else a.classList.remove('read');
      }
    });
    var p=document.getElementById('prog'),b=document.getElementById('bar');
    if(p)p.textContent='読了 '+n+' / '+tot;
    if(b&&tot)b.style.width=(n/tot*100)+'%';
  }
  var btn=document.getElementById('readbtn');
  if(btn){
    var id=btn.getAttribute('data-ch');
    function paint(){btn.classList.toggle('done',!!st[id]);btn.textContent=st[id]?'✓ 読了しました（もう一度押すと解除）':'この章を読了にする'}
    btn.addEventListener('click',function(){st[id]=!st[id];if(!st[id])delete st[id];save(st);paint();mark()});
    paint();
  }
  document.querySelectorAll('.check input[type=checkbox]').forEach(function(c,i){
    var k='chk_'+location.pathname.split('/').pop()+'_'+i;
    c.checked=!!st[k];
    c.addEventListener('change',function(){if(c.checked)st[k]=1;else delete st[k];save(st)});
  });
  document.querySelectorAll('textarea.wk').forEach(function(t,i){
    var k='wk_'+location.pathname.split('/').pop()+'_'+i;
    if(st[k])t.value=st[k];
    t.addEventListener('input',function(){if(t.value)st[k]=t.value;else delete st[k];save(st)});
  });
  document.querySelectorAll('button.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.closest(b.getAttribute('data-copy'))||b.parentNode,txt='';
      var ta=box.querySelectorAll('textarea');
      if(ta.length){ta.forEach(function(t,i){txt+=(i+1)+'. '+t.value+'\n'})}else{var p=box.querySelector('pre');txt=p?p.textContent:box.textContent}
      function ok(){var o=b.textContent;b.textContent='コピーしました';setTimeout(function(){b.textContent=o},1500)}
      if(navigator.clipboard)navigator.clipboard.writeText(txt).then(ok,function(){});else ok();
    });
  });
  var tg=document.getElementById('menu');
  if(tg)tg.addEventListener('click',function(){document.body.classList.toggle('open')});
  var sc=document.querySelector('.scrim');
  if(sc)sc.addEventListener('click',function(){document.body.classList.remove('open')});
  mark();
})();
