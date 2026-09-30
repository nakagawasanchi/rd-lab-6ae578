(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function toast(m){var t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},1400)}
function epLink(ep,label){var n=ep[0]<10?'0'+ep[0]:ep[0];return '<a class="ep" href="../s5/episodes/ep'+n+'.html">💬 会話で学ぶ：'+esc(ep[1])+'</a>'}
function epChip(n){var s=n<10?'0'+n:n;return '<a class="epchip" href="../s5/episodes/ep'+s+'.html">ep'+s+'</a>'}
var page=document.body.getAttribute('data-page');
function tag(t){return t?'<span class="ver">（'+esc(t)+'）</span>':''}

if(page==='checklist'){
  var KEY='s1_checklist_v2',state={};
  try{state=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){state={}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  var root=$('#list'),total=0;
  CHECKLIST.forEach(function(m,mi){
    var sec=document.createElement('div');sec.className='sect';sec.id=m.id;
    var h='<header><span class="ttl">'+m.emoji+' '+esc(m.name)+'<small>'+esc(m.sub)+'</small></span><small class="cnt"></small></header><div class="items">';
    m.items.forEach(function(it,ii){
      total++;var id=m.id+'_'+ii;
      h+='<div class="item"><label><input type="checkbox" data-id="'+id+'"'+(state[id]?' checked':'')+'><span>'+esc(it[0])+'</span></label><details class="why"><summary></summary><div>'+esc(it[1])+tag(it[3])+' '+epChip(it[2])+'</div></details></div>';
    });
    sec.innerHTML=h+'</div>';root.appendChild(sec);
    $('header',sec).addEventListener('click',function(){sec.classList.toggle('shut')});
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
  if(location.hash){var t=$(location.hash);if(t)t.scrollIntoView()}
}

if(page==='cards'){
  var tags=['すべて'];CARDS.forEach(function(c){c.tag.split('・').forEach(function(t){if(tags.indexOf(t)<0)tags.push(t)})});
  var f=$('#filters'),g=$('#grid'),cur='すべて';
  function draw(){
    f.innerHTML=tags.map(function(t){return '<button class="chip'+(t===cur?' on':'')+'" data-t="'+esc(t)+'">'+esc(t)+'</button>'}).join('');
    g.innerHTML=CARDS.filter(function(c){return cur==='すべて'||c.tag.split('・').indexOf(cur)>=0}).map(function(c){
      return '<article class="card" id="'+c.id+'"><div class="head"><div class="tag">'+esc(c.tag)+'</div><h3>'+esc(c.name)+'</h3><p class="use">'+esc(c.use)+'</p></div><div class="body"><ol class="st">'+c.steps.map(function(s){return '<li><b>'+s[0]+'</b>'+esc(s[1])+'</li>'}).join('')+'</ol><p class="ex"><em>例</em>'+esc(c.ex)+'</p><p class="ng"><em>NG</em>'+esc(c.ng)+'</p><details class="more"><summary>もっと見る</summary><div>'+esc(c.more)+'</div></details>'+epLink(c.ep)+'</div></article>';
    }).join('');
    if(location.hash){var t=$(location.hash);if(t){t.classList.add('hit');t.scrollIntoView()}}
  }
  f.addEventListener('click',function(e){var t=e.target.dataset&&e.target.dataset.t;if(t){cur=t;draw()}});
  draw();
}

if(page==='cases'){
  var th=['すべて'];CASES.forEach(function(c){c.themes.forEach(function(t){if(th.indexOf(t)<0)th.push(t)})});
  var ff=$('#filters'),lst=$('#cases'),ct='すべて';
  function draw2(){
    ff.innerHTML=th.map(function(t){return '<button class="chip'+(t===ct?' on':'')+'" data-t="'+esc(t)+'">'+esc(t)+'</button>'}).join('');
    var n=0;
    lst.innerHTML=CASES.map(function(c,i){
      if(ct!=='すべて'&&c.themes.indexOf(ct)<0)return '';n++;
      return '<div class="case"><h3>事例'+(i+1)+'：'+esc(c.title)+tag(c.time)+'</h3><div class="three"><div class="pane bef"><h4>😣 BEFORE</h4>'+esc(c.before)+'</div><div class="pane cmt"><h4>💬 指摘</h4>'+esc(c.point)+'</div><div class="pane aft"><h4>😊 AFTER</h4>'+esc(c.after)+'</div></div>'+epLink(c.ep)+'</div>';
    }).join('');
    $('#count').textContent=n+'件';
  }
  ff.addEventListener('click',function(e){var t=e.target.dataset&&e.target.dataset.t;if(t){ct=t;draw2()}});
  draw2();
}

if(page==='templates'){
  var box=$('#tpls');
  box.innerHTML=TEMPLATES.map(function(t,i){return '<div class="tpl"><header><h3>'+esc(t.title)+tag(t.time)+'</h3><button class="btn sm" data-i="'+i+'">コピー</button></header><div class="desc">'+esc(t.desc)+'</div><details class="more"><summary>中身を見る</summary><pre>'+esc(t.text)+'</pre></details><div class="epw">'+epLink(t.ep)+'</div></div>'}).join('');
  box.addEventListener('click',function(e){
    var b=e.target.closest('button[data-i]');if(!b)return;
    var txt=TEMPLATES[b.dataset.i].text;
    function fb(){var a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('コピーしました')}catch(x){toast('コピーできませんでした')}document.body.removeChild(a)}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast('コピーしました')},fb)}else fb();
  });
}

