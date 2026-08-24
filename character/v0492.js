
/* Confluence Character v0.4.9.2 — Combat Cards, Rich Power Text, Attack Milestones */
let COMBAT_EXPANDED_POWER=null;

function v0492Esc(value){
 return String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}

function v0492InlineMarkup(text){
 let s=v0492Esc(String(text??''));
 s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
 s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
 s=s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<em>$2</em>');
 return s;
}
function formatPowerRichText(value,id){
 let raw=replaceModifierReferences(asText(value),id)||'';
 // Make inline named riders such as **Expose** easier to scan even if the source
 // author did not insert a blank line before them.
 raw=raw.replace(/\s+\*\*([A-Z][^*\n]{1,35}:?)\*\*\s+/g,'\n\n**$1** ');
 const lines=raw.replace(/\r/g,'').split('\n');
 const blocks=[];let paragraph=[],bullets=[];
 const flushParagraph=()=>{if(paragraph.length){blocks.push(`<p>${v0492InlineMarkup(paragraph.join(' '))}</p>`);paragraph=[]}};
 const flushBullets=()=>{if(bullets.length){blocks.push(`<ul>${bullets.map(x=>`<li>${v0492InlineMarkup(x)}</li>`).join('')}</ul>`);bullets=[]}};
 for(const rawLine of lines){
   const line=rawLine.trim();
   if(!line){flushParagraph();flushBullets();continue}
   if(/^[-•]\s+/.test(line)){flushParagraph();bullets.push(line.replace(/^[-•]\s+/,''));continue}
   flushBullets();paragraph.push(line);
 }
 flushParagraph();flushBullets();
 return `<div class="power-rich-text">${blocks.join('')}</div>`;
}
powerSections=function(p,id){
 const r=p.profile?.resolution||p.resolution||{},attack=r.attack||r.attacks?.[0];
 const attackText=powerField(p,'text.attack','attack_text')||(attack?`Power Attack vs. ${String(attack.defense||'Defense')}`:'');
 const hit=powerField(p,'text.hit','hit_text')||r.hit;
 const miss=powerField(p,'text.miss','miss_text')||r.miss;
 const effect=powerField(p,'text.effect','effect_text')||p.profile?.effects||p.effects;
 const special=powerField(p,'text.special','special_text','special_rules');
 const sustain=powerField(p,'text.sustain','sustain_text');
 return [['Attack',attackText,'attack'],['Hit',hit,'hit'],['Miss',miss,'miss'],['Effect',effect,'effect'],['Special',special,'special'],['Sustain',sustain,'special']]
   .filter(x=>asText(x[1])).map(([label,val,cls])=>`<div class="power-text-section ${cls}"><b>${label}</b>${formatPowerRichText(val,id)}</div>`).join('');
};

function v0492PowerKeywords(id){
 const p=resolvedPowerModel(id)||pdef(id)||{};
 const raw=p.classification?.keywords||p.classification?.traits||p.keywords||p.traits||[];
 return (Array.isArray(raw)?raw:String(raw).split(',')).map(x=>String(x).trim().toLowerCase()).filter(Boolean);
}
function v0492KeywordAttackBonus(id){
 const keys=new Set(v0492PowerKeywords(id));
 return allEssenceProgressionEffects()
  .filter(e=>e.type==='modify_power_attack_keyword'&&keys.has(String(e.target||'').trim().toLowerCase()))
  .reduce((sum,e)=>sum+(Number(e.amount)||0),0);
}
function v0492RoundAttackBonus(){
 if(!state.combat.active)return 0;
 return allEssenceProgressionEffects()
  .filter(e=>e.type==='modify_round_attack'&&Number(e.target||e.round)===Number(state.combat.round))
  .reduce((sum,e)=>sum+(Number(e.amount)||0),0);
}
const powerAttackBonusV0492Base=powerAttackBonus;
powerAttackBonus=function(id){
 const base=powerAttackBonusV0492Base(id),keywordBonus=v0492KeywordAttackBonus(id),roundBonus=v0492RoundAttackBonus();
 return {...base,keywordBonus,roundBonus,mastery:(Number(base.mastery)||0)+keywordBonus+roundBonus,total:(Number(base.total)||0)+keywordBonus+roundBonus};
};
const weaponAttackV0492Base=weaponAttack;
weaponAttack=function(item){
 const base=weaponAttackV0492Base(item),roundBonus=v0492RoundAttackBonus();
 if(!roundBonus)return base;
 const add=x=>x?{...x,toHit:x.toHit+roundBonus,essenceAttack:(Number(x.essenceAttack)||0)+roundBonus,roundBonus}:x;
 return {...base,normal:add(base.normal),thrown:add(base.thrown)};
};

