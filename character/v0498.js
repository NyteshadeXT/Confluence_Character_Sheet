
/* Confluence Character v0.4.9.8 — Unified Training & Mastery Mathematics */

const BASE_CHARACTER_HP=10;

/* Combat-facing ranked progression uses half-rate mastery. Ordinary Skill checks
   continue to add their full Skill Rank. */
function trainingMasteryBonus(rank){
 rank=Math.max(0,Number(rank)||0);
 return rank<=0?0:Math.ceil(rank/2);
}
function rankedTrainingBonus(name){
 return isTrained(name)?trainingMasteryBonus(rating(name)):0;
}
function powerRankAttackBonus(id){
 const cp=state.powers[id];
 return trainingMasteryBonus(cp?.rank||1);
}

/* Trained Armor, Shields, and Saving Throws now possess Rank just like Skills and
   Weapon Skills. Legacy trained records with rating:null resolve as Rank 1. */
setTraining=function(name,status,r){
 const current=state.training[name],rank=status==='Untrained'?null:Math.max(1,Number(r??current?.rating)||1);
 state.training[name]={status,rating:rank};save();render();
};

/* Power attack = universal Character Rank math + this Power's own mastery + ability
   + specific modifiers. Power Rank only affects THIS Power. */
powerAttackBonus=function(id){
 const cp=state.powers[id],essence=sourceEssenceForPower(id),
       abilityKey=v0491PowerAttackAbilityKey(id),
       abilityBonus=abilityKey?ability(abilityKey).bonus:0,
       rankBonus=characterRankBonus(),
       powerRank=cp?.rank||1,
       powerRankBonus=powerRankAttackBonus(id),
       essenceMastery=v0491PowerAttackAbilityBonus(id)+v0492KeywordAttackBonus(id),
       roundBonus=v0492RoundAttackBonus(),
       manual=attackManualModifier('power'),
       condition=conditionAttackModifier(abilityKey);
 return {
   powerRank,powerRankBonus,rankBonus,essence,abilityKey,abilityBonus,
   mastery:essenceMastery,keywordBonus:v0492KeywordAttackBonus(id),
   roundBonus,manual,condition,
   total:rankBonus+powerRankBonus+abilityBonus+essenceMastery+roundBonus+manual+condition
 };
};

/* Weapon Skill Rank contributes its half-rate Training Bonus rather than its full Rank. */
weaponAttack=function(item){
 const d=def(item.definitionId),focus=item.focusGroup,
       weaponRank=focus?rating(focus):0,
       trainingBonus=focus?rankedTrainingBonus(focus):0,
       trained=focus?isTrained(focus):false,
       rankBonus=characterRankBonus(),
       potency=v0497WeaponPotency(item),
       thrown=(d.properties||[]).some(p=>['thrown','light-thrown','heavy-thrown'].includes(p.id)),
       attr=d.mode==='ranged'?'Dex':'Str',
       b=ability(attr).bonus,
       essenceAttack=essenceWeaponAttackBonus(item),
       roundBonus=v0492RoundAttackBonus(),
       manual=attackManualModifier('weapon'),
       condition=conditionAttackModifier(attr),
       damageCondition=conditionDamageModifier(attr),
       damageBonus=b+damageCondition,
       dex=ability('Dex').bonus,
       thrownCondition=conditionAttackModifier('Dex'),
       thrownDamageCondition=conditionDamageModifier('Dex');
 const normalToHit=rankBonus+b+trainingBonus+potency+essenceAttack+roundBonus+manual+condition;
 const thrownToHit=rankBonus+dex+trainingBonus+potency+essenceAttack+roundBonus+manual+thrownCondition;
 return {
  normal:{
   attr,b,toHit:normalToHit,damage:`${d.damage} ${signed(damageBonus)}`,
   r:weaponRank,weaponRank,trainingBonus,trained,rankBonus,potency,
   essenceAttack,roundBonus,manual,condition,damageCondition
  },
  thrown:thrown?{
   attr:'Dex',b:dex,toHit:thrownToHit,damage:`${d.damage} ${signed(dex+thrownDamageCondition)}`,
   r:weaponRank,weaponRank,trainingBonus,trained,rankBonus,potency,
   essenceAttack,roundBonus,manual,condition:thrownCondition,
   damageCondition:thrownDamageCondition
  }:null
 };
};

