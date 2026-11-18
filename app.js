"use strict";
/* ============ Speicher ============ */
const KEY='aufstieg_v1';
let S=null;
try{const r=localStorage.getItem(KEY);if(r)S=JSON.parse(r);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
const M={tab:'heute',ob:null,open:{},vidOpen:{},resetArm:false,lib:null};

/* ============ Helfer ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return ymd(d);};
const weekKey=s=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d);};
const fmtDate=s=>{const d=new Date(s+'T12:00:00');return DN[d.getDay()]+', '+d.getDate()+'.'+(d.getMonth()+1)+'.';};
const mmss=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+pad(s%60);};
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600);}
function stepOf(id){for(const k of ORDER){const i=CHAINS[k].steps.findIndex(s=>s.id===id);if(i>=0)return{chain:k,i,s:CHAINS[k].steps[i]};}return null;}
function goalTxt(s,sets){return (sets?sets+' × ':'')+s.g+(s.t==='s'?' s':'')+(s.u?' pro Seite':'');}
function unit(s){return s.t==='s'?'s':'Wdh.';}
function allEquip(){return new Set([...(S.equip.home||[]),...(S.equip.park||[])]);}
function hasNeed(s,set){return !(s.need||[]).some(n=>!set.has(n));}
function setsCount(){const d=S.plan.dur;return d<=20?2:d>=60?4:3;}
function baseRest(){return S.plan.style==='kurz'?60:S.plan.style==='ruhig'?120:90;}
function ytId(u){const m=String(u||'').match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);return m?m[1]:(/^[\w-]{11}$/.test(u||'')?u:null);}

function obStart(onlyTest){
 const a=S?JSON.parse(JSON.stringify(S.profile||{})):{home:['stange','tisch'],park:['stange','tisch','barren']};
 if(S){a.home=S.equip.home;a.park=S.equip.park;}
 M.ob={i:onlyTest?OB.findIndex(x=>x.test):0,a,onlyTest:!!onlyTest};render();
}
function num(v){const n=parseFloat(v);return isNaN(n)?null:n;}
function place(a){
 const pu=num(a.t_pu),kpu=num(a.t_kpu),pl=num(a.t_pull),hg=num(a.t_hang),pk=num(a.t_plank),kn=num(a.t_knee),sq=num(a.t_sq);
 let p=0;if(pu!=null||kpu!=null){p=pu>=20?5:pu>=12?4:pu>=5?3:(pu>=1||kpu>=12)?2:kpu>=4?1:0;}
 let l=0;if(pl!=null||hg!=null){if(pl>=12)l=7;else if(pl>=6)l=6;else if(pl>=3)l=5;else if(pl>=1)l=4;else l=hg>=45?3:hg>=20?2:hg>=10?1:0;}
 let c=0;if(pk!=null){c=pk>=90?3:pk>=60?2:pk>=30?1:0;if(kn>=12&&pk>=60)c=5;else if(kn>=8&&pk>=60)c=4;}
 let b=0;if(sq!=null){b=sq>=50?4:sq>=30?3:sq>=20?2:sq>=10?1:0;}if(a.t_pistol==='Ja')b=7;
 return{push:p,pull:l,legs:b,core:c};
}
function fixLevel(chain,i,eq){const st=CHAINS[chain].steps;i=Math.min(i,st.length-1);
 if(hasNeed(st[i],eq))return st[i].id;
 for(let j=i;j>=0;j--)if(hasNeed(st[j],eq))return st[j].id; // leichter verfügbare
 for(let j=i;j<st.length;j++)if(hasNeed(st[j],eq))return st[j].id;
 return st[i].id;}
/* Aktivitätsfaktor (PAL) aus Stunden-Profil: Schlaf, Arbeit, Freizeit + Wege, Schritte, Sport */
function calcPAL(a){
 const W={'Fast nur sitzend (Büro, Steuerpult)':1.5,'Gemischt (sitzen, stehen, etwas gehen)':2.2,'Viel stehen und gehen (Werkstatt, Anlage, Rundgänge)':2.8,'Körperlich schwer (heben, tragen, klettern)':3.5};
 const L={'Überwiegend sitzend (PC, Couch)':1.6,'Gemischt':2.0,'Aktiv (viel unterwegs, Haushalt, Garten, basteln)':2.4};
 if(!a.job&&!a.leisure&&a.steps==null)return null;
 const sl=Math.min(11,Math.max(4,num(a.sleep)||7.5)),wf=W[a.job]||2.0,lf=L[a.leisure]||1.9;
 const jh=a.job?Math.min(14,Math.max(0,num(a.jobH)||8.5)):0,jd=a.job?(parseInt(a.jobD)||5):0;
 const work=(sl*.95+jh*wf+(24-sl-jh)*lf)/24,free=(sl*.95+(24-sl)*lf)/24;
 let pal=(jd*work+(7-jd)*free)/7;
 pal+=Math.min(120,num(a.walkMin)||0)/10*0.012;          // zügiges Gehen / Rad
 pal+=Math.min(15,num(a.sportH)||0)*0.017;               // anderer Sport pro Woche
 pal+=({'Unter 5.000':-0.08,'5.000–8.000':-0.03,'8.000–12.000':0.02,'Über 12.000':0.06}[a.steps]||0);
 return Math.round(Math.min(2.3,Math.max(1.25,pal))*100)/100;
}
function calcBMR(a){const kg=num(a.weight),cm=num(a.height),age=num(a.age);if(!kg||!cm||!age)return null;
 return Math.round(10*kg+6.25*cm-5*age+(a.sex==='Weiblich'?-161:5));} // Mifflin-St Jeor
function obFinish(){
 const a=M.ob.a, eq=new Set([...(a.home||[]),...(a.park||[])]);
 const pl=place(a), lv={};ORDER.forEach(k=>lv[k]=fixLevel(k,pl[k],eq));
 const styleMap={'Kurz & intensiv (kurze Pausen)':'kurz','Länger & ruhig (lange Pausen)':'ruhig'};
 const plan={days:(a.days&&a.days.length)?a.days:[1,3,6],dur:parseInt(a.dur)||45,style:styleMap[a.style]||'mittel'};
 if(!S){S={v:1,created:today(),profile:{},equip:{},plan,levels:lv,sessions:[],weights:[],rest:{},videos:{},pending:{},jokers:{},lastBackup:null,active:null};}
 else{ if(!M.ob.onlyTest){S.plan=plan;} S.levels=lv; S.pending={}; }
 S.profile=Object.assign(S.profile||{},a);delete S.profile.home;delete S.profile.park;
 S.profile.pal=calcPAL(S.profile);S.profile.bmr=calcBMR(S.profile);
 S.equip={home:a.home||[],park:a.park||[]};
 if(num(a.weight)&&!S.weights.some(w=>w.d===today()))S.weights.push({d:today(),kg:num(a.weight)});
 save();M.ob=null;M.tab='heute';render();toast('Plan erstellt – los geht’s!');
}
function obSet(k,v){M.ob.a[k]=v;}
function obToggle(k,v,multi){const a=M.ob.a;if(multi){a[k]=a[k]||[];const i=a[k].indexOf(v);if(i>=0)a[k].splice(i,1);else{if(v==='Keine')a[k]=[];else a[k]=a[k].filter(x=>x!=='Keine');a[k].push(v);}}else a[k]=a[k]===v?null:v;render();}
function obNext(d){const o=M.ob;if(d>0&&OB[o.i].result){obFinish();return;}
 if(o.onlyTest&&d>0&&OB[o.i].test){o.i=OB.length-1;render();return;}
 o.i=Math.max(0,Math.min(OB.length-1,o.i+d));render();window.scrollTo(0,0);}
function renderOB(){
 const o=M.ob,st=OB[o.i],a=o.a;let h=`<div class="steps">${OB.map((_,i)=>`<i class="${i<=o.i?'on':''}"></i>`).join('')}</div>`;
 h+=`<h1>${esc(st.t)}</h1>${st.sub?`<p class="mut">${esc(st.sub)}</p>`:''}`;
 if(st.result){
  const eq=new Set([...(a.home||[]),...(a.park||[])]);const pl=place(a);
  const days=(a.days&&a.days.length)?a.days:[1,3,6];
  h+=`<div class="card"><h3>Deine Startstufen</h3>${ORDER.map(k=>{const s=stepOf(fixLevel(k,pl[k],eq)).s;return `<div class="row between" style="padding:6px 0"><span>${CHAINS[k].ic} ${CHAINS[k].n}</span><b class="acc">${esc(s.n)}</b></div>`}).join('')}</div>`;
  h+=`<div class="card"><h3>Trainingswoche</h3><p>${DAYS.filter(d=>days.includes(d)).map(d=>DNL[d]).join(', ')} · ${parseInt(a.dur)||45} min</p><p class="mut small">Jede Einheit: Aufwärmen, je eine Übung für Drücken, Ziehen, Beine und Rumpf, danach Dehnen. Erreichst du das Ziel einer Stufe in zwei Trainings hintereinander, schlägt die App den Aufstieg vor – du entscheidest.</p></div>`;
  const pal=calcPAL(a),bmr=calcBMR(a);
  if(pal)h+=`<div class="card"><h3>Dein Alltag</h3><div class="row between"><span>Aktivitätsfaktor (PAL)</span><b class="acc">${pal.toFixed(2).replace('.',',')}</b></div><p class="mut small" style="margin:6px 0 0">${pal<1.5?'Eher wenig Bewegung im Alltag.':pal<1.75?'Mäßig aktiv – typischer Durchschnitt.':pal<2?'Aktiv – du bewegst dich viel.':'Sehr aktiv – hoher Alltagsverbrauch.'}${bmr?` Grundumsatz ca. ${bmr} kcal, Alltagsverbrauch ca. <b>${Math.round(bmr*pal/10)*10} kcal</b> pro Tag (ohne Training).`:' Für kcal-Werte fehlen Größe, Gewicht oder Alter.'} Schätzwert – wird ab Version 2 an deinem Gewichtsverlauf nachjustiert.</p></div>`;
  if((a.limits||[]).length&&!a.limits.includes('Keine'))h+=`<div class="card warn"><b>Hinweis:</b> Du hast ${esc(a.limits.join(', '))} markiert. Bei Schmerzen Übung sofort auf leichter tauschen und im Zweifel ärztlich abklären lassen.</div>`;
 }
 for(const f of st.f){
  h+=`<label class="lbl">${esc(f.l)}</label>`;
  const v=a[f.k];
  if(f.type==='text')h+=`<input type="text" value="${esc(v||'')}" placeholder="${esc(f.ph||'')}" oninput="obSet('${f.k}',this.value)">`;
  else if(f.type==='area')h+=`<textarea placeholder="${esc(f.ph||'')}" oninput="obSet('${f.k}',this.value)">${esc(v||'')}</textarea>`;
  else if(f.type==='num')h+=`<input type="number" inputmode="decimal" step="${f.step||1}" value="${v??''}" oninput="obSet('${f.k}',this.value)">`;
  else if(f.type==='one')h+=f.o.map(x=>`<span class="chip ${v===x?'on':''}" onclick="obToggle('${f.k}',${esc(JSON.stringify(x))},0)">${esc(x)}</span>`).join('');
  else if(f.type==='multi')h+=f.o.map(x=>`<span class="chip ${(v||[]).includes(x)?'on':''}" onclick="obToggle('${f.k}',${esc(JSON.stringify(x))},1)">${esc(x)}</span>`).join('');
  else if(f.type==='equip')h+=EQUIP.map(x=>`<span class="chip ${(v||[]).includes(x.id)?'on':''}" onclick="obToggle('${f.k}','${x.id}',1)">${esc(x.n)}</span>`).join('');
  else if(f.type==='days'){h+=DAYS.map(d=>`<span class="chip ${(v||[]).includes(d)?'on':''}" onclick="obToggle('days',${d},1)">${DN[d]}</span>`).join('')+`<div style="margin-top:6px"><button class="btn sm ghost" onclick="M.ob.a.days=[1,3,6];if(!M.ob.a.dur)M.ob.a.dur='45 min';render()">Empfehlung: Mo / Mi / Sa · 45 min</button></div>`;}
 }
 h+=`<div class="row" style="margin-top:24px">${o.i>0?`<button class="btn ghost" onclick="obNext(-1)">Zurück</button>`:''}<button class="btn p" style="flex:1" onclick="obNext(1)">${st.result?'Los geht’s':'Weiter'}</button></div>`;
 if(!st.result&&o.i>0)h+=`<p class="mut small" style="text-align:center">Fragen ohne Antwort werden übersprungen.</p>`;
 return h;
}

/* ============ Training ============ */
function levelStep(chain){return stepOf(S.levels[chain]).s;}
function stepForLoc(chain,loc){const st=CHAINS[chain].steps,cur=st.findIndex(s=>s.id===S.levels[chain]);
 const eq=new Set(S.equip[loc]||[]);if(hasNeed(st[cur],eq))return st[cur].id;
 for(let j=cur;j>=0;j--)if(hasNeed(st[j],eq))return st[j].id;return st[cur].id;}
function lastSets(exId){for(let i=S.sessions.length-1;i>=0;i--){const it=S.sessions[i].items.find(x=>x.exId===exId);if(it&&it.sets.length)return it.sets;}return null;}
function newItem(chain,exId){const s=stepOf(exId).s,n=setsCount(),last=lastSets(exId);
 return{chain,exId,rating:null,sets:Array.from({length:n},(_,i)=>({v:last&&last[i]!=null?last[i]:s.g,done:false}))};}
function startWorkout(loc){
 S.active={date:today(),start:Date.now(),loc,warm:WARM.map(()=>false),cool:coolList().map(()=>false),items:ORDER.map(k=>newItem(k,stepForLoc(k,loc)))};
 save();M.tab='training';render();window.scrollTo(0,0);unlockAudio();
}
function coolList(){const l=COOL.slice(),p=S.profile||{};if(p.t_toes&&p.t_toes!=='Ja')l.push('Vorbeuge im Sitzen – 45 s (Beweglichkeit)');if(p.t_deep==='Nein')l.push('Tiefe Hocke halten, an etwas festhalten – 60 s');return l;}
function swapEx(ix,dir){const it=S.active.items[ix],st=CHAINS[it.chain].steps,eq=new Set(S.equip[S.active.loc]||[]);let i=st.findIndex(s=>s.id===it.exId);
 for(let j=i+dir;j>=0&&j<st.length;j+=dir){if(hasNeed(st[j],eq)){S.active.items[ix]=newItem(it.chain,st[j].id);save();render();return;}}
 toast(dir<0?'Keine leichtere Variante verfügbar':'Keine schwerere Variante mit deinen Geräten');}
function setVal(ix,si,v){const s=S.active.items[ix].sets[si];s.v=Math.max(0,Math.round(v));save();render();}
function toggleSet(ix,si){const it=S.active.items[ix],s=it.sets[si];s.done=!s.done;save();
 if(s.done){const isLast=it.sets.every(x=>x.done);startRest(it.exId,isLast&&ix===S.active.items.length-1?0:null);}
 render();}
function rate(ix,r){S.active.items[ix].rating=S.active.items[ix].rating===r?null:r;save();render();}
function tick(list,i){S.active[list][i]=!S.active[list][i];save();render();}
function finishWorkout(){
 const a=S.active,done=a.items.filter(it=>it.sets.some(s=>s.done));
 if(!done.length){toast('Noch kein Satz abgehakt');return;}
 const sess={date:a.date,loc:a.loc,min:Math.round((Date.now()-a.start)/60000),items:a.items.map(it=>({chain:it.chain,exId:it.exId,rating:it.rating,sets:it.sets.filter(s=>s.done).map(s=>s.v)}))};
 // Aufstieg vorschlagen, wenn das Ziel in 2 Trainings hintereinander erreicht wurde
 const met=it=>{const s=stepOf(it.exId).s;return it.sets.length>=setsCount()&&it.sets.every(v=>v>=s.g)&&it.rating!=='schwer';};
 const prevItem=exId=>{for(let i=S.sessions.length-1;i>=0;i--){const x=S.sessions[i].items.find(y=>y.exId===exId&&y.sets.length);if(x)return x;}return null;};
 sess.items.forEach(it=>{if(it.exId!==S.levels[it.chain]||!nextStep(it.chain)||!met(it))return;const pv=prevItem(it.exId);if(pv&&met(pv))S.pending[it.chain]=true;});
 S.sessions.push(sess);
 S.active=null;stopRest();save();M.tab='heute';render();window.scrollTo(0,0);toast('Training gespeichert 💪');
}
function cancelWorkout(){if(M.cancelArm){S.active=null;stopRest();save();M.cancelArm=false;render();}else{M.cancelArm=true;render();setTimeout(()=>{M.cancelArm=false;},4000);}}
function nextStep(chain){const st=CHAINS[chain].steps,eq=allEquip();let i=st.findIndex(s=>s.id===S.levels[chain]);for(let j=i+1;j<st.length;j++)if(hasNeed(st[j],eq))return st[j];return null;}
function prevStep(chain){const st=CHAINS[chain].steps,eq=allEquip();let i=st.findIndex(s=>s.id===S.levels[chain]);for(let j=i-1;j>=0;j--)if(hasNeed(st[j],eq))return st[j];return null;}
function levelUp(chain,yes){if(yes){const n=nextStep(chain);if(n){S.levels[chain]=n.id;toast('Neue Stufe: '+n.n);}}delete S.pending[chain];save();render();}
function setLevel(chain,dir){const n=dir>0?nextStep(chain):prevStep(chain);if(n){S.levels[chain]=n.id;delete S.pending[chain];save();render();}}

/* ============ Pausentimer (zeitbasiert, übersteht Sperrbildschirm) ============ */
let actx=null,tInt=null;
function unlockAudio(){try{if(!actx){actx=new (window.AudioContext||window.webkitAudioContext)();}if(actx.state==='suspended')actx.resume();}catch(e){}}
function beep(){try{unlockAudio();[0,.25,.5].forEach(t=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+t+.2);o.start(actx.currentTime+t);o.stop(actx.currentTime+t+.21);});}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(e){}}
function startRest(exId,force){unlockAudio();const sec=force===0?0:(S.rest[exId]||baseRest());if(!sec){stopRest();return;}
 S.timer={exId,end:Date.now()+sec*1000,beeped:false};save();runTimer();}
