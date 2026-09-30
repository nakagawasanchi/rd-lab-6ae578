(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function toast(m){var t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},1400)}
var page=document.body.getAttribute('data-page');

if(page==='checklist'){
  var KEY='s1_checklist_v1',state={};
  try{state=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){state={}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  var root=$('#list'),total=0;
  CHECKLIST.forEach(function(s,si){
    var sec=document.createElement('div');sec.className='sect';sec.dataset.si=si;
    var h='<header><span>'+(si+1)+'. '+esc(s[0])+' <small>'+esc(s[1])+'</small></span><small class="cnt"></small></header><div class="items">';
    s[3].forEach(function(it,ii){
      total++;var id=si+'_'+ii;
      h+='<div class="item"><label><input type="checkbox" data-id="'+id+'"'+(state[id]?' checked':'')+'><span>'+esc(it[0])+'</span></label><details class="why"><summary></summary><div>'+esc(it[1])+'</div></details></div>';
    });
    sec.innerHTML=h+'</div>';root.appendChild(sec);
    $('header',sec).addEventListener('click',function(){var b=$('.items',sec);b.style.display=b.style.display==='none'?'':'none'});
  });
  function refresh(){
    var done=0;
    document.querySelectorAll('.sect').forEach(function(sec){
      var all=sec.querySelectorAll('input'),c=0;all.forEach(function(i){if(i.checked)c++});done+=c;
      $('.cnt',sec).textContent=c+' / '+all.length;sec.classList.toggle('done',c===all.length);
    });
    $('#pnum').textContent=done+' / '+total;$('#pbar').style.width=(total?done/total*100:0)+'%';
  }
  root.addEventListener('change',function(e){var i=e.target;if(i.dataset&&i.dataset.id){if(i.checked)state[i.dataset.id]=1;else delete state[i.dataset.id];save();refresh()}});
  $('#reset').addEventListener('click',function(){if(confirm('すべてのチェックを外しますか？')){state={};save();document.querySelectorAll('input[type=checkbox]').forEach(function(i){i.checked=false});refresh()}});
  refresh();
}

if(page==='cards'){
  var tags=['すべて'];CARDS.forEach(function(c){c.tag.split('・').forEach(function(t){if(tags.indexOf(t)<0)tags.push(t)})});
  var f=$('#filters'),g=$('#grid'),cur='すべて';
  function draw(){
    f.innerHTML=tags.map(function(t){return '<button class="chip'+(t===cur?' on':'')+'" data-t="'+esc(t)+'">'+esc(t)+'</button>'}).join('');
    g.innerHTML=CARDS.filter(function(c){return cur==='すべて'||c.tag.split('・').indexOf(cur)>=0}).map(function(c){
      return '<article class="card"><div class="head"><div class="tag">'+esc(c.tag)+'</div><h3>'+esc(c.name)+'</h3></div><div class="body"><dl><dt>使いどころ</dt><dd>'+esc(c.use)+'</dd><dt>構成</dt><dd><ol>'+c.steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol></dd><dt>例</dt><dd class="ex">'+esc(c.ex)+'</dd><dt>NG</dt><dd class="ng">'+esc(c.ng)+'</dd><dt>なぜ効く？</dt><dd>'+esc(c.why)+'</dd></dl></div></article>';
    }).join('');
  }
  f.addEventListener('click',function(e){var t=e.target.dataset&&e.target.dataset.t;if(t){cur=t;draw()}});
  draw();
}

if(page==='cases'){
  var th=['すべて'];CASES.forEach(function(c){c.themes.forEach(function(t){if(th.indexOf(t)<0)th.push(t)})});
  var ff=$('#filters'),lst=$('#cases'),ct='すべて';
  function li(a){return '<ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'}
  function draw2(){
    ff.innerHTML=th.map(function(t){return '<button class="chip'+(t===ct?' on':'')+'" data-t="'+esc(t)+'">'+esc(t)+'</button>'}).join('');
    var n=0;
    lst.innerHTML=CASES.map(function(c,i){
      if(ct!=='すべて'&&c.themes.indexOf(ct)<0)return '';n++;
      return '<div class="case" data-i="'+i+'"><header><div><h3>事例'+(i+1)+'：'+esc(c.title)+'</h3><div class="tags">'+c.themes.map(function(t){return '<span class="tg">'+esc(t)+'</span>'}).join('')+'</div></div><span class="arrow">＋</span></header><div class="cb"><div class="flow"><div class="pane sit"><h4>状況</h4>'+esc(c.sit)+'</div></div><div class="flow two"><div class="pane bef"><h4>BEFORE（要旨）</h4>'+li(c.before)+'</div><div class="pane aft"><h4>AFTER（要旨）</h4>'+li(c.after)+'</div></div><div class="flow"><div class="pane cmt"><h4>しゅりの指摘と理由</h4><ol>'+c.comments.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></div><div class="pane lrn"><h4>学び</h4>'+esc(c.learn)+'</div></div></div></div>';
    }).join('');
    $('#count').textContent=n+'件';
  }
  ff.addEventListener('click',function(e){var t=e.target.dataset&&e.target.dataset.t;if(t){ct=t;draw2()}});
  lst.addEventListener('click',function(e){var h=e.target.closest('.case>header');if(h){var c=h.parentNode;c.classList.toggle('open');$('.arrow',h).textContent=c.classList.contains('open')?'－':'＋'}});
  draw2();
}

if(page==='templates'){
  var box=$('#tpls');
  box.innerHTML=TEMPLATES.map(function(t,i){return '<div class="tpl"><header><h3>'+esc(t.title)+'</h3><button class="btn sm" data-i="'+i+'">コピー</button></header><div class="desc">'+esc(t.desc)+'</div><pre>'+esc(t.text)+'</pre></div>'}).join('');
  box.addEventListener('click',function(e){
    var b=e.target.closest('button[data-i]');if(!b)return;
    var txt=TEMPLATES[b.dataset.i].text;
    function fb(){var a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('コピーしました')}catch(x){toast('コピーできませんでした')}document.body.removeChild(a)}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast('コピーしました')},fb)}else fb();
  });
}
})();
