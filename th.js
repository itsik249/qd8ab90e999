/* ===== תהילים ===== */
const TH_BOOKS=[['ספר ראשון',1,41],['ספר שני',42,72],['ספר שלישי',73,89],['ספר רביעי',90,106],['ספר חמישי',107,150]];
const TH_WEEK=[['יום ראשון',1,29],['יום שני',30,50],['יום שלישי',51,72],['יום רביעי',73,89],['יום חמישי',90,106],['יום שישי',107,119],['שבת',120,150]];
const TH_MONTH=[[1,9],[10,17],[18,22],[23,28],[29,34],[35,38],[39,43],[44,48],[49,54],[55,59],[60,65],[66,68],[69,71],[72,76],[77,78],[79,82],[83,87],[88,89],[90,96],[97,103],[104,105],[106,107],[108,112],[113,118],[119,1,96],[119,97,176],[120,134],[135,139],[140,144],[145,150]];
let thOpen=false,thStack=[];

/* ---- אותיות ומספרים ---- */
function hebPlain(n){const o=['','א','ב','ג','ד','ה','ו','ז','ח','ט'],t=['','י','כ','ל','מ','נ','ס','ע','פ','צ'],h=['','ק','ר','ש','ת'];
  let s='';if(n>=100){s+=h[Math.floor(n/100)];n%=100}
  if(n===15)s+='טו';else if(n===16)s+='טז';else s+=t[Math.floor(n/10)]+o[n%10];return s}
function heb(n){const s=hebPlain(n);return s.length===1?s+'׳':s.slice(0,-1)+'״'+s.slice(-1)}
function gem(str){const v={א:1,ב:2,ג:3,ד:4,ה:5,ו:6,ז:7,ח:8,ט:9,י:10,כ:20,ך:20,ל:30,מ:40,ם:40,נ:50,ן:50,ס:60,ע:70,פ:80,ף:80,צ:90,ץ:90,ק:100,ר:200,ש:300,ת:400};
  let s=0;for(const c of str){if(v[c])s+=v[c]}return s}
