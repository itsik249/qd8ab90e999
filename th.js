/* ===== תהילים ===== */
const TH_BOOKS=[['ספר ראשון',1,41],['ספר שני',42,72],['ספר שלישי',73,89],['ספר רביעי',90,106],['ספר חמישי',107,150]];
const TH_WEEK=[['יום ראשון',1,29],['יום שני',30,50],['יום שלישי',51,72],['יום רביעי',73,89],['יום חמישי',90,106],['יום שישי',107,119],['שבת',120,150]];
const TH_MONTH=[[1,9],[10,17],[18,22],[23,28],[29,34],[35,38],[39,43],[44,48],[49,54],[55,59],[60,65],[66,68],[69,71],[72,76],[77,78],[79,82],[83,87],[88,89],[90,96],[97,103],[104,105],[106,107],[108,112],[113,118],[119,1,96],[119,97,176],[120,134],[135,139],[140,144],[145,150]];
const MNAMES={1:'תשרי',2:'חשוון',3:'כסלו',4:'טבת',5:'שבט',6:'אדר א׳',7:'אדר',8:'ניסן',9:'אייר',10:'סיוון',11:'תמוז',12:'אב',13:'אלול'};
const MKEY={Tishri:1,Heshvan:2,Kislev:3,Tevet:4,Shevat:5,'Adar I':6,Adar:7,'Adar II':7,Nisan:8,Iyar:9,Sivan:10,Tamuz:11,Av:12,Elul:13};
let thOpen=false,thStack=[],thUI={open:null,sub:null,ctx:null},thGoingHome=false;
function thBackBtn(show){const b=$('#thBackF');b.classList.toggle('hide',!show);if(!show)return;
  const lbl='↩ חזרה לרשימת המזמורים';b.textContent=lbl;const cr=$('#thCrumb');if(cr)cr.textContent=lbl;
  const cu=T().cur;b.classList.toggle('low',!!(cu&&cu.noMark))}
/* כפתור הבית בכותרת: יוצא מתהילים בבת אחת, בלי להשאיר היסטוריה */
function thHome(){const n=thStack.length;if(n<1){thLeave();return}thGoingHome=true;history.go(-n)}
function thPopEvt(){if(thGoingHome){thGoingHome=false;thStack=[];T().inRead=false;save();thLeave()}else thPop()}

/* ---- אותיות ומספרים ---- */
function hebPlain(n){const o=['','א','ב','ג','ד','ה','ו','ז','ח','ט'],t=['','י','כ','ל','מ','נ','ס','ע','פ','צ'],h=['','ק','ר','ש'];
  let s='';while(n>=400){s+='ת';n-=400}if(n>=100){s+=h[Math.floor(n/100)];n%=100}
  if(n===15)s+='טו';else if(n===16)s+='טז';else s+=t[Math.floor(n/10)]+o[n%10];return s}
function heb(n){const s=hebPlain(n);return s.length===1?s+'׳':s.slice(0,-1)+'״'+s.slice(-1)}
const hn=n=>n===0?'אפס':heb(n);
function gem(str){const v={א:1,ב:2,ג:3,ד:4,ה:5,ו:6,ז:7,ח:8,ט:9,י:10,כ:20,ך:20,ל:30,מ:40,ם:40,נ:50,ן:50,ס:60,ע:70,פ:80,ף:80,צ:90,ץ:90,ק:100,ר:200,ש:300,ת:400};
  let s=0;for(const c of str){if(v[c])s+=v[c]}return s}