function v0492PowerSummaryFields(id){
 const source=pdef(id),p=resolvedPowerModel(id)||source,m=powerMeta(source),ess=sourceEssenceForPower(id),atk=powerAttackBonus(id);
 if(!p||!m)return null;
 const r=p.profile?.resolution||p.resolution||{},attack=r.attack||r.attacks?.[0];
 const frequency=powerField(p,'classification.frequency','slot.frequency')||m.frequency||'Special';
 const action=powerField(p,'activation.action_type','action_type')||'';
 const range=powerField(p,'attack_type_range','targeting.range.origin','range')||'';
 const target=powerField(p,'target','targeting.target.selector')||'';
 const keywords=powerField(p,'classification.keywords','classification.traits','keywords','traits')||[];
 const cost=powerResourceCost(id).map(c=>c.label).join(' + ');
 return {source,p,m,ess,atk,attack,frequency,action,range,target,keywords:Array.isArray(keywords)?keywords:String(keywords).split(',').map(x=>x.trim()).filter(Boolean),cost};
}
function combatPowerCardV0492(id){
 const f=v0492PowerSummaryFields(id),cp=state.powers[id];if(!f||!cp)return '';
 const {p,m,ess,atk,attack,frequency,action,range,target,keywords,cost}=f;
 const expanded=COMBAT_EXPANDED_POWER===id;
 const freq=String(frequency).toLowerCase()==='encounter'?'Resource Power':String(frequency);
 const expended=powerFrequency(id)==='daily'&&state.combat.dailyExpended?.[id];
 const quick=[action,range,target].filter(Boolean).join(' · ');
 const attackSummary=attack?`${signed(atk.total)} vs ${String(attack.defense||'Defense').toUpperCase()}`:'No attack roll';
 const rankEffects=(p.resolved_rank_effects||[]);
 return `<article class="combat-power-card v0492 ${expanded?'is-expanded':''} ${expended?'is-expended':''}" data-combat-card="${id}">
   <div class="combat-card-toggle" data-combat-toggle="${id}">
    <div class="combat-card-head"><div><div class="eyebrow">${ess||'No Essence'} · SLOT ${m.slot} · ${String(freq).toUpperCase()}</div><h3>${p.name}</h3></div><span class="combat-chevron">${expanded?'▲':'▼'}</span></div>
    ${expended?'<div class="expended-banner">DAILY EXPENDED</div>':''}
    <div class="combat-collapsed-summary">${quick?`<span>${quick}</span>`:''}<strong>${attackSummary}</strong></div>
   </div>
   ${expanded?`<div class="combat-expanded-body">
      ${keywords.length?`<div class="meta">${keywords.map(k=>`<span class="tag">${v0492Esc(k)}</span>`).join('')}</div>`:''}
      ${attack?`<div class="roll-callout"><span class="roll-label">TO HIT</span><strong>${signed(atk.total)}</strong><span>vs ${String(attack.defense||'Defense').toUpperCase()}</span><div class="roll-instruction">Roll 1d20 ${signed(atk.total)}</div></div>
       <details class="math-breakdown"><summary>Attack math</summary><div>Rank Bonus ${signed(atk.rankBonus||0)} · Power Rank ${atk.powerRank||1} → ${signed(atk.powerRankBonus||0)} · Ability ${signed(atk.abilityBonus)} · Essence/Milestones ${signed(atk.mastery||0)}${atk.roundBonus?` · Round ${signed(atk.roundBonus)}`:''} · Active ${signed(atk.manual||0)} · Conditions ${signed(atk.condition||0)}</div></details>`:''}
      <div class="combat-power-sections">${powerSections(p,id)}</div>
      ${rankEffects.length?`<div class="current-rank-effects"><b>Current Rank Effects</b>${formatPowerRichText(rankEffects.map(effectText).join('\n- '),id)}</div>`:''}
      <div class="combat-card-actions">${cost?`<span class="cost-chip">${cost}</span>`:''}${powerUseButton(id)}<button type="button" data-open-full-power="${id}">View Full Power</button></div>
    </div>`:''}
 </article>`;
}

const renderCombatV0492Base=renderCombat;
renderCombat=function(max,ds){
 renderCombatV0492Base(max,ds);
 const readyIds=[...new Set(Object.values(state.loadout).filter(Boolean))];
 const el=document.getElementById('combatPowers');
 if(el)el.innerHTML=readyIds.length?readyIds.map(combatPowerCardV0492).join(''):'<div class="empty">No Essence Powers are readied. Choose Powers in the Current Loadout.</div>';
};

function ensurePowerModal(){
 let modal=document.getElementById('powerDetailModal');if(modal)return modal;
 modal=document.createElement('div');modal.id='powerDetailModal';modal.className='power-modal hidden';
 modal.innerHTML=`<div class="power-modal-backdrop" data-close-power-modal="1"></div><section class="power-modal-dialog"><div class="power-modal-head"><div><div class="eyebrow">FULL POWER</div><h2 id="powerModalTitle">Power</h2></div><button type="button" data-close-power-modal="1">Close</button></div><div id="powerModalBody"></div></section>`;
 document.body.appendChild(modal);return modal;
}
function openFullPower(id){
 const modal=ensurePowerModal(),p=pdef(id);
 document.getElementById('powerModalTitle').textContent=p?.name||'Power';
 document.getElementById('powerModalBody').innerHTML=resolvedPowerCard(id,false);
 modal.classList.remove('hidden');document.body.classList.add('modal-open');
}
function closeFullPower(){
 document.getElementById('powerDetailModal')?.classList.add('hidden');document.body.classList.remove('modal-open');
}
document.addEventListener('click',e=>{
 const full=e.target.closest('[data-open-full-power]');if(full){e.preventDefault();e.stopPropagation();openFullPower(full.dataset.openFullPower);return}
 if(e.target.closest('[data-close-power-modal]')){e.preventDefault();closeFullPower();return}
 const card=e.target.closest('[data-combat-card]');
 if(card&&!e.target.closest('button,a,select,input,textarea,summary,details')){
   const id=card.dataset.combatCard;COMBAT_EXPANDED_POWER=COMBAT_EXPANDED_POWER===id?null:id;render();return;
 }
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFullPower()});