function parseCh(x){x=String(x||'').trim();if(!x)return null;let n=/^\d+$/.test(x)?+x:gem(x.replace(/[֑-ׇ"'׳״\s]/g,''));return n>=1&&n<=150?n:null}

/* ---- נתונים ושמירה ---- */
function T(){const t=S.th=S.th||{};t.read=t.read||{};t.lists=t.lists||[];t.tab=t.tab||'books';return t}
const keyOf=it=>it.f?it.c+':'+it.f+'-'+it.t:''+it.c;
function chRead(c){const r=T().read;return !!(r[c]||(c===119&&r['119:1-96']&&r['119:97-176']))}
function itRead(it){return !!T().read[keyOf(it)]||(!it.f&&chRead(it.c))}
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>({c:a+i}));
const itemLabel=it=>it.f?heb(it.c)+' ('+it.f+'–'+it.t+')':heb(it.c);
function monthItems(d){const m=TH_MONTH[d-1];return m.length===3?[{c:m[0],f:m[1],t:m[2]}]:range(m[0],m[1])}
function monthText(d){const m=TH_MONTH[d-1];return m.length===3?'מזמור '+heb(m[0])+' (פסוקים '+m[1]+'–'+m[2]+')':(m[0]===m[1]?'מזמור '+heb(m[0]):'מזמורים '+heb(m[0])+'–'+heb(m[1]))}
function hebToday(){const d=new Date(),day=+new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric'}).format(d);
  const t=new Date(d.getTime()+864e5),short=+new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric'}).format(t)===1&&day===29;
  let mon='';try{mon=new Intl.DateTimeFormat('he-u-ca-hebrew',{month:'long'}).format(d)}catch(e){}
  return {day,short,mon,wd:d.getDay()}}
function parseList(spec){const items=[];String(spec).split(/[,\s]+/).filter(Boolean).forEach(tok=>{
  const p=tok.split(/[-–]/);const a=parseCh(p[0]),b=p[1]?parseCh(p[1]):a;
  if(a&&b&&b>=a)range(a,b).forEach(x=>items.push(x))});return items}

/* ---- ניווט ---- */
function openTh(){
  thOpen=true;S.open='th';save();
  $('#home').classList.add('hide');$('#reader').classList.add('hide');$('#fab').classList.add('hide');$('#th').classList.remove('hide');
  $('#ttl').textContent='תהילים';$('#bBack').classList.remove('hide');
  thStack=[{v:'menu'}];
  if(T().inRead&&T().cur)thStack.push({v:'read'});
  history.pushState({th:1},'');thRender();window.scrollTo(0,0)}
function thNav(s){thStack.push(s);history.pushState({th:1},'');thRender();window.scrollTo(0,0)}
function thPop(){const was=thStack.pop();if(was&&was.v==='read'){T().inRead=false;save()}
  if(!thStack.length){thLeave();return}thRender();window.scrollTo(0,0)}
function thLeave(){thOpen=false;S.open=null;save();$('#th').classList.add('hide');$('#thbar').classList.add('hide');renderHome();window.scrollTo(0,0)}
function thRender(){const s=thStack[thStack.length-1];
  $('#thbar').classList.toggle('hide',s.v!=='read');
  if(s.v==='menu')thMenu();else if(s.v==='range')thRange(s);else thRead()}

/* ---- תפריט ראשי ---- */
function thMenu(){
  $('#ttl').textContent='תהילים';
  const t=T(),total=Array.from({length:150},(_,i)=>i+1).filter(chRead).length,hd=hebToday();
  const opts=Array.from({length:150},(_,i)=>'<option value="'+(i+1)+'">מזמור '+heb(i+1)+' ('+(i+1)+')'+(chRead(i+1)?' ✓':'')+'</option>').join('');
  let h='';
  if(t.cur){const it=t.cur.seq[t.cur.i];h+='<button class="resume" data-th="resume">▶ המשך: מזמור '+heb(it.c)+'<small>'+esc(t.cur.label||'')+'</small></button>'}
  h+='<div class="thq"><input type="text" id="thIn" list="thDl" placeholder="מזמור: נ או 50" autocomplete="off"><button class="btn" id="thGo">פתח</button></div>'+
     '<select id="thSel"><option value="">או בחר מהרשימה (א–קנ)…</option>'+opts+'</select>'+
     '<div class="thp"><div class="thpb"><i style="width:'+(total/150*100)+'%"></i></div><span>קראת '+total+' מתוך 150</span><button class="btn sec" id="thReset">אפס סימונים</button></div>'+
     '<div class="tabs">'+[['books','ספרים'],['week','יום בשבוע'],['month','יום בחודש'],['age','לפי גיל'],['lists','הרשימות שלי']].map(x=>'<button class="tab'+(t.tab===x[0]?' on':'')+'" data-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  if(t.tab==='books')h+='<div class="grid1">'+TH_BOOKS.map((b,i)=>'<button class="card" data-rng="'+b[1]+'-'+b[2]+'" data-ttl="'+b[0]+'"><b>'+b[0]+'</b><small>מזמורים '+heb(b[1])+'–'+heb(b[2])+'</small></button>').join('')+'</div>';
  else if(t.tab==='week')h+='<div class="grid1">'+TH_WEEK.map((b,i)=>'<button class="card'+(i===hd.wd?' today':'')+'" data-rng="'+b[1]+'-'+b[2]+'" data-ttl="'+b[0]+'"><b>'+b[0]+(i===hd.wd?' · היום':'')+'</b><small>מזמורים '+heb(b[1])+'–'+heb(b[2])+'</small></button>').join('')+'</div>';
  else if(t.tab==='month'){
    const sel=t.mday||hd.day;
    h+='<p class="thn">היום '+heb(hd.day)+(hd.mon?' ב'+esc(hd.mon):'')+(hd.short?' (בחודש חסר קוראים גם את חלק ל׳)':'')+'.<br>החישוב לפי התאריך הלועזי; אחרי השקיעה בחר ידנית את היום הבא.</p>'+
       '<button class="resume" data-md="today">▶ החלק של היום: יום '+heb(hd.day)+'<small>'+monthText(hd.day)+(hd.short?' + '+monthText(30):'')+'</small></button>'+
       '<div class="dgrid">'+Array.from({length:30},(_,i)=>'<button class="dbtn'+(i+1===hd.day?' today':'')+'" data-md="'+(i+1)+'">'+hebPlain(i+1)+'</button>').join('')+'</div>';
  }
  else if(t.tab==='age')h+='<p class="thn">הקלד גיל, ויפתח המזמור של השנה שאחריו (גיל 20 ← מזמור כ״א).</p><div class="thq"><input type="number" id="thAge" inputmode="numeric" min="0" placeholder="בן/בת כמה?" value="'+(t.age||'')+'"><button class="btn" id="thAgeGo">אישור</button></div>';
  else h+=(t.lists.length?t.lists.map((l,i)=>'<div class="hl"><div class="n"><b>'+esc(l.n)+'</b><br><small>'+l.items.map(x=>heb(x.c)).join(' · ')+'</small></div><button data-li="'+i+'">פתח</button><button data-ld="'+i+'">✕</button></div>').join(''):'<p class="thn">אין עדיין רשימות. למשל: "לרפואה" עם המזמורים 20, 23, 121.</p>')+'<button class="btn sec" id="thNewList">+ רשימה חדשה</button>';
  $('#th').innerHTML=h;
}

/* ---- מסך רשימת מזמורים (טווח) ---- */
function thRange(s){
  $('#ttl').textContent=s.title;
  const items=s.items,firstUn=items.findIndex(x=>!itRead(x));
  let h='<div class="thn">'+esc(s.sub||'')+'</div><div class="row"><button class="btn grow" data-rs="'+Math.max(0,firstUn)+'">'+(firstUn>0?'המשך מהמזמור שעוד לא נקרא':'התחל לקרוא')+'</button></div><div class="dgrid wide">'+
    items.map((x,i)=>'<button class="dbtn'+(itRead(x)?' rd':'')+'" data-rs="'+i+'">'+itemLabel(x)+(itRead(x)?' ✓':'')+'</button>').join('')+'</div>';
  $('#th').innerHTML=h;
}
function thStartRead(items,i,label){const t=T();t.cur={seq:items,i:i,label:label};t.inRead=true;save();thNav({v:'read'})}

/* ---- קורא ---- */
function thRead(){
  const t=T(),cu=t.cur,it=cu.seq[cu.i],c=it.c,f=it.f||1,vs=window.TEHILLIM[c-1],to=it.t||vs.length;
  t.last={c:c};t.inRead=true;save();
  $('#ttl').textContent='מזמור '+heb(c);
  const text=vs.slice(f-1,to).map((v,i)=>'<span class="tv">'+hebPlain(f+i)+'</span>'+esc(v)).join(' ');
  $('#th').innerHTML='<div class="thr" style="font-size:'+S.font+'px"><div class="tht">מזמור '+heb(c)+' <small>('+c+')'+(it.f?' · פסוקים '+f+'–'+to:'')+'</small></div>'+
    '<div class="thctx">'+esc(cu.label||'')+(cu.seq.length>1?' · '+(cu.i+1)+' מתוך '+cu.seq.length:'')+'</div>'+
    '<p class="thv">'+text+'</p><div class="row"><button class="btn sec grow" id="thJump">☰ מזמור אחר</button></div></div>';
  thBarState();
}
function thBarState(){const cu=T().cur,it=cu.seq[cu.i],rd=!!T().read[keyOf(it)];
  $('#thRd').textContent=rd?'✓ נקרא (ביטול)':'✓ קראתי';$('#thRd').classList.toggle('on',rd);
  $('#thPrev').disabled=cu.i===0}
function thMark(on){const cu=T().cur,it=cu.seq[cu.i],k=keyOf(it);if(on)T().read[k]=Date.now();else delete T().read[k];save()}
function thNextItem(){const cu=T().cur;
  if(cu.i+1<cu.seq.length){cu.i++;save();thRead();window.scrollTo(0,0)}
  else{toast('סיימת! ✓');history.back()}}

/* ---- חלון קפיצה ---- */
function thJumpSheet(){
  const opts=Array.from({length:150},(_,i)=>'<option value="'+(i+1)+'">מזמור '+heb(i+1)+' ('+(i+1)+')'+(chRead(i+1)?' ✓':'')+'</option>').join('');
  $('#shTh').innerHTML='<h3>מעבר למזמור</h3><div class="thq"><input type="text" id="thIn2" list="thDl" placeholder="נ או 50" autocomplete="off"><button class="btn" id="thGo2">פתח</button></div>'+
   '<select id="thSel2"><option value="">או בחר מהרשימה…</option>'+opts+'</select>';
  $('#ovTh').classList.add('on')}
function thGoCh(c,inSheet){
  if(!c){toast('לא נמצא מזמור כזה');return}
  if(inSheet)$('#ovTh').classList.remove('on');
  const items=range(1,150);
  if(thStack[thStack.length-1].v==='read'){const t=T();t.cur={seq:items,i:c-1,label:'כל התהילים'};save();thRead();window.scrollTo(0,0)}
  else thStartRead(items,c-1,'כל התהילים')}

/* ---- אירועים ---- */
document.addEventListener('click',e=>{
  if(!thOpen&&!e.target.closest('#ovTh'))return;
  const t=e.target.closest('button');if(!t)return;
  const d=t.dataset;
  if(d.th==='resume'){thNav({v:'read'});return}
  if(d.tab){T().tab=d.tab;save();thMenu();return}
  if(d.rng){const [a,b]=d.rng.split('-').map(Number);thNav({v:'range',title:d.ttl,sub:'מזמורים '+heb(a)+'–'+heb(b),items:range(a,b)});return}
  if(d.md){const hd=hebToday();
    if(d.md==='today'){const it=monthItems(hd.day).concat(hd.short?monthItems(30):[]);thNav({v:'range',title:'יום '+heb(hd.day)+' בחודש',sub:'חלק היום'+(hd.short?' (כולל חלק ל׳)':''),items:it})}
    else{const n=+d.md;thNav({v:'range',title:'יום '+heb(n)+' בחודש',sub:monthText(n),items:monthItems(n)})}return}
  if(d.rs!==undefined){const s=thStack[thStack.length-1];thStartRead(s.items,+d.rs,s.title);return}
  if(t.id==='thGo'){thGoCh(parseCh($('#thIn').value));return}
  if(t.id==='thGo2'){thGoCh(parseCh($('#thIn2').value),true);return}
  if(t.id==='thReset'){if(confirm('לאפס את כל סימוני "קראתי"?')){T().read={};save();thMenu()}return}
  if(t.id==='thAgeGo'){const a=parseInt($('#thAge').value,10);if(!(a>=0)){toast('הקלד גיל');return}
    T().age=a;save();const c=(a%150)+1;thStartRead([{c:c}],0,'מזמור לפי גיל ('+a+')');return}
  if(t.id==='thNewList'){const n=prompt('שם הרשימה (למשל: לרפואה):');if(!n)return;
    const sp=prompt('אילו מזמורים? אפשר מספרים, אותיות וטווחים. למשל: 20, 23, 121 או כ-כד');if(!sp)return;
    const items=parseList(sp);if(!items.length){toast('לא זוהו מזמורים');return}
    T().lists.push({n:n,items:items});save();thMenu();return}
  if(d.li!==undefined){const l=T().lists[+d.li];thNav({v:'range',title:l.n,sub:'הרשימה שלי',items:l.items});return}
  if(d.ld!==undefined){if(confirm('למחוק את הרשימה?')){T().lists.splice(+d.ld,1);save();thMenu()}return}
  if(t.id==='thJump'){thJumpSheet();return}
  if(t.id==='thPrev'){const cu=T().cur;if(cu.i>0){cu.i--;save();thRead();window.scrollTo(0,0)}return}
  if(t.id==='thRd'){const cu=T().cur,k=keyOf(cu.seq[cu.i]);const on=!T().read[k];thMark(on);thBarState();toast(on?'סומן: נקרא ✓':'הסימון בוטל');return}
  if(t.id==='thNext'){const cu=T().cur,k=keyOf(cu.seq[cu.i]);if(!T().read[k])thMark(true);thNextItem();return}
});
document.addEventListener('change',e=>{
  if(e.target.id==='thSel'){thGoCh(+e.target.value||null)}
  if(e.target.id==='thSel2'){thGoCh(+e.target.value||null,true)}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){
  if(e.target.id==='thIn')thGoCh(parseCh(e.target.value));
  if(e.target.id==='thIn2')thGoCh(parseCh(e.target.value),true);
  if(e.target.id==='thAge')$('#thAgeGo').click()}});

(function(){const d=document.createElement('datalist');d.id='thDl';d.innerHTML=Array.from({length:150},(_,i)=>'<option value="'+hebPlain(i+1)+'" label="'+(i+1)+'"></option><option value="'+(i+1)+'" label="'+hebPlain(i+1)+'"></option>').join('');document.body.appendChild(d)})();