function parseCh(x){x=String(x||'').trim();if(!x)return null;const n=/^\d+$/.test(x)?+x:gem(x.replace(/[֑-ׇ"'׳״\s]/g,''));return n>=1&&n<=150?n:null}

/* ---- נתונים ושמירה ---- */
function T(){const t=S.th=S.th||{};t.read=t.read||{};t.lists=t.lists||[];return t}
const keyOf=it=>it.f?it.c+':'+it.f+'-'+it.t:''+it.c;
function chRead(c){const r=T().read;return !!(r[c]||(c===119&&r['119:1-96']&&r['119:97-176']))}
function itRead(it){return !!T().read[keyOf(it)]||(!it.f&&chRead(it.c))}
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>({c:a+i}));
const itemLabel=it=>it.f?heb(it.c)+' ('+hebPlain(it.f)+'–'+heb(it.t)+')':heb(it.c);
function monthItems(d){const m=TH_MONTH[d-1];return m.length===3?[{c:m[0],f:m[1],t:m[2]}]:range(m[0],m[1])}
function monthText(d){const m=TH_MONTH[d-1];return m.length===3?'מזמור '+heb(m[0])+' (פסוקים '+hebPlain(m[1])+'–'+heb(m[2])+')':(m[0]===m[1]?'מזמור '+heb(m[0]):'מזמורים '+heb(m[0])+'–'+heb(m[1]))}

/* ---- לוח עברי (מובנה במכשיר, תקף לכל שנה) ---- */
const HF=new Intl.DateTimeFormat('en-u-ca-hebrew',{year:'numeric',month:'long',day:'numeric'});
function hebParts(dt){const p={};HF.formatToParts(dt).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value});return {y:+p.year,d:+p.day,k:MKEY[p.month]||1}}
const isAfterSunset=()=>T().ss===new Date().toDateString();
function hebToday(){const base=new Date(Date.now()+(isAfterSunset()?864e5:0)),p=hebParts(base),nx=hebParts(new Date(base.getTime()+864e5));
  let mon='';try{mon=new Intl.DateTimeFormat('he-u-ca-hebrew',{month:'long'}).format(base)}catch(e){}
  return {day:p.d,short:p.d===29&&nx.d===1,mon:mon,wd:base.getDay()}}
function curAge(){const b=T().birth;if(!b)return null;const n=hebParts(new Date());let a=n.y-b.y;if(n.k<b.k||(n.k===b.k&&n.d<b.d))a--;return Math.max(0,a)}
const ageCh=a=>(a%150)+1;
const fmtBirth=b=>heb(b.d)+' ב'+MNAMES[b.k]+' '+heb(b.y%1000);

/* ---- ניווט ---- */
function openTh(){
  thOpen=true;S.open='th';save();thUI={open:null,sub:null,ctx:null};
  $('#home').classList.add('hide');$('#reader').classList.add('hide');$('#fab').classList.add('hide');$('#th').classList.remove('hide');
  $('#ttl').textContent='תהילים';$('#bBack').classList.remove('hide');
  thStack=[{v:'menu'}];
  if(T().inRead&&T().cur)thStack.push({v:'read'});
  history.pushState({th:1},'');thRender();window.scrollTo(0,0)}
function thNav(s){thStack.push(s);history.pushState({th:1},'');thRender();window.scrollTo(0,0)}
function thPop(){const was=thStack.pop();if(was&&was.v==='read'){T().inRead=false;save()}
  if(!thStack.length){thLeave();return}thRender();window.scrollTo(0,0)}
function thLeave(){thOpen=false;S.open=null;save();$('#bBack').textContent='‹ בית';$('#thBackF').classList.add('hide');$('#th').classList.add('hide');$('#thbar').classList.add('hide');renderHome();window.scrollTo(0,0)}
function thRender(){const s=thStack[thStack.length-1];
  $('#bBack').textContent='‹ בית';thBackBtn(s.v==='read');
  if(s.v==='menu'){$('#thbar').classList.add('hide');thMenu()}else thRead()}

/* ---- עמוד ראשי של תהילים ---- */
function chipsHTML(ctx){const items=ctx.items,fu=items.findIndex(x=>!itRead(x));
  return '<div class="thn">'+esc(ctx.title)+'</div><div class="pbar"><button class="btn" style="flex:1" data-cs="'+Math.max(0,fu)+'">'+(fu>0?'המשך מהמזמור שעוד לא נקרא':'להתחיל לקרוא')+'</button></div>'+
    '<div class="chs">'+items.map((x,i)=>'<button class="chb'+(itRead(x)?' rd':'')+'" data-cs="'+i+'">'+itemLabel(x)+(itRead(x)?' ✓':'')+'</button>').join('')+'</div>'}
function setSub(key,items,title){thUI.sub=key;thUI.ctx={items:items,label:title,title:title}}
function persRow(l,i){const dyn=l.dyn&&T().birth,a=dyn?curAge():null,its=dyn?[{c:ageCh(a)}]:l.items;
  return '<div class="pli"><div class="pn"><b>'+esc(l.n)+'</b><small>'+(dyn?'מזמור '+heb(its[0].c)+' · מתעדכן אוטומטית (גיל '+a+')':its.map(x=>itemLabel(x)).join(' · '))+'</small></div>'+
    '<button class="go" data-pl="r'+i+'">קריאה</button><button data-pl="e'+i+'">✎</button><button data-pl="d'+i+'">✕</button></div>'}
function thPanel(){const t=T(),o=thUI.open,hd=hebToday();let h='';
  if(!o)return '';
  if(o==='books'){h+='<div class="stg">'+TH_BOOKS.map((b,i)=>'<button class="stl'+(thUI.sub==='b'+i?' on':'')+'" data-sub="b'+i+'">'+b[0]+'</button>').join('')+'</div>'}
  else if(o==='week'){h+='<div class="stg">'+TH_WEEK.map((b,i)=>'<button class="stl'+(thUI.sub==='w'+i?' on':'')+(i===hd.wd?' today':'')+'" data-sub="w'+i+'">'+b[0]+(i===hd.wd?' · היום':'')+'</button>').join('')+'</div>'}
  else if(o==='month'){
    h+='<p class="thn" style="margin:0 2px 2px;font-size:16px;color:var(--fg)"><b>'+TH_WEEK[hd.wd][0]+', '+heb(hd.day)+(hd.mon?' ב'+esc(hd.mon):'')+'</b>'+(isAfterSunset()?' · מהערב':'')+(hd.short?'<br><span style="font-size:13px;color:var(--mut)">בחודש חסר קוראים גם את חלק ל׳</span>':'')+'</p>'+
      '<p class="thn" style="margin:2px 2px 10px;font-size:14px;line-height:1.5;color:var(--fg);opacity:.75">היום העברי מתחיל בשקיעה ולא בחצות. אם השמש כבר שקעה, יש ללחוץ על <b>🌙 כבר ערב</b> כדי לראות את התאריך של הלילה.</p>'+
      '<div class="pbar" style="margin:0 0 10px"><button class="btn" style="flex:1" data-md="today">▶ החלק של היום</button><button class="btn sec" data-ss="1">'+(isAfterSunset()?'✓ ':'🌙 ')+'כבר ערב</button></div>'+
      '<div class="stg d6">'+Array.from({length:30},(_,i)=>'<button class="stl'+(thUI.sub==='m'+(i+1)?' on':'')+(i+1===hd.day?' today':'')+'" data-sub="m'+(i+1)+'">'+hebPlain(i+1)+'</button>').join('')+'</div>'}
  else if(o==='age'){const b=t.birth,a=curAge();
    h+='<p class="thn" style="margin-top:0">אפשר להקליד גיל כדי לפתוח את המזמור של השנה שאחריו.</p><div class="thq" style="margin-top:0"><input type="number" id="thAge" inputmode="numeric" min="0" max="149" placeholder="בן/בת כמה?"><button class="btn" id="thAgeGo">אישור</button></div>'+
      (b?'<div class="agebox"><b>לפי תאריך הלידה העברי שלך</b><p style="margin:6px 0 10px;color:var(--mut);font-size:14px">'+fmtBirth(b)+' · גיל '+a+'</p><div class="pbar" style="margin:0"><button class="btn" style="flex:1" id="thBirthOpen">פתיחת מזמור '+heb(ageCh(a))+'</button><button class="btn sec" id="thBirthEdit">שינוי</button><button class="btn sec" id="thBirthDel">הסרה</button></div></div>'
        :'<button class="btn sec" id="thSetBirth" style="width:100%;margin-top:10px">🎂 הגדרת תאריך לידה עברי (עדכון אוטומטי בכל שנה)</button>')}
  else if(o==='pers'){h+=(t.lists.length?t.lists.map(persRow).join(''):'<p class="thn" style="margin-top:0">עוד אין מזמורים אישיים. למשל: "לרפואה" עם המזמורים כ׳, כ״ג וקכ״א.</p>')+'<button class="btn" id="thNewList" style="width:100%;margin-top:6px">+ הוספת מזמורים אישיים</button>'}
  if(thUI.ctx&&thUI.sub&&(o==='books'||o==='week'||o==='month'))h+=chipsHTML(thUI.ctx);
  return '<div class="panel">'+h+'</div>'}
function thMenu(){
  $('#ttl').textContent='תהילים';
  const t=T(),total=Array.from({length:150},(_,i)=>i+1).filter(chRead).length;
  const opts=Array.from({length:150},(_,i)=>'<option value="'+(i+1)+'">מזמור '+heb(i+1)+(chRead(i+1)?' ✓':'')+'</option>').join('');
  let h='';
  if(t.cur){h+='<div class="minires"><button data-th="resume">▶ המשך מהמקום האחרון: מזמור '+heb(t.cur.seq[t.cur.i].c)+'</button></div>'}
  h+='<div class="thq"><input type="text" id="thIn" list="thDl" placeholder="חיפוש מזמורים מהיר" autocomplete="off"><button class="btn" id="thGo">פתיחה</button></div>'+
     '<select id="thSel"><option value="">בחירת מזמור מהרשימה…</option>'+opts+'</select>'+
     '<div class="thp"><div class="thpb"><i style="width:'+(total/150*100)+'%"></i></div><span>'+(total?'קראת '+hn(total)+' מתוך ק״נ':'עוד אין מזמורים מסומנים')+'</span>'+(total?'<button class="btn sec" id="thReset" style="padding:8px 12px;font-size:13px">איפוס</button>':'')+'</div>'+
     '<div class="tiles">'+[['books','📖','ספרים'],['week','🗓️','ימי השבוע'],['month','🌙','יום בחודש'],['age','🎂','לפי גיל'],['pers','⭐','מזמורים אישיים']].map((x,i)=>'<button class="tile'+(i===4?' wide':'')+(thUI.open===x[0]?' on':'')+'" data-p="'+x[0]+'"><span class="ic">'+x[1]+'</span>'+x[2]+'</button>').join('')+'</div>'+thPanel();
  $('#th').innerHTML=h;
}
function thStartRead(items,i,label,opts){const t=T();t.cur={seq:items,i:i,label:label,noMark:!!(opts&&opts.noMark)};t.inRead=true;save();thNav({v:'read'})}

/* ---- קורא ---- */
function thRead(){
  const t=T(),cu=t.cur;if(!cu){thPop();return}
  const it=cu.seq[cu.i],c=it.c,f=it.f||1,vs=window.TEHILLIM[c-1],to=it.t||vs.length;
  t.last={c:c};t.inRead=true;S.lastAct={t:'th'};save();
  $('#ttl').textContent='מזמור '+heb(c);
  const text=vs.slice(f-1,to).map((v,i)=>'<span class="tv">'+hebPlain(f+i)+'</span>'+esc(v)).join(' ');
  let extra='';
  if(cu.noMark){const b=t.birth;
    extra='<div class="agebox"><button class="btn" style="width:100%" id="thSaveAge">💾 שמירה במזמורים אישיים</button></div>'+
      (b?'<p class="thn" style="text-align:center">תאריך הלידה העברי שלך: '+fmtBirth(b)+'. המזמור מתעדכן אוטומטית בכל יום הולדת עברי.</p>'
        :(t.birthNo?'':'<div class="sugg"><b>🎂 עדכון אוטומטי בכל שנה?</b><p>אפשר להגדיר תאריך לידה עברי, ובכל יום הולדת עברי ייפתח המזמור של השנה החדשה, בלי צורך לחשב.</p><div class="pbar" style="margin:0"><button class="btn" style="flex:1" id="thSetBirth2">כן, להגדיר</button><button class="btn sec" id="thNoBirth">לא, תודה</button></div></div>'))}
  const strip=cu.seq.length>1?'<div class="cs" id="thStrip">'+cu.seq.map((x,i)=>'<button class="cb'+(i===cu.i?' on':'')+(itRead(x)?' rd':'')+'" data-cj="'+i+'">'+itemLabel(x)+'</button>').join('')+'</div>':'';
  $('#th').innerHTML=strip+'<div class="thr'+(cu.noMark?'':' mark')+'" style="font-size:'+S.font+'px"><div class="crumbrow"><button class="thcrumb" id="thCrumb">↩ חזרה</button></div><div class="tht">מזמור '+heb(c)+(it.f?' <small>פסוקים '+hebPlain(f)+'–'+heb(to)+'</small>':'')+'</div>'+
    '<div class="thctx">'+esc(cu.label||'')+(cu.seq.length>1?' · '+hn(cu.i+1)+' מתוך '+hn(cu.seq.length):'')+'</div>'+
    '<p class="thv">'+text+'</p><div class="pbar"><button class="btn sec" style="flex:1" id="thJump">☰ מזמור אחר</button></div>'+extra+'</div>';
  $('#thbar').classList.toggle('hide',!!cu.noMark);thBackBtn(true);
  document.documentElement.style.setProperty('--hh',$('header').offsetHeight+'px');
  const on=$('#thStrip .on');if(on)on.scrollIntoView({block:'nearest',inline:'center'});
  if(!cu.noMark)thBarState();
}
function thBarState(){const cu=T().cur,it=cu.seq[cu.i],rd=!!T().read[keyOf(it)];
  $('#thRd').textContent=rd?'✓ נקרא (ביטול)':'✓ קראתי';$('#thRd').classList.toggle('on',rd);
  $('#thPrev').disabled=cu.i===0}
function thMark(on){const cu=T().cur,k=keyOf(cu.seq[cu.i]);if(on)T().read[k]=Date.now();else delete T().read[k];save()}
function thNextItem(){const cu=T().cur;
  if(cu.i+1<cu.seq.length){cu.i++;save();thRead();window.scrollTo(0,0)}
  else{toast('סיימת! ✓');history.back()}}

/* ---- חלון מעבר מהיר למזמור ---- */
function thJumpSheet(){
  const opts=Array.from({length:150},(_,i)=>'<option value="'+(i+1)+'">מזמור '+heb(i+1)+(chRead(i+1)?' ✓':'')+'</option>').join('');
  $('#shTh').innerHTML='<h3>מעבר למזמור</h3><div class="thq"><input type="text" id="thIn2" list="thDl" placeholder="חיפוש מזמורים מהיר" autocomplete="off"><button class="btn" id="thGo2">פתיחה</button></div>'+
   '<select id="thSel2"><option value="">או בחירה מהרשימה…</option>'+opts+'</select>';
  $('#ovTh').classList.add('on')}
function thGoCh(c,inSheet){
  if(!c){toast('לא נמצא מזמור כזה');return}
  if(inSheet)$('#ovTh').classList.remove('on');
  const items=range(1,150),top=thStack[thStack.length-1];
  if(top.v==='read'){const t=T();t.cur={seq:items,i:c-1,label:'כל התהילים',noMark:false};save();thRead();window.scrollTo(0,0)}
  else thStartRead(items,c-1,'כל התהילים')}

/* ---- מזמורים אישיים ---- */
async function thEditList(idx){
  const t=T(),ex=idx>=0?t.lists[idx]:null;
  if(ex&&ex.dyn){const v=await dlg({title:'שינוי כותרת',fields:[{id:'n',label:'כותרת',value:ex.n}],ok:'שמירה'});if(v&&v.n.trim()){ex.n=v.n.trim();save();thMenu()}return}
  let sel=ex?ex.items.map(x=>x.c):[];
  const opts='<option value="">בחירת מזמור מהרשימה…</option>'+Array.from({length:150},(_,i)=>'<option value="'+(i+1)+'">מזמור '+heb(i+1)+'</option>').join('');
  const draw=root=>{root.querySelector('#edChips').innerHTML=sel.length?sel.map((c,i)=>'<span class="dchip">'+heb(c)+'<button data-x="'+i+'" aria-label="הסרה">✕</button></span>').join(''):'<span style="color:var(--mut);font-size:13px">עוד לא נבחרו מזמורים</span>'};
  const v=await dlg({title:ex?'עריכת מזמורים אישיים':'מזמורים אישיים חדשים',noEnter:true,noFocus:false,ok:'שמירה',
    body:'<label class="df"><span>כותרת (למשל: לרפואה)</span><input id="edN" type="text" value="'+esc(ex?ex.n:'')+'"></label>'+
      '<div class="df"><span>הוספת מזמור: חיפוש מהיר או בחירה מהרשימה (אפשר בכל סדר)</span><div class="thq" style="margin:0 0 8px"><input type="text" id="edIn" list="thDl" placeholder="חיפוש מזמורים מהיר" autocomplete="off"><button class="btn sec" id="edAdd" type="button">הוספה</button></div><select id="edSel">'+opts+'</select></div><div class="dchips" id="edChips"></div>',
    onMount:root=>{draw(root);
      const add=c=>{if(!c){toast('לא נמצא מזמור כזה');return}if(sel.includes(c)){toast('המזמור כבר ברשימה');return}sel.push(c);draw(root);root.querySelector('#edIn').value='';root.querySelector('#edSel').value=''};
      root.querySelector('#edAdd').onclick=()=>add(parseCh(root.querySelector('#edIn').value));
      root.querySelector('#edIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add(parseCh(e.target.value))}};
      root.querySelector('#edSel').onchange=e=>{if(e.target.value)add(+e.target.value)};
      root.querySelector('#edChips').onclick=e=>{const b=e.target.closest('button[data-x]');if(b){sel.splice(+b.dataset.x,1);draw(root)}}},
    collect:root=>{const n=root.querySelector('#edN').value.trim();if(!n){toast('חסרה כותרת');return false}if(!sel.length){toast('יש לבחור לפחות מזמור אחד');return false}return {n:n,items:sel.map(c=>({c:c}))}}});
  if(!v)return;
  if(ex){ex.n=v.n;ex.items=v.items}else t.lists.push(v);
  save();thMenu()}
async function thSaveAge(){const cu=T().cur,b=T().birth;
  const v=await dlg({title:'שמירת המזמור',msg:'אפשר לתת כותרת למזמור (וגם לשנות אותה בהמשך).',fields:[{id:'n',label:'כותרת',value:'מזמור לפי גיל'}],ok:'שמירה'});
  if(!v)return;T().lists.push({n:v.n.trim()||'מזמור לפי גיל',items:[{c:cu.seq[0].c}],dyn:!!b});save();toast('נשמר במזמורים אישיים ✓')}
async function thBirthDialog(){
  const b=T().birth||{},now=hebParts(new Date());
  const opts=(arr,val)=>arr.map(x=>'<option value="'+x[0]+'"'+(String(x[0])===String(val)?' selected':'')+'>'+x[1]+'</option>').join('');
  const days=[['','בחירה']].concat(Array.from({length:30},(_,i)=>[i+1,heb(i+1)])),
        months=[['','בחירה']].concat(Object.entries(MNAMES).map(([k,n])=>[k,k==='7'?'אדר / אדר ב׳':n])),
        years=[['','בחירה']].concat(Array.from({length:111},(_,i)=>[now.y-i,heb((now.y-i)%1000)]));
  const body='<div class="sec3"><b>תאריך עברי</b><div class="d3"><label><span>יום</span><select id="bd">'+opts(days,b.d||'')+'</select></label>'+
      '<label><span>חודש</span><select id="bm">'+opts(months,b.k||'')+'</select></label><label><span>שנה</span><select id="by">'+opts(years,b.y||'')+'</select></label></div></div>'+
    '<div class="sec3 gr"><b>לא יודע/ת את התאריך העברי שלך? אפשר להקליד את הלועזי וזה יתמלא לבד.</b>'+
      '<div class="d3"><label><span>יום</span><input id="gd" type="text" inputmode="numeric" maxlength="2" autocomplete="off"></label>'+
      '<label><span>חודש</span><input id="gm" type="text" inputmode="numeric" maxlength="2" autocomplete="off"></label>'+
      '<label><span>שנה</span><input id="gy" type="text" inputmode="numeric" maxlength="4" autocomplete="off"></label></div>'+
      '<label class="chk"><input type="checkbox" id="gSun"><span>נולד/ה אחרי השקיעה?</span></label><button type="button" class="chkl" id="gHelp">להסבר קצר</button><div class="chkx hide" id="gHelpBox">היום העברי מתחיל בשקיעה. מי שנולד/ה <b>בין השקיעה לחצות</b> נספר/ת ליום העברי הבא, ולכן מסמנים. מי שנולד/ה לפני השקיעה או אחרי חצות לא מסמנים, כי התאריך הלועזי כבר מראה את היום העברי הנכון.</div>'+
      '<button class="btn dconv" id="gConv" type="button">המרה לתאריך עברי</button><div class="dres" id="gRes"></div></div>';
  const v=await dlg({title:'תאריך לידה עברי',ok:'שמירה',noEnter:true,noFocus:true,body:body,
    onMount:root=>{
      const q=s=>root.querySelector(s),gd=q('#gd'),gm=q('#gm'),gy=q('#gy'),res=q('#gRes');
      const say=(m,bad)=>{res.textContent=m;res.className='dres'+(bad?' bad':' ok')};
      const conv=(manual)=>{const d=+gd.value,m=+gm.value,y=+gy.value;
        if(!gd.value||!gm.value||gy.value.length<4){if(manual)say('יש להקליד יום, חודש ושנה (ארבע ספרות)',true);return false}
        const dt=new Date(y,m-1,d,12);
        if(y<1800||dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==d){say('התאריך הלועזי לא תקין',true);return false}
        const sun=q('#gSun').checked,p=hebParts(sun?new Date(y,m-1,d+1,12):dt);q('#bd').value=p.d;q('#bm').value=p.k;q('#by').value=p.y;
        if(q('#by').value!==String(p.y)){say('השנה מחוץ לטווח הרשימה',true);return false}
        say('✓ '+fmtBirth({d:p.d,k:p.k,y:p.y})+(sun?' (נספר כיום הבא)':''));return true};
      q('#gSun').onchange=()=>conv(false);
      q('#gHelp').onclick=()=>q('#gHelpBox').classList.toggle('hide');
      gd.oninput=()=>{gd.value=gd.value.replace(/\D/g,'');if(gd.value.length===2)gm.focus()};
      gm.oninput=()=>{gm.value=gm.value.replace(/\D/g,'');if(gm.value.length===2||(gm.value.length===1&&+gm.value>1))gy.focus()};
      gy.oninput=()=>{gy.value=gy.value.replace(/\D/g,'');if(gy.value.length===4)conv(false)};
      [gd,gm,gy].forEach(i=>i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();conv(true)}});
      q('#gConv').onclick=()=>conv(true)},
    collect:root=>{const d=root.querySelector('#bd').value,m=root.querySelector('#bm').value,y=root.querySelector('#by').value;
      if(!d||!m||!y){toast('יש לבחור יום, חודש ושנה');return false}return {d:d,m:m,y:y}}});
  if(!v)return false;T().birth={d:+v.d,k:+v.m,y:+v.y};T().birthNo=false;save();return true}