if(page==='start'){
  var Q=[
   {q:"いまのリールは、どの段階？",o:[["これから撮る／企画中","m1"],["撮った・出す前","m2"],["出したけど伸びない","m3"]]},
   {q:"いちばん困っているのは？",o:[["ネタが浮かばない","neta"],["冒頭で離脱される","open"],["台本・言葉が長い","script"],["撮影・編集が不安","shoot"],["反応がない（サムネ・CTA）","react"]]},
   {q:"いま狙っているのは？",o:[["再生数","view"],["フォロー","follow"],["まだ決めていない","none"]]}
  ];
  var MAP={
   neta:{cards:["c07","c08","c13"],eps:[1,2,3]},
   open:{cards:["c11","c12","c10"],eps:[4]},
   script:{cards:["c05","c01","c15"],eps:[5,7]},
   shoot:{cards:["c04","c02","c03"],eps:[8,9,10,12]},
   react:{cards:["c14","c16","c15"],eps:[13,14,20]}
  };
  var GOAL={view:"再生数を狙うなら、CTAは「保存」に絞る（しゅり流の目安）。",follow:"フォローを狙うなら、悩みと共感を丁寧に。CTAは1つだけ。",none:"まずは目的を1つ決めよう。再生数とフォロー増は両立しにくい。"};
  var step=0,ans=[];
  var qbox=$('#quiz'),res=$('#result');
  function ask(){
    if(step>=Q.length){show();return}
    var q=Q[step];
    qbox.innerHTML='<div class="prog">Q'+(step+1)+' / 3</div><h2>'+esc(q.q)+'</h2><div class="opts">'+q.o.map(function(o,i){return '<button class="opt" data-i="'+i+'">'+esc(o[0])+'</button>'}).join('')+'</div>';
  }
  qbox.addEventListener('click',function(e){var b=e.target.closest('.opt');if(!b)return;ans.push(Q[step].o[b.dataset.i][1]);step++;ask()});
  function show(){
    qbox.style.display='none';
    var m=MAP[ans[1]],mt=CHECKLIST.filter(function(x){return x.id===ans[0]})[0];
    var cs=m.cards.map(function(id){return CARDS.filter(function(c){return c.id===id})[0]});
    res.innerHTML='<h2>あなたへのおすすめ</h2><div class="rec"><h3>🃏 型カード3枚</h3>'+cs.map(function(c){return '<a class="pick" href="cards.html#'+c.id+'"><b>'+esc(c.name)+'</b><span>'+esc(c.use)+'</span></a>'}).join('')+'</div><div class="rec"><h3>✅ チェックリスト</h3><a class="pick" href="checklist.html#'+mt.id+'"><b>'+mt.emoji+' '+esc(mt.name)+'</b><span>'+esc(mt.sub)+'</span></a></div><div class="rec"><h3>💬 会話で学ぶ</h3><p>'+m.eps.map(epChip).join(' ')+'</p></div><p class="note">'+esc(GOAL[ans[2]])+'</p><p><button class="reset" id="again">もう一度やる</button></p>';
    res.style.display='block';
    $('#again').addEventListener('click',function(){step=0;ans=[];res.style.display='none';qbox.style.display='';ask()});
  }
  ask();
}
})();
