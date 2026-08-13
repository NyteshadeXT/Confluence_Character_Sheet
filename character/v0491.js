
/* Confluence Character v0.4.9.1 — Generic Essence Milestone Choices */
const reachedEssenceEffectsV0491Raw=reachedEssenceEffects;
function v0491ChoiceKey(essence,effect){return `${essence}:${effect.choice?.key||String(effect.name||'milestone_choice').toLowerCase().replace(/[^a-z0-9]+/g,'_')}`}
function v0491ResolveChoiceEffect(essence,effect){
 const choice=effect.choice;if(!choice)return [];
 const selected=state.essenceChoices?.[v0491ChoiceKey(essence,effect)];
 if(!selected)return [];
 const option=(choice.options||[]).find(o=>(o.id||o.label)===selected||o.label===selected);
 return option?(option.effects||[]).map(x=>({...x,choiceLabel:option.label,choiceId:option.id||option.label})):[];
}
reachedEssenceEffects=function(name){
 const raw=reachedEssenceEffectsV0491Raw(name),out=[];
 for(const e of raw){
  if(e.type==='choice'&&e.choice){for(const x of v0491ResolveChoiceEffect(name,e))out.push({...x,essence:name,tier:e.tier,rank:e.rank,name:e.name})}
  else out.push(e);
 }
 return out;
};
allEssenceProgressionEffects=function(){return state.essences.flatMap(reachedEssenceEffects)};
pendingEssenceChoices=function(){
 const out=[];
 for(const essence of state.essences){
  for(const e of reachedEssenceEffectsV0491Raw(essence)){
   if(e.type==='choice'&&e.choice){
    const key=v0491ChoiceKey(essence,e);
    if(!state.essenceChoices?.[key])out.push({essence,key,effect:{...e,choice:{...e.choice,options:(e.choice.options||[]).map(o=>o.label||o.id)}}});
   }else if(e.type==='grant_training_choice'&&e.choice){
    const key=`${essence}:${e.choice.key}`;if(!state.essenceChoices?.[key])out.push({essence,key,effect:e});
   }
  }
 }
 return out;
};
/* Choice benefits are now ordinary resolved milestone effects; remove old named special cases. */
essenceChoiceAttributeBonus=function(){return 0};
essenceChoiceInitiativeBonus=function(){return 0};

applyEssenceChoiceTraining=function(){
 for(const essence of state.essences){
  for(const effect of reachedEssenceEffects(essence)){
   if(effect.type==='grant_training'&&effect.target){
    const status=effect.status||'Trained',rating=Number(effect.rating)||1,current=state.training[effect.target];
    if(!current||PROFICIENCIES.indexOf(current.status)<PROFICIENCIES.indexOf(status))state.training[effect.target]={status,rating};
   }
  }
  /* compatibility for any legacy grant_training_choice rank effects */
  for(const effect of reachedEssenceEffectsV0491Raw(essence)){
   if(effect.type==='grant_training_choice'&&effect.choice){
    const chosen=state.essenceChoices?.[`${essence}:${effect.choice.key}`];if(!chosen)continue;
    const status=effect.choice.status||effect.status||'Trained',rating=Number(effect.choice.rating||effect.rating)||1,current=state.training[chosen];
    if(!current||PROFICIENCIES.indexOf(current.status)<PROFICIENCIES.indexOf(status))state.training[chosen]={status,rating};
   }
  }
 }
};
function v0491PowerAttackAbilityKey(id){
 const p=resolvedPowerModel(id)||pdef(id)||{},a=p.attack_ability||p.profile?.resolution?.attack?.ability||p.resolution?.attack?.ability||p.profile?.resolution?.attacks?.[0]?.ability||p.resolution?.attacks?.[0]?.ability;
 return abilityKeyFromName(a)||a||sourceEssenceAbility(sourceEssenceForPower(id));
}
function v0491PowerAttackAbilityBonus(id){
 const key=v0491PowerAttackAbilityKey(id),long={Str:'Strength',Dex:'Dexterity',Con:'Constitution',Int:'Intelligence',Wis:'Wisdom',Cha:'Charisma'}[key]||key;
 return allEssenceProgressionEffects().filter(e=>e.type==='modify_power_attack_ability'&&(e.target===long||e.target===key)).reduce((s,e)=>s+(Number(e.amount)||0),0);
}
powerAttackBonus=function(id){
 const cp=state.powers[id],essence=sourceEssenceForPower(id),abilityKey=v0491PowerAttackAbilityKey(id),abilityBonus=abilityKey?ability(abilityKey).bonus:0;
 const mastery=v0491PowerAttackAbilityBonus(id),manual=attackManualModifier('power'),condition=conditionAttackModifier(abilityKey);
 return {rank:cp?.rank||0,essence,abilityKey,abilityBonus,mastery,manual,condition,total:(cp?.rank||0)+abilityBonus+mastery+manual+condition};
};

/* Make the permanent choice wording generic rather than training-specific. */
document.addEventListener('change',e=>{
 if(!e.target.dataset.essenceChoice)return;
 setTimeout(()=>{const chosen=e.target.value;if(chosen)toast(`${chosen} selected as a permanent Essence benefit`)},0);
},true);
