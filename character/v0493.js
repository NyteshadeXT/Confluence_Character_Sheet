
/* Confluence Character v0.4.9.3 — Game Night Progression Corrections */

/* Skills are Rank 0 while Untrained and become Rank 1 when first Trained. */
renderTraining=function(){
 document.getElementById('training').innerHTML=Object.entries(TRAINING).map(([group,rows])=>`<div class="training-group"><div class="subhead">${group}</div>${rows.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([name,type,supports])=>{
  const t=training(name),sv=type==='skill'?skillValue(name):null;
  if(!supports){
   return `<div class="training-row no-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b><select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select></div>`;
  }
  const rank=t.status==='Untrained'?0:(t.rating||1);
  return `<div class="training-row has-rating ${t.status!=='Untrained'?'is-trained':''}">
    <b>${name}</b>
    <span class="training-total" title="Current total modifier">${sv?signed(sv.total):'—'}</span>
    <select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>
    <input class="training-rating" data-rating="${name}" type="number" min="${t.status==='Untrained'?0:1}" value="${rank}" ${t.status==='Untrained'?'disabled':''}>
    ${sv?`<details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Rank ${rank} · Active ${signed(sv.manual)} · Conditions ${signed(sv.condition)}${sv.essence!=null?` · Essence ${signed(sv.essence)}`:''}</span></details>`:''}
  </div>`;
 }).join('')}</div>`).join('');
};

/* An Essence always begins at Rank 1. Power advancement adds progress above that baseline. */
essenceInfo=function(name){
 const slots=[];
 for(let i=1;i<=5;i++){
  const pd=assignedPowerForSlot(name,i),cp=pd?state.powers[pd.ownedId]:null;
  slots.push({slot:i,pd,cp,tier:cp?.tier||'Iron',rank:cp?.rank||1});
 }
 const owned=slots.filter(s=>s.cp);
 const minTier=owned.length?Math.min(...owned.map(s=>tierIndex(s.tier))):0,tier=TIERS[minTier];
 const advancement=owned.reduce((sum,s)=>sum+Math.max(0,(tierIndex(s.tier)>minTier?9:s.rank)-1),0);
 return {name,tier,rank:1+Math.floor(advancement/5),slots,total:5+advancement,ability:sourceEssenceAbility(name)};
};

/* Structured ancestry progression passives.
   Awakening is progression event 1. Each completed Essence Development Tier adds one. */
function ancestryProgressionPassive(){return ANCESTRY?.progression_passive||null}
function ancestryProgressionCount(){
 const p=ancestryProgressionPassive();if(!p)return 0;
 return 1+tierIndex(characterProgress().tier);
}
function ancestryChoiceKey(passive,index){return `ancestry:${passive.id}:${index}`}
function pendingAncestryProgressionChoices(){
 const p=ancestryProgressionPassive(),count=ancestryProgressionCount(),out=[];
 if(!p?.choice?.options)return out;
 for(let i=1;i<=count;i++)if(!state.essenceChoices?.[ancestryChoiceKey(p,i)])out.push({passive:p,index:i,key:ancestryChoiceKey(p,i)});
 return out;
}
function ancestryPassiveResourceBonus(resource){
 const p=ancestryProgressionPassive();if(!p)return 0;
 const count=ancestryProgressionCount();let total=0;
 for(const e of p.effects||[])if(e.resource===resource)total+=(Number(e.amount)||0)*count;
 if(p.choice?.options)for(let i=1;i<=count;i++){
  const chosen=state.essenceChoices?.[ancestryChoiceKey(p,i)],opt=(p.choice.options||[]).find(o=>o.id===chosen);
  if(opt?.resource===resource)total+=Number(opt.amount)||0;
 }
 if(resource==='hp')for(const e of p.character_rank_effects||[])if(e.resource==='hp')total+=(Number(e.amount_per_rank)||0)*characterProgress().rank;
 return total;
}
resourceMaxes=function(){
 return {
  hp:10+ANCESTRY.resources.hp+ancestryPassiveResourceBonus('hp')+essenceResourceBonus('hp'),
  mana:ANCESTRY.resources.mana+ancestryPassiveResourceBonus('mana')+essenceResourceBonus('mana'),
  stamina:ANCESTRY.resources.stamina+ancestryPassiveResourceBonus('stamina')+essenceResourceBonus('stamina'),
  surges:ANCESTRY.resources.surges+ancestryPassiveResourceBonus('surges')+essenceResourceBonus('healing_surges')
 };
};

/* Append unresolved ancestry passive choices directly below Ancestry Powers. */
const renderLoadoutV0493Base=renderLoadout;
renderLoadout=function(){
 renderLoadoutV0493Base();
 const host=document.getElementById('ancestryPowers'),pending=pendingAncestryProgressionChoices(),p=ancestryProgressionPassive();
 if(!host||!p)return;
 const fixed=[];
 for(const r of ['hp','mana','stamina','surges']){const n=ancestryPassiveResourceBonus(r);if(n)fixed.push(`${r==='surges'?'Healing Surges':r.toUpperCase()} ${signed(n)}`)}
 host.insertAdjacentHTML('beforeend',`<div class="ancestry-progression-summary"><div class="eyebrow">ANCESTRY PROGRESSION</div><div class="small">${fixed.length?`Current passive contribution: ${fixed.join(' · ')}`:'No fixed progression bonus currently applied.'}</div></div>`);
 if(pending.length)host.insertAdjacentHTML('beforeend',`<div class="ancestry-choice-panel"><div class="eyebrow">ANCESTRY PASSIVE CHOICE</div><div class="small">Your ancestry progression has an unresolved permanent resource choice.</div>${pending.map(c=>`<label class="ancestry-choice-row"><span>Progression ${c.index}</span><select data-ancestry-progression-choice="${c.key}"><option value="">Choose…</option>${c.passive.choice.options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('')}</select></label>`).join('')}</div>`);
};
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('[data-ancestry-progression-choice]');if(!sel||!sel.value)return;
 state.essenceChoices[sel.dataset.ancestryProgressionChoice]=sel.value;save();render();toast('Ancestry progression choice saved');
},true);