/* ---- אירועים ---- */
document.addEventListener('click',async e=>{
  if(!thOpen&&!e.target.closest('#ovTh'))return;
  const t=e.target.closest('button');if(!t)return;
  const d=t.dataset,id=t.id;
  if(d.th==='resume'){thNav({v:'read'});return}
  if(d.p){thUI.open=thUI.open===d.p?null:d.p;thUI.sub=null;thUI.ctx=null;thMenu();return}
  if(d.sub){const k=d.sub,n=+k.slice(1);
    if(thUI.sub===k){thUI.sub=null;thUI.ctx=null}
    else if(k[0]==='b')setSub(k,range(TH_BOOKS[n][1],TH_BOOKS[n][2]),TH_BOOKS[n][0]+' · מזמורים '+heb(TH_BOOKS[n][1])+'–'+heb(TH_BOOKS[n][2]));
    else if(k[0]==='w')setSub(k,range(TH_WEEK[n][1],TH_WEEK[n][2]),TH_WEEK[n][0]+' · מזמורים '+heb(TH_WEEK[n][1])+'–'+heb(TH_WEEK[n][2]));
    else if(k[0]==='m')setSub(k,monthItems(n),'יום '+heb(n)+' בחודש · '+monthText(n));
    thMenu();return}
  if(d.md==='today'){const hd=hebToday(),it=monthItems(hd.day).concat(hd.short?monthItems(30):[]);setSub('mt',it,'החלק של היום · יום '+heb(hd.day)+(hd.short?' ויום ל׳':'')+' בחודש');thMenu();return}
  if(d.ss){if(isAfterSunset())delete T().ss;else T().ss=new Date().toDateString();save();thUI.sub=null;thUI.ctx=null;thMenu();return}
  if(d.cs!==undefined&&thUI.ctx){thStartRead(thUI.ctx.items,+d.cs,thUI.ctx.label);return}
  if(d.cj!==undefined){const cu=T().cur;cu.i=+d.cj;save();thRead();window.scrollTo(0,0);return}
  if(id==='thGo'){thGoCh(parseCh($('#thIn').value));return}
  if(id==='thGo2'){thGoCh(parseCh($('#thIn2').value),true);return}
  if(id==='thReset'){const v=await dlg({title:'איפוס סימונים',msg:'למחוק את כל סימוני "קראתי"?',ok:'כן, לאפס',danger:true});if(v){T().read={};save();thMenu()}return}
  if(id==='thAgeGo'){const a=parseInt($('#thAge').value,10);if(!(a>=0)){toast('יש להקליד גיל');return}
    T().age=a;save();thStartRead([{c:ageCh(a)}],0,'מזמור לפי גיל ('+a+')',{noMark:true});return}
  if(id==='thBirthOpen'){const a=curAge();thStartRead([{c:ageCh(a)}],0,'מזמור לפי גיל ('+a+')',{noMark:true});return}
  if(id==='thSetBirth'||id==='thBirthEdit'){if(await thBirthDialog())thMenu();return}
  if(id==='thSetBirth2'){if(await thBirthDialog()){const a=curAge();T().cur={seq:[{c:ageCh(a)}],i:0,label:'מזמור לפי גיל ('+a+')',noMark:true};save();thRead()}return}
  if(id==='thNoBirth'){T().birthNo=true;save();thRead();return}
  if(id==='thBirthDel'){const v=await dlg({title:'הסרת תאריך לידה',msg:'להסיר את תאריך הלידה העברי?',ok:'הסרה',danger:true});if(v){delete T().birth;save();thMenu()}return}
  if(id==='thSaveAge'){thSaveAge();return}
  if(id==='thNewList'){thEditList(-1);return}
  if(d.pl){const k=d.pl[0],i=+d.pl.slice(1),l=T().lists[i];
    if(k==='r'){const dyn=l.dyn&&T().birth,its=dyn?[{c:ageCh(curAge())}]:l.items;thStartRead(its,0,l.n)}
    else if(k==='e')thEditList(i);
    else if(k==='d'){const v=await dlg({title:'מחיקה',msg:'למחוק את "'+l.n+'"?',ok:'מחיקה',danger:true});if(v){T().lists.splice(i,1);save();thMenu()}}
    return}
  if(id==='thBackF'||id==='thCrumb'){history.back();return}
  if(id==='thJump'){thJumpSheet();return}
  if(id==='thPrev'){const cu=T().cur;if(cu.i>0){cu.i--;save();thRead();window.scrollTo(0,0)}return}
  if(id==='thRd'){const cu=T().cur,k=keyOf(cu.seq[cu.i]),on=!T().read[k];thMark(on);thBarState();toast(on?'סומן: נקרא ✓':'הסימון בוטל');return}
  if(id==='thNext'){const cu=T().cur,k=keyOf(cu.seq[cu.i]);if(!T().read[k])thMark(true);thNextItem();return}
});
document.addEventListener('change',e=>{
  if(e.target.id==='thSel')thGoCh(+e.target.value||null);
  if(e.target.id==='thSel2')thGoCh(+e.target.value||null,true)});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;
  if(e.target.id==='thIn')thGoCh(parseCh(e.target.value));
  if(e.target.id==='thIn2')thGoCh(parseCh(e.target.value),true);
  if(e.target.id==='thAge')$('#thAgeGo').click()});
(function(){const d=document.createElement('datalist');d.id='thDl';d.innerHTML=Array.from({length:150},(_,i)=>'<option value="'+hebPlain(i+1)+'"></option>').join('');document.body.appendChild(d)})();