function equippedTraining(kind){
 const item=equipped(kind);if(!item)return {item:null,name:null,rank:0,bonus:0,gear:0};
 const d=def(item.definitionId),du=durability(item),name=d?.trainingName||null,
       rank=name?rating(name):0,bonus=name&&isTrained(name)?rankedTrainingBonus(name):0,
       gear=du.ac&&name&&isTrained(name)?Number(d.ac)||0:0;
 return {item,name,rank,bonus,gear};
}

/* AC uses separate Armor and Shield mastery bonuses. Saving throws use their own
   Fortitude/Reflex/Will Training Ranks. */
defenses=function(){
 const dex=ability('Dex').bonus,con=ability('Con').bonus,wis=ability('Wis').bonus,
       rankBonus=characterRankBonus(),
       armor=equippedTraining('armor'),shield=equippedTraining('shield'),
       equipmentAc=armor.gear+shield.gear,
       armorTraining=armor.bonus,shieldTraining=shield.bonus,
       fortTraining=rankedTrainingBonus('Fortitude'),
       refTraining=rankedTrainingBonus('Reflex'),
       willTraining=rankedTrainingBonus('Will'),
       essenceAC=essenceStatBonus('modify_defense','AC'),
       essFort=essenceStatBonus('modify_defense','Fortitude'),
       essRef=essenceStatBonus('modify_defense','Reflex'),
       essWill=essenceStatBonus('modify_defense','Will'),
       essInit=essenceStatBonus('modify_initiative','Initiative')+essenceChoiceInitiativeBonus(),
       acActive=defenseManualModifier('AC'),
       fortActive=defenseManualModifier('Fortitude'),
       refActive=defenseManualModifier('Reflex'),
       willActive=defenseManualModifier('Will'),
       initActive=initiativeManualModifier(),
       acCondition=conditionDefenseModifier('AC'),
       fortCondition=conditionDefenseModifier('Fortitude'),
       refCondition=conditionDefenseModifier('Reflex'),
       willCondition=conditionDefenseModifier('Will'),
       initCondition=conditionInitiativeModifier();
 return {
  ac:10+dex+rankBonus+armorTraining+shieldTraining+equipmentAc+essenceAC+acActive+acCondition,
  fortitude:con+rankBonus+fortTraining+essFort+fortActive+fortCondition,
  reflex:dex+rankBonus+refTraining+essRef+refActive+refCondition,
  will:wis+rankBonus+willTraining+essWill+willActive+willCondition,
  initiative:dex+essInit+initActive+initCondition,
  rankBonus,equipmentAc,armorTraining,shieldTraining,fortTraining,refTraining,willTraining,
  breakdown:{
   ac:[
    ['Base',10],['DEX',dex],['Rank Bonus',rankBonus],
    [`${armor.name||'Armor'} Training`,armorTraining],
    [`${shield.name||'Shield'} Training`,shieldTraining],
    ['Gear',equipmentAc],['Essence',essenceAC],['Active',acActive],['Conditions',acCondition]
   ],
   fortitude:[['CON',con],['Rank Bonus',rankBonus],['Fortitude Training',fortTraining],['Essence',essFort],['Active',fortActive],['Conditions',fortCondition]],
   reflex:[['DEX',dex],['Rank Bonus',rankBonus],['Reflex Training',refTraining],['Essence',essRef],['Active',refActive],['Conditions',refCondition]],
   will:[['WIS',wis],['Rank Bonus',rankBonus],['Will Training',willTraining],['Essence',essWill],['Active',willActive],['Conditions',willCondition]],
   initiative:[['DEX',dex],['Essence',essInit],['Active',initActive],['Conditions',initCondition]]
  }
 };
};