function adjRest(d){if(!S.timer)return;S.timer.end+=d*1000;const ex=S.timer.exId;S.rest[ex]=Math.max(15,(S.rest[ex]||baseRest())+d);S.timer.beeped=false;save();drawTimer();}
function stopRest(){S.timer=null;save();drawTimer();}
function runTimer(){if(!tInt)tInt=setInterval(drawTimer,250);drawTimer();}
function drawTimer(){const el=$('#timer');if(!S||!S.timer){el.className='hidden';return;}
 const left=(S.timer.end-Date.now())/1000,ex=stepOf(S.timer.exId);
 if(left<=0&&!S.timer.beeped){S.timer.beeped=true;save();beep();}
 if(left<-60){stopRest();return;}
 el.className=left<=0?'end':'';
 el.innerHTML=`<div class="t">${left>0?mmss(left):'Los!'}</div><div style="flex:1;font-size:13px" class="mut">${left>0?'Pause · '+esc(ex?ex.s.n:''):'Pause vorbei – nächster Satz'}</div>
 <button class="btn sm" onclick="adjRest(-15)">−15</button><button class="btn sm" onclick="adjRest(15)">+15</button><button class="btn sm p" onclick="stopRest()">✕</button>`;}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)drawTimer();});

/* ============ Streak ============ */
function streakInfo(){
 const target=Math.max(1,S.plan.days.length),cnt={};S.sessions.forEach(s=>{const k=weekKey(s.date);cnt[k]=(cnt[k]||0)+1;});
 const cur=weekKey(today()),startK=weekKey(S.created);let st=0,k=addDays(cur,-7),changed=false;
 if((cnt[cur]||0)>=target)st++;
 while(k>=startK){const c=cnt[k]||0;
  if(c>=target)st++;
  else{const m=k.slice(0,7),prevOk=(cnt[addDays(k,-7)]||0)>=target;
   if(k!==startK&&prevOk&&(!S.jokers[m]||S.jokers[m]===k)){if(S.jokers[m]!==k){S.jokers[m]=k;changed=true;}st++;}else break;}
  k=addDays(k,-7);}
 if(changed)save();
 return{st,cur:cnt[cur]||0,target,joker:!S.jokers[today().slice(0,7)]};
}

