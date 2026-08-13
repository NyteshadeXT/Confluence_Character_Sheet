/* Confluence Character v0.4.9 — Generic Essence Progression */
function essenceTrainingEffectStatus(effect){return effect.status||effect.choice?.status||'Trained'}
function essenceTrainingEffectRating(effect){return Number(effect.rating??effect.choice?.rating??1)||1}
applyEssenceChoiceTraining=function(){
 for(const essence of state.essences){
  for(const effect of reachedEssenceEffects(essence)){
   if(effect.type==='grant_training'&&effect.target){const status=essenceTrainingEffectStatus(effect),rating=essenceTrainingEffectRating(effect);if(!state.training[effect.target]||PROFICIENCIES.indexOf(state.training[effect.target].status)<PROFICIENCIES.indexOf(status))state.training[effect.target]={status,rating}}
   if(effect.type==='grant_training_choice'&&effect.choice){const key=`${essence}:${effect.choice.key}`,chosen=state.essenceChoices?.[key];if(chosen){const status=essenceTrainingEffectStatus(effect),rating=essenceTrainingEffectRating(effect);if(!state.training[chosen]||PROFICIENCIES.indexOf(state.training[chosen].status)<PROFICIENCIES.indexOf(status))state.training[chosen]={status,rating}}}
  }
 }
};
function effectAppliesToWeapon(effect,item){
 const d=def(item.definitionId),groups=d?.groups||[],scope=String(effect.scope||effect.target||'').toLowerCase();
 if(!scope||scope==='*'||scope==='weapon attacks'||scope==='weapons')return true;
 if(scope==='blade weapons')return groups.some(g=>['light blade','heavy blade'].includes(g.toLowerCase()));
 return groups.some(g=>g.toLowerCase()===scope||scope.includes(g.toLowerCase()));
}
essenceWeaponAttackBonus=function(item){return allEssenceProgressionEffects().filter(e=>e.type==='modify_attack'&&effectAppliesToWeapon(e,item)).reduce((sum,e)=>sum+(Number(e.amount)||0),0)};
const skillValueV048=skillValue;
skillValue=function(name){const base=skillValueV048(name),essence=essenceStatBonus('modify_skill',name);return {...base,essence,total:base.total+essence}};

/* Keep Essence milestones hidden from players while showing already-earned effects as current benefits. */
const renderEssencesV048=renderEssences;
renderEssences=function(){renderEssencesV048();const el=document.getElementById('essenceProgress');if(!el)return;for(const card of [...el.querySelectorAll('.essence-card')]){const title=card.querySelector('.power-title span')?.textContent||'',name=title.replace(/ Essence$/,'');const ed=essenceDef(name);if(!ed)continue;const flavor=ed.progression_flavor||{},info=essenceInfo(name),effects=reachedEssenceEffects(name);const benefits=[];for(const r of ['hp','healing_surges','stamina','mana']){const n=essenceResourceContribution(name,r);if(n)benefits.push(`${r.replaceAll('_',' ')} ${signed(n)}`)}for(const e of effects){if(e.type==='modify_attribute')benefits.push(`${e.target} ${signed(e.amount)}`);if(e.type==='modify_defense')benefits.push(`${e.target} ${signed(e.amount)}`);if(e.type==='modify_attack')benefits.push(`${e.target||e.scope} attacks ${signed(e.amount)}`)}const box=document.createElement('div');box.className='earned-essence-benefits';box.innerHTML=`<div class="small"><b>Current Essence Benefits</b>${benefits.length?` · ${benefits.join(' · ')}`:' · None currently active'}</div>`;card.appendChild(box)}};
