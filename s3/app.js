(function(){
  function store(k,v){try{if(v===undefined){return localStorage.getItem(k)}localStorage.setItem(k,v)}catch(e){return null}}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function yen(n){return Math.round(n).toLocaleString('ja-JP')+'円'}

  // ---- copy buttons ----
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=document.getElementById(b.getAttribute('data-copy'));
      var text=t.value!==undefined&&t.tagName==='TEXTAREA'?t.value:t.innerText;
      function ok(){var o=b.textContent;b.textContent='コピーしました';b.classList.add('copied');setTimeout(function(){b.textContent=o;b.classList.remove('copied')},1400)}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fb)}else{fb()}
      function fb(){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){}document.body.removeChild(ta)}
    });
  });

  // ---- phrase filter ----
  var fl=$('.filter');
  if(fl){
    fl.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;
      $$('button',fl).forEach(function(x){x.classList.remove('on')});b.classList.add('on');
      var c=b.getAttribute('data-cat');
      $$('.phrase').forEach(function(p){p.style.display=(c==='all'||p.getAttribute('data-cat')===c)?'':'none'});
    });
  }

  // ---- calculator (v2) ----
  var calc=$('#calc');
  if(calc){
    var ids=['fol','cnt','views','ask','orig','floor'];
    function num(id){var v=parseFloat($('#'+id).value);return isNaN(v)?0:v}
    function run(){
      var fol=num('fol'),cnt=Math.max(1,num('cnt')||1),views=num('views'),ask=num('ask'),orig=num('orig'),floor=num('floor');
      var out=$('#calcout');
      if(!fol){out.innerHTML='<p style="margin:0">フォロワー数を入れると、目安が出ます。</p>';return}
      var base=fol*1;
      var h='<div>しゅり流の目安（フォロワー×1円）</div><div class="big">'+yen(base)+' / 1本</div>';
      if(fol>=50000){h+='<div class="row"><span>5万人超</span><span>提示額が変わる帯（上振れ余地）</span></div>'}
      else if(fol>=20000){h+='<div class="row"><span>2万人前後〜</span><span>有償PR 3万円〜の話</span></div>'}
      else{h+='<div class="row"><span>2万人まで</span><span>まだ手前。実績づくりの時期</span></div>'}
      if(fol>=8000&&fol<=15000){h+='<div class="row"><span>1万人前後</span><span>PRのDMが最も来やすい時期</span></div>'}
      if(views){h+='<div class="row"><span>1再生4円で見た価値</span><span>'+yen(views*4)+' / 1本</span></div>'}
      if(cnt>1){h+='<div class="row"><span>'+cnt+'本セット（×1円）</span><span>'+yen(base*cnt)+'</span></div>'}
      var unit=ask||base;
      if(ask){
        var rate=Math.round(ask/base*100);
        var msg=ask<base*0.8?'目安より低め。交渉の余地あり（初回額は次のベース）':(ask<=base*1.1?'目安の範囲。付加価値で上乗せ交渉も':'目安以上。条件面（修正・報酬時期）を確認');
        h+='<div class="row"><span>先方 '+yen(ask)+'（目安比 '+rate+'%）</span><span></span></div><div class="row" style="border:0"><span style="color:#f3c979">'+msg+'</span></div>';
      }
      var o=orig||unit;
      h+='<div class="row"><span>二次利用費の上限目安（元報酬の半分以下）</span><span>'+yen(o/2)+' 以下</span></div>';
      h+='<div class="row"><span>二次利用の目安（3か月）</span><span>1.5万円</span></div>';
      if(floor){
        var need=Math.ceil(floor/unit);
        h+='<div class="row"><span>最低ライン '+yen(floor)+' に必要な本数</span><span>'+need+' 本/月</span></div>';
        if(need>=4)h+='<div class="row" style="border:0"><span style="color:#f3c979">本数が多め。自分の投稿の時間との配分を</span></div>';
      }
      out.innerHTML=h;
    }
    ids.forEach(function(i){$('#'+i).addEventListener('input',run)});
    run();
  }

  // ---- pitch deck ----
  var deck=$('#deck');
  if(deck){
    var dk='s3_deck_v2',dsv={};try{dsv=JSON.parse(store(dk)||'{}')}catch(e){}
    var df=$$('[data-d]',deck),T={over:'① 概要',mind:'② 発信への思い',rec:'③ 実績',att:'④ フォロワー属性',mer:'⑤ 企業へのメリット'};
    df.forEach(function(e){var k=e.getAttribute('data-d');if(dsv[k])e.value=dsv[k];e.addEventListener('input',dbuild)});
    function esc(x){return x.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
    function dbuild(){
      var s={},v='',t='';
      df.forEach(function(e){var k=e.getAttribute('data-d'),x=e.value.trim();s[k]=e.value;
        v+='<div class="slide"><h4>'+T[k]+'</h4><p'+(x?'':' class="ph"')+'>'+(x?esc(x):'（未入力）')+'</p></div>';
        t+='【'+T[k]+'】\n'+(x||'（未入力）')+'\n\n';});
      store(dk,JSON.stringify(s));$('#deckview').innerHTML=v;$('#deckout').value=t;
    }
    $('#deckclear').addEventListener('click',function(){if(confirm('入力内容をすべて消しますか？')){df.forEach(function(e){e.value=''});dbuild()}});
    dbuild();
  }

  // ---- checklist ----
  var ckbox=$('#ckbox');
  if(ckbox){
    var key='s3_check_v2';
    var saved={};try{saved=JSON.parse(store(key)||'{}')}catch(e){}
    var cks=$$('input.ck',ckbox);
    cks.forEach(function(c){
      if(saved[c.id]){c.checked=true}
      c.addEventListener('change',update);
    });
    function update(){
      var s={},n=0,red=0,tot=cks.length,totred=0;
      cks.forEach(function(c){
        var isred=c.getAttribute('data-red')==='1';
        if(isred)totred++;
        c.closest('.chk').classList.toggle('done',c.checked);
        if(c.checked){s[c.id]=1;n++}
      });
      store(key,JSON.stringify(s));
      // red items: 「チェックが付かない」= 不安要素
      var unchecked=cks.filter(function(c){return c.getAttribute('data-red')==='1'&&!c.checked}).length;
      $('#ckcount').textContent=n+' / '+tot;
      $('#ckbar').style.width=(n/tot*100)+'%';
      var v=$('#ckverdict');
      if(n===0){v.textContent='上から順に、事実を確認しながらチェックしてください。'}
      else if(unchecked===0&&n===tot){v.textContent='全項目クリアです。最終的な判断はご自身で。契約書の細部は原本で再確認を。'}
      else if(unchecked>=1){v.textContent='「重要」印の項目が '+unchecked+' 件、未確認です。ここが埋まるまで返事を急がなくて大丈夫です（延期・確認の質問も選択肢）。'}
      else{v.textContent='重要項目はクリア。残りの項目も確認しておくと安心です。'}
    }
    $('#ckreset').addEventListener('click',function(){cks.forEach(function(c){c.checked=false});update()});
    update();
  }

  // ---- script sheet ----
  var sheet=$('#sheet');
  if(sheet){
    var skey='s3_script_v2';
    var f=$$('[data-f]',sheet);
    var sv={};try{sv=JSON.parse(store(skey)||'{}')}catch(e){}
    f.forEach(function(e){var k=e.getAttribute('data-f');if(sv[k])e.value=sv[k];e.addEventListener('input',build)});
    function g(k){var e=$('[data-f="'+k+'"]',sheet);return e?e.value.trim():''}
    function build(){
      var s={};f.forEach(function(e){s[e.getAttribute('data-f')]=e.value});store(skey,JSON.stringify(s));
      var b=function(x,d){return x||d};
      var t='';
      t+='【PR台本シート】'+b(g('product'),'（商品名）')+'\n\n';
      t+='■ 企画の軸\n・誰に：'+b(g('who'),'（未入力）')+'\n・何を伝える：'+b(g('what'),'（未入力）')+'\n・推しポイント：'+b(g('push'),'（未入力）')+'\n\n';
      t+='■ 商品理解\n・数字・根拠：'+b(g('fact'),'（未入力）')+'\n・普通との違い：'+b(g('diff'),'（未入力）')+'\n\n';
      t+='■ 構成（結論→悩み→良さ→どうなれるか→商品名）\n';
      t+='1. 冒頭（1秒で分かるタイトル・結論）：'+b(g('open'),'（未入力）')+'\n';
      t+='2. 本当の悩み（共感）：'+b(g('pain'),'（未入力）')+'\n';
      t+='3. 商品の良さ（ポンポン並べる）：'+b(g('good'),'（未入力）')+'\n';
      t+='4. 使うとどうなれるか（一言）：'+b(g('after'),'（未入力）')+'\n';
      t+='5. 商品名・CTA（1つだけ）：'+b(g('cta'),'（未入力）')+'\n\n';
      t+='■ 秒数まわり\n・商品が初めて映る秒：'+b(g('sec1'),'（未入力）')+' 秒'+(parseFloat(g('sec1'))>10?'（⚠ 10秒超。10秒以内に商品を出す）':'')+'\n・秒数指定：'+b(g('secreq'),'（なし／未確認）')+'\n・アフレコを話して測った実測：'+b(g('secreal'),'（未計測）')+' 秒\n\n';
      t+='■ 伏線と回収\n・冒頭で張る：'+b(g('seed'),'（なし）')+'\n・最後に回収：'+b(g('pay'),'（なし）')+'\n\n';
      t+='■ 先方に確認すること\n'+b(g('ask'),'（例：商品名を冒頭で言う指示の有無／使ってはいけない表現／表記ルール／映してほしい面）')+'\n';
      $('#sheetout').value=t;
      // 先方向け意図文
      var m='お世話になっております。\n台本案をお送りいたします。\n\n【誰に・何を】\n'+b(g('who'),'（誰に）')+'に、'+b(g('what'),'（何を）')+'をお届けする構成です。\n\n【推しポイント】\n'+b(g('push'),'（推しポイント）')+'\n\n【工夫した点】\n・商品が映るのは約'+b(g('sec1'),'○')+'秒、'+'冒頭は「'+b(g('open'),'（冒頭）')+'」としています。\n・秒数は実際にアフレコを話して確認しています。\n\n【ご確認いただきたい点】\n'+b(g('ask'),'商品名の出し方、表現面（薬機法・表記など）でお気づきの点があればお知らせください。')+'\n\nご意向に沿って調整いたしますので、お気づきの点がございましたらお知らせください。\nどうぞよろしくお願いいたします。';
      $('#msgout').value=m;
    }
    $('#sheetclear').addEventListener('click',function(){if(confirm('入力内容をすべて消しますか？')){f.forEach(function(e){e.value=''});build()}});
    build();
  }
})();