/* ============ Ansichten ============ */
const ICON={
 heute:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
 training:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/></svg>',
 essen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v8a2 2 0 002 2v8M11 3v6M3 3v6a4 4 0 004 4M17 21V3c2 0 4 2 4 6s-2 5-4 5"/></svg>',
 fortschritt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18M6 16l4-5 4 3 5-7"/></svg>',
 profil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>'};
const TABN={heute:'Heute',training:'Training',essen:'Ernährung',fortschritt:'Fortschritt',profil:'Profil'};
function go(t){M.tab=t;render();window.scrollTo(0,0);}

function vHeute(){
 const p=S.profile||{},d=new Date(),isTr=S.plan.days.includes(d.getDay()),si=streakInfo(),wk=weekKey(today());
 const doneDays=new Set(S.sessions.filter(s=>weekKey(s.date)===wk).map(s=>new Date(s.date+'T12:00:00').getDay()));
 let h=`<p class="mut small" style="margin:6px 0 0">${DNL[d.getDay()]}, ${d.getDate()}.${d.getMonth()+1}.</p><h1>Servus${p.name?' '+esc(p.name):''} 👋</h1>`;
 h+=`<div class="week" style="margin-top:12px">${DAYS.map(x=>`<div class="${S.plan.days.includes(x)?'tr':''} ${doneDays.has(x)?'done':''} ${x===d.getDay()?'today':''}">${DN[x]}</div>`).join('')}</div>`;
 if(S.active)h+=`<div class="card hi row between"><div><b>Training läuft</b><div class="mut small">Seit ${mmss((Date.now()-S.active.start)/1000)} min</div></div><button class="btn p" onclick="go('training')">Weiter</button></div>`;
 for(const k of Object.keys(S.pending||{})){const cur=levelStep(k),n=nextStep(k);if(!n)continue;
  h+=`<div class="card hi"><b>${CHAINS[k].ic} Stufe geschafft!</b><p class="small" style="margin:6px 0 10px">Du hast das Ziel bei <b>${esc(cur.n)}</b> (${goalTxt(cur,setsCount())}) erreicht. Aufsteigen zu <b class="acc">${esc(n.n)}</b>?</p><div class="row"><button class="btn p" onclick="levelUp('${k}',1)">Aufsteigen</button><button class="btn ghost" onclick="levelUp('${k}',0)">Noch nicht</button></div></div>`;}
 if(S.sessions.length&&(!S.lastBackup||(Date.now()-S.lastBackup)>7*864e5))h+=`<div class="card warn row between"><div class="small"><b>Backup fällig</b><br><span class="mut">Sichere deine Daten einmal pro Woche.</span></div><button class="btn o sm" onclick="exportData()">Sichern</button></div>`;
 h+=`<div class="grid2" style="margin-top:10px"><div class="stat"><div class="mut small">Wochen-Streak 🔥</div><div class="big-num">${si.st}</div><div class="mut small">Joker diesen Monat: ${si.joker?'1 frei':'verbraucht'}</div></div><div class="stat"><div class="mut small">Diese Woche</div><div class="big-num">${si.cur}<span class="mut" style="font-size:20px">/${si.target}</span></div><div class="prog" style="margin-top:8px"><i style="width:${Math.min(100,si.cur/si.target*100)}%"></i></div></div></div>`;
 const doneToday=S.sessions.some(s=>s.date===today());
 h+=`<h2>${isTr?'Heute: Ganzkörper-Training':'Heute: Ruhetag'}</h2>`;
 if(doneToday)h+=`<div class="card hi"><b>✅ Heute schon trainiert.</b> <span class="mut">Stark. Jetzt erholen, essen, schlafen.</span></div>`;
 if(!isTr&&!doneToday)h+=`<div class="card"><p style="margin:0">Erholung ist Teil des Trainings – hier wachsen die Muskeln. Ein Spaziergang oder lockeres Dehnen passt perfekt.</p></div>`;
 if(!S.active&&!doneToday){
  h+=`<div class="card">${ORDER.map(k=>{const s=levelStep(k);return `<div class="row between" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${CHAINS[k].ic} ${esc(s.n)}</span><span class="mut small">${goalTxt(s,setsCount())}</span></div>`}).join('')}
  <p class="mut small" style="margin:10px 0">Wo trainierst du ${isTr?'heute':'zusätzlich'}?</p>
  <div class="row"><button class="btn ${isTr?'p':''} big" style="flex:1" onclick="startWorkout('home')">🏠 Daheim</button><button class="btn big" style="flex:1" onclick="startWorkout('park')">🌳 Park</button></div></div>`;}
 return h;
}

function vTraining(){
 if(!S.active){
  let h=`<h1>Training</h1><p class="mut">Deine aktuellen Stufen. Tippe eine Übung an für Erklärung und Video.</p>`;
  h+=`<button class="btn p big" onclick="startWorkout('home')">Workout starten (Daheim)</button><div style="height:8px"></div><button class="btn big" onclick="startWorkout('park')">Workout starten (Park)</button>`;
  h+=`<h2>Übungsbibliothek</h2>`;
  for(const k of ORDER){const st=CHAINS[k].steps,cur=st.findIndex(s=>s.id===S.levels[k]);
   h+=`<div class="card"><h3>${CHAINS[k].ic} ${CHAINS[k].n}</h3>${st.map((s,i)=>`<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="row between" onclick="M.open['L${s.id}']=!M.open['L${s.id}'];render()" style="cursor:pointer"><span class="${i===cur?'acc':i<cur?'mut':''}">${i+1}. ${esc(s.n)}${i===cur?' ◀':''}</span><span class="mut small">${goalTxt(s,setsCount())}</span></div>${M.open['L'+s.id]?exDetail(s):''}</div>`).join('')}</div>`;}
  return h;}
 const a=S.active;let h=`<div class="row between"><h1>${a.loc==='park'?'🌳 Park':'🏠 Daheim'}</h1><span class="mut small">${setsCount()} Sätze · Pause ${baseRest()} s</span></div>`;
 h+=`<div class="card"><h3>1. Aufwärmen (5 min)</h3>${WARM.map((w,i)=>`<div class="check ${a.warm[i]?'on':''}" onclick="tick('warm',${i})"><div class="box">${a.warm[i]?'✓':''}</div><span>${esc(w)}</span></div>`).join('')}</div>`;
 h+=`<h2>2. Hauptteil</h2>`;
 const lim=((S.profile||{}).limits||[]).filter(x=>x!=='Keine');
 a.items.forEach((it,ix)=>{const s=stepOf(it.exId).s,last=lastSets(it.exId),done=it.sets.every(x=>x.done),isLvl=it.exId===S.levels[it.chain];
  h+=`<div class="card ${done?'hi':''}"><div class="row between"><div><span class="tag">${CHAINS[it.chain].ic} ${CHAINS[it.chain].n}</span>${isLvl?'':'<span class="tag" style="color:var(--org)">getauscht</span>'}<h3 style="margin-top:6px">${esc(a.loc==='park'&&s.park?s.park:s.n)}</h3><div class="mut small">Ziel ${goalTxt(s,setsCount())}${last?' · Letztes Mal: '+last.join(', '):''}</div></div></div>
  <div class="row wrap" style="margin:8px 0 2px"><button class="btn sm" onclick="M.open['W${ix}']=!M.open['W${ix}'];render()">ℹ️ Anleitung & Video</button><button class="btn sm" onclick="swapEx(${ix},-1)">⬇ leichter</button><button class="btn sm" onclick="swapEx(${ix},1)">⬆ schwerer</button></div>
  ${M.open['W'+ix]?exDetail(s):''}
  ${it.sets.map((st,si)=>`<div class="set ${st.done?'ok':''}"><span class="mut small">Satz ${si+1}</span><button class="pm" onclick="setVal(${ix},${si},${st.v-(s.t==='s'?5:1)})">−</button><input type="number" inputmode="numeric" value="${st.v}" onchange="setVal(${ix},${si},+this.value||0)" aria-label="${unit(s)}"><button class="pm" onclick="setVal(${ix},${si},${st.v+(s.t==='s'?5:1)})">+</button><button class="ck" onclick="toggleSet(${ix},${si})">✓</button></div>`).join('')}
  <div class="mut small" style="text-align:center">${unit(s)}${s.u?' pro Seite':''}</div>
  ${it.sets.some(x=>x.done)?`<div class="row" style="margin-top:10px;gap:6px"><span class="small mut" style="flex:none">Gefühl:</span>${[['leicht','zu leicht'],['passt','passt'],['schwer','zu schwer']].map(([k,l])=>`<span class="chip ${it.rating===k?'on':''}" style="margin:0" onclick="rate(${ix},'${k}')">${l}</span>`).join('')}</div>`:''}
  </div>`;});
 if(lim.length)h+=`<p class="mut small">⚠️ Achte auf: ${esc(lim.join(', '))}. Bei Schmerz Übung auf „leichter“ tauschen.</p>`;
 const cl=coolList();
 h+=`<div class="card"><h3>3. Dehnen (5 min)</h3>${cl.map((w,i)=>`<div class="check ${a.cool[i]?'on':''}" onclick="tick('cool',${i})"><div class="box">${a.cool[i]?'✓':''}</div><span>${esc(w)}</span></div>`).join('')}</div>`;
 h+=`<button class="btn p big" onclick="finishWorkout()">Training beenden & speichern</button><div style="height:10px"></div><button class="btn danger big" onclick="cancelWorkout()">${M.cancelArm?'Wirklich verwerfen? Nochmal tippen':'Training verwerfen'}</button><div style="height:90px"></div>`;
 return h;
}
function exDetail(s){const vid=S.videos[s.id];
 return `<div style="margin-top:8px"><ul class="cues">${s.c.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
 ${vid?`<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}?playsinline=1&rel=0" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:''}
 <div class="row wrap" style="margin-top:10px"><a class="btn sm" href="https://www.youtube.com/results?search_query=${encodeURIComponent(s.q)}" target="_blank" rel="noopener">🔎 Video auf YouTube suchen</a>
 <button class="btn sm ghost" onclick="setVideo('${s.id}')">${vid?'Video ändern':'📌 Video-Link einfügen'}</button></div>
 ${M.vidEdit===s.id?`<div class="row" style="margin-top:8px"><input type="url" id="vidin" placeholder="YouTube-Link einfügen"><button class="btn p sm" onclick="saveVideo('${s.id}')">OK</button></div>`:''}</div>`;}
function setVideo(id){M.vidEdit=M.vidEdit===id?null:id;render();setTimeout(()=>{const i=$('#vidin');i&&i.focus();},50);}
function saveVideo(id){const v=$('#vidin').value.trim();if(!v){delete S.videos[id];}else{const y=ytId(v);if(!y){toast('Kein gültiger YouTube-Link');return;}S.videos[id]=y;}M.vidEdit=null;save();render();toast('Video gespeichert');}

function vEssen(){const p=S.profile||{};
 return `<h1>Ernährung</h1><div class="card hi"><h3>Kommt in Version 2</h3><ul class="cues"><li>Essen per Foto erfassen (Google Gemini), Werte vor dem Speichern korrigierbar</li><li>Barcode-Scan über Open Food Facts</li><li>Gespeicherte Mealprep-Gerichte mit einem Tap</li><li>Kalorien- und Eiweißziel, Anzeige „noch übrig“</li><li>Wasser-Tracker und täglicher Essens-Streak</li></ul></div>
 <div class="card"><h3>Deine Angaben</h3><p class="small mut" style="margin:0">Ziel: ${esc(p.goal||'–')} · Mahlzeiten: ${esc(p.meals||'–')} · Mealprep: ${esc(p.prep||'–')}${p.noeat?'<br>Isst nicht: '+esc(p.noeat):''}</p></div>`;}

function vFortschritt(){
 const si=streakInfo();let h=`<h1>Fortschritt</h1>`;
 h+=`<div class="grid2"><div class="stat"><div class="mut small">Wochen-Streak</div><div class="big-num">${si.st} 🔥</div></div><div class="stat"><div class="mut small">Trainings gesamt</div><div class="big-num">${S.sessions.length}</div></div></div>`;
 // Heatmap 12 Wochen
 const start=addDays(weekKey(today()),-77),dset=new Set(S.sessions.map(s=>s.date));let cells='';
 for(let i=0;i<84;i++){const d=addDays(start,i);cells+=`<i class="${dset.has(d)?'d':''} ${d>today()?'f':''}" title="${d}"></i>`;}
 h+=`<div class="card"><h3>Letzte 12 Wochen</h3><div class="heat">${cells}</div></div>`;
 h+=`<h2>Stufen</h2>`;
 for(const k of ORDER){const st=CHAINS[k].steps,eq=allEquip(),cur=st.findIndex(s=>s.id===S.levels[k]);
  h+=`<div class="card"><div class="row between"><b>${CHAINS[k].ic} ${CHAINS[k].n}</b><span class="mut small">Stufe ${cur+1} / ${st.length}</span></div><div class="acc" style="margin-top:4px;font-weight:700">${esc(st[cur].n)}</div>
  <div class="lvl">${st.map((s,i)=>`<i class="${i<cur?'on':i===cur?'cur':''}" style="${hasNeed(s,eq)?'':'opacity:.25'}"></i>`).join('')}</div>
  <div class="row" style="margin-top:10px"><button class="btn sm ghost" onclick="setLevel('${k}',-1)">◀ Stufe runter</button><button class="btn sm ghost" onclick="setLevel('${k}',1)">Stufe rauf ▶</button></div></div>`;}
 // Gewicht
 const ws=S.weights.slice().sort((a,b)=>a.d<b.d?-1:1);
 h+=`<h2>Körpergewicht</h2><div class="card"><div class="row"><input type="number" inputmode="decimal" step="0.1" id="kg" placeholder="kg heute"><button class="btn p" onclick="addWeight()">Eintragen</button></div>${weightChart(ws)}</div>`;
 // Bestleistungen
 const best={};S.sessions.forEach(s=>s.items.forEach(it=>{const m=Math.max(0,...it.sets);if(!best[it.exId]||m>best[it.exId])best[it.exId]=m;}));
 const bk=Object.keys(best);
 if(bk.length)h+=`<h2>Bestleistungen</h2><div class="card">${bk.map(id=>{const s=stepOf(id).s;return `<div class="row between" style="padding:6px 0"><span>${esc(s.n)}</span><b>${best[id]} ${unit(s)}</b></div>`}).join('')}</div>`;
 if(S.sessions.length)h+=`<h2>Verlauf</h2>${S.sessions.slice(-10).reverse().map(s=>`<div class="card"><div class="row between"><b>${fmtDate(s.date)}</b><span class="mut small">${s.loc==='park'?'🌳 Park':'🏠 Daheim'} · ${s.min} min</span></div>${s.items.filter(i=>i.sets.length).map(i=>`<div class="small" style="margin-top:4px">${esc(stepOf(i.exId).s.n)}: <span class="mut">${i.sets.join(' / ')}${i.rating?' · '+(i.rating==='leicht'?'zu leicht':i.rating==='schwer'?'zu schwer':'passt'):''}</span></div>`).join('')}</div>`).join('')}`;
 return h;
}
function weightChart(ws){if(!ws.length)return `<p class="mut small">Noch keine Einträge. Am besten 1–2× pro Woche morgens wiegen.</p>`;
 const last=ws[ws.length-1],l=ws.slice(-30);let svg='';
 if(l.length>1){const min=Math.min(...l.map(w=>w.kg))-0.5,max=Math.max(...l.map(w=>w.kg))+0.5,W=300,H=110;
  const pts=l.map((w,i)=>[i/(l.length-1)*(W-10)+5,H-5-(w.kg-min)/(max-min)*(H-10)]);
  svg=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;margin-top:12px"><polyline fill="none" stroke="#c6ff3d" stroke-width="2.5" stroke-linejoin="round" points="${pts.map(p=>p.join(',')).join(' ')}"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#c6ff3d"/>`).join('')}</svg><div class="row between mut small"><span>${fmtDate(l[0].d)} · ${l[0].kg} kg</span><span>${(last.kg-l[0].kg>0?'+':'')+(last.kg-l[0].kg).toFixed(1)} kg</span></div>`;}
 return `<p style="margin:10px 0 0">Aktuell: <b>${last.kg} kg</b> <span class="mut small">(${fmtDate(last.d)})</span></p>${svg}`;}
function addWeight(){const v=num($('#kg').value);if(!v||v<30||v>250){toast('Bitte Gewicht in kg eingeben');return;}
 S.weights=S.weights.filter(w=>w.d!==today());S.weights.push({d:today(),kg:v});save();render();toast('Gewicht gespeichert');}

function vProfil(){const p=S.profile||{};
 let h=`<h1>Profil</h1><div class="card"><b>${esc(p.name||'Du')}</b><p class="mut small" style="margin:4px 0 0">Ziel: ${esc(p.goal||'–')}${p.skills&&p.skills.length?' · Skills: '+esc(p.skills.join(', ')):''}${p.goal3?'<br>3-Monats-Ziel: '+esc(p.goal3):''}</p></div>`;
 h+=`<h2>Trainingswoche</h2><div class="card"><label class="lbl" style="margin-top:0">Trainingstage</label>${DAYS.map(d=>`<span class="chip ${S.plan.days.includes(d)?'on':''}" onclick="togDay(${d})">${DN[d]}</span>`).join('')}
 <label class="lbl">Dauer pro Einheit</label>${[20,30,45,60].map(d=>`<span class="chip ${S.plan.dur===d?'on':''}" onclick="S.plan.dur=${d};save();render()">${d} min</span>`).join('')}
 <label class="lbl">Pausen</label>${[['kurz','kurz (60 s)'],['mittel','mittel (90 s)'],['ruhig','lang (120 s)']].map(([k,l])=>`<span class="chip ${S.plan.style===k?'on':''}" onclick="S.plan.style='${k}';save();render()">${l}</span>`).join('')}</div>`;
 h+=`<h2>Geräte</h2>`;['home','park'].forEach(loc=>{h+=`<div class="card"><b>${loc==='home'?'🏠 Daheim':'🌳 Park'}</b><div style="margin-top:6px">${EQUIP.map(x=>`<span class="chip ${(S.equip[loc]||[]).includes(x.id)?'on':''}" onclick="togEq('${loc}','${x.id}')">${esc(x.n)}</span>`).join('')}</div></div>`;});
 h+=`<h2>Daten</h2><div class="card"><p class="small mut" style="margin-top:0">Deine Daten liegen nur auf diesem iPhone. Sichere sie regelmäßig als Datei (z. B. in iCloud Drive).${S.lastBackup?' Letztes Backup: '+new Date(S.lastBackup).toLocaleDateString('de-AT'):''}</p>
 <div class="row wrap"><button class="btn p" onclick="exportData()">Backup speichern</button><label class="btn ghost">Backup laden<input type="file" accept=".json,application/json" style="display:none" onchange="importData(this)"></label></div></div>`;
 h+=`<div class="card"><div class="row wrap"><button class="btn" onclick="obStart(1)">Einstufungstest wiederholen</button><button class="btn" onclick="obStart(0)">Einrichtung neu starten</button></div>
 <p class="mut small">Empfehlung: Einstufungstest alle 6–8 Wochen.</p><hr><button class="btn danger" onclick="resetAll()">${M.resetArm?'Wirklich ALLES löschen? Nochmal tippen':'Alle Daten löschen'}</button></div>
 <p class="mut small" style="text-align:center">AUFSTIEG · Version 1.1</p>`;
 return h;}
function togDay(d){const i=S.plan.days.indexOf(d);if(i>=0)S.plan.days.splice(i,1);else S.plan.days.push(d);save();render();}
function togEq(loc,id){const a=S.equip[loc]=S.equip[loc]||[],i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);
 ORDER.forEach(k=>{const st=CHAINS[k].steps;S.levels[k]=fixLevel(k,st.findIndex(s=>s.id===S.levels[k]),allEquip());});save();render();}
function exportData(){S.lastBackup=Date.now();save();const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(b);a.download='aufstieg-backup-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);render();toast('Backup erstellt');}
function importData(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.levels||!d.sessions)throw 0;S=d;save();render();toast('Backup geladen');}catch(e){toast('Datei ist kein gültiges Backup');}};r.readAsText(f);}
function resetAll(){if(M.resetArm){try{localStorage.removeItem(KEY);}catch(e){}S=null;M.resetArm=false;obStart(0);}else{M.resetArm=true;render();setTimeout(()=>{M.resetArm=false;},4000);}}

/* ============ Render ============ */
function render(){
 const y=window.scrollY;
 if(!S||M.ob){if(!M.ob)obStart(0);document.body.classList.add('hide-tabs');$('#app').innerHTML=renderOB();return;}
 document.body.classList.remove('hide-tabs');
 const v={heute:vHeute,training:vTraining,essen:vEssen,fortschritt:vFortschritt,profil:vProfil}[M.tab]();
 $('#app').innerHTML=v;window.scrollTo(0,y);
 $('#tabs').innerHTML=Object.keys(TABN).map(t=>`<button class="${M.tab===t?'on':''}" onclick="go('${t}')">${ICON[t]}${TABN[t]}</button>`).join('');
 drawTimer();
}
document.addEventListener('touchstart',unlockAudio,{once:true});
if(S&&S.timer)runTimer();
render();
if('serviceWorker' in navigator&&location.protocol==='https:'&&!/claude/.test(location.hostname)){navigator.serviceWorker.register('sw.js').catch(()=>{});}