/* Make the base HP rule explicit rather than an implicit literal. */
resourceMaxes=function(){
 return {
  hp:BASE_CHARACTER_HP+ANCESTRY.resources.hp+ancestryPassiveResourceBonus('hp')+essenceResourceBonus('hp'),
  mana:ANCESTRY.resources.mana+ancestryPassiveResourceBonus('mana')+essenceResourceBonus('mana'),
  stamina:ANCESTRY.resources.stamina+ancestryPassiveResourceBonus('stamina')+essenceResourceBonus('stamina'),
  surges:ANCESTRY.resources.surges+ancestryPassiveResourceBonus('surges')+essenceResourceBonus('healing_surges')
 };
};

/* All ranked Training categories can now spend XP. Skills use full Rank for checks;
   Weapon/Armor/Shield/Save combat contributions use trainingMasteryBonus(rank). */
function v0498TrainingRow(name,type,{showTotal=false}={}){
 const t=training(name),rank=t.status==='Untrained'?0:(t.rating||1),
       rs=rankableTrainingStatus(name),
       sv=showTotal?skillValue(name):null,
       combatBonus=type==='skill'?null:trainingMasteryBonus(rank);
 return `<div class="compact-training-row v0498-training ${t.status!=='Untrained'?'is-trained':''}">
   <div class="training-name"><b>${name}</b>${sv?`<span class="training-score">${signed(sv.total)}</span>`:''}</div>
   <select class="training-prof" data-training="${name}" aria-label="${name} proficiency">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>
   <span class="skill-rank-badge" title="${type==='skill'?'Skill Rank':`Rank ${rank} grants ${signed(combatBonus)} Training Bonus`}">${rank}</span>
   ${type==='skill'?'<span class="mastery-bonus-spacer"></span>':`<span class="mastery-bonus" title="ceil(Rank ÷ 2)">+${combatBonus}</span>`}
   <button class="compact-rank-button ${rs.ok?'primary':''}" data-rank-training="${name}" ${rs.ok?'':'disabled'}>${rs.ok?`↑ ${rs.cost} XP`:rs.reason}</button>
   ${sv?`<details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Skill Rank ${rank} · Active ${signed(sv.manual)} · Conditions ${signed(sv.condition)}${sv.essence!=null?` · Essence ${signed(sv.essence)}`:''}</span></details>`:''}
  </div>`;
}
renderTraining=function(){
 const skills=TRAINING.Skills.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>v0498TrainingRow(n,t,{showTotal:true})).join('');
 const weapons=TRAINING.Weapons.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>v0498TrainingRow(n,t)).join('');
 const armor=TRAINING.Armor.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>v0498TrainingRow(n,t)).join('');
 const saves=TRAINING['Saving Throws'].slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>v0498TrainingRow(n,t)).join('');
 document.getElementById('training').innerHTML=`
  <div class="training-primary-grid">
   <section class="training-compact-group"><div class="compact-group-head"><span>Skills</span><small>Total · Proficiency · Rank · Advance</small></div>${skills}</section>
   <section class="training-compact-group"><div class="compact-group-head"><span>Weapon Skills</span><small>Proficiency · Rank · Bonus · Advance</small></div>${weapons}</section>
  </div>
  <div class="training-secondary-grid">
   <section class="training-compact-group"><div class="compact-group-head"><span>Armor & Shields</span><small>Proficiency · Rank · AC Bonus · Advance</small></div>${armor}</section>
   <section class="training-compact-group"><div class="compact-group-head"><span>Saving Throws</span><small>Proficiency · Rank · Save Bonus · Advance</small></div>${saves}</section>
  </div>`;
};
