
/* Confluence Character v0.4.9.7 — Character Rank Mathematics */

/*
 Character Rank Bonus is the Confluence replacement for D&D 4e half-level math.
 It is a CHARACTER value and is applied once. Power Rank never contributes to an
 attack roll unless a future Power rule explicitly creates such a modifier.
*/
function characterRankBonus(progress=characterProgress()){
 const rank=Math.max(0,Number(progress?.rank)||0),tier=String(progress?.tier||'Iron');
 const tierBase={Iron:0,Bronze:10,Silver:20};
 if(Object.prototype.hasOwnProperty.call(tierBase,tier)){
   return Math.floor((tierBase[tier]+rank)/2);
 }
 // Gold+ mathematics have not yet been formally defined. Preserve the last
 // established Silver value rather than silently extrapolating a new progression.
 return 15;
}
function characterRankMath(){
 const p=characterProgress();
 return {tier:p.tier,rank:p.rank,bonus:characterRankBonus(p)};
}

/* Existing Essence/Power milestone attack modifiers remain additive. */
function v0497PowerMasteryBonus(id){
 return v0491PowerAttackAbilityBonus(id)+v0492KeywordAttackBonus(id);
}
powerAttackBonus=function(id){
 const cp=state.powers[id],essence=sourceEssenceForPower(id),
       abilityKey=v0491PowerAttackAbilityKey(id),
       abilityBonus=abilityKey?ability(abilityKey).bonus:0,
       rankBonus=characterRankBonus(),
       mastery=v0497PowerMasteryBonus(id),
       roundBonus=v0492RoundAttackBonus(),
       manual=attackManualModifier('power'),
       condition=conditionAttackModifier(abilityKey);
 return {
   powerRank:cp?.rank||1,rankBonus,essence,abilityKey,abilityBonus,
   mastery,keywordBonus:v0492KeywordAttackBonus(id),roundBonus,manual,condition,
   total:rankBonus+abilityBonus+mastery+roundBonus+manual+condition
 };
};

function v0497WeaponPotency(item){
 const d=def(item.definitionId);
 return Number(item?.potency??d?.potency??0)||0;
}
weaponAttack=function(item){
 const d=def(item.definitionId),focus=item.focusGroup,r=focus?rating(focus):0,
       trained=focus?isTrained(focus):false,rankBonus=characterRankBonus(),
       potency=v0497WeaponPotency(item),
       thrown=(d.properties||[]).some(p=>['thrown','light-thrown','heavy-thrown'].includes(p.id)),
       attr=d.mode==='ranged'?'Dex':'Str',b=ability(attr).bonus,
       essenceAttack=essenceWeaponAttackBonus(item),roundBonus=v0492RoundAttackBonus(),
       manual=attackManualModifier('weapon'),condition=conditionAttackModifier(attr),
       damageCondition=conditionDamageModifier(attr),damageBonus=b+damageCondition,
       dex=ability('Dex').bonus,thrownCondition=conditionAttackModifier('Dex'),
       thrownDamageCondition=conditionDamageModifier('Dex');
 const normalToHit=rankBonus+b+r+potency+essenceAttack+roundBonus+manual+condition;
 const thrownToHit=rankBonus+dex+r+potency+essenceAttack+roundBonus+manual+thrownCondition;
 return {
  normal:{
   attr,b,toHit:normalToHit,damage:`${d.damage} ${signed(damageBonus)}`,
   r,trained,rankBonus,potency,essenceAttack,roundBonus,manual,condition,damageCondition
  },
  thrown:thrown?{
   attr:'Dex',b:dex,toHit:thrownToHit,damage:`${d.damage} ${signed(dex+thrownDamageCondition)}`,
   r,trained,rankBonus,potency,essenceAttack,roundBonus,manual,
   condition:thrownCondition,damageCondition:thrownDamageCondition
  }:null
 };
};

/* Rank Bonus applies once to AC, Fortitude, Reflex, and Will. It does NOT
   automatically apply to Initiative or Skills. */
defenses=function(){
 const dex=ability('Dex').bonus,con=ability('Con').bonus,wis=ability('Wis').bonus,
       rankBonus=characterRankBonus();
 let equipmentAc=0;
 for(const kind of ['armor','shield']){
  const item=equipped(kind);if(!item)continue;
  const d=def(item.definitionId),du=durability(item);
  if(du.ac&&isTrained(d.trainingName))equipmentAc+=d.ac||0;
 }
 const essenceAC=essenceStatBonus('modify_defense','AC'),
       essFort=essenceStatBonus('modify_defense','Fortitude'),
       essRef=essenceStatBonus('modify_defense','Reflex'),
       essWill=essenceStatBonus('modify_defense','Will'),
       essInit=essenceStatBonus('modify_initiative','Initiative')+essenceChoiceInitiativeBonus(),
       acActive=defenseManualModifier('AC'),fortActive=defenseManualModifier('Fortitude'),
       refActive=defenseManualModifier('Reflex'),willActive=defenseManualModifier('Will'),
       initActive=initiativeManualModifier(),
       acCondition=conditionDefenseModifier('AC'),fortCondition=conditionDefenseModifier('Fortitude'),
       refCondition=conditionDefenseModifier('Reflex'),willCondition=conditionDefenseModifier('Will'),
       initCondition=conditionInitiativeModifier();
 return {
  ac:10+dex+rankBonus+rating('AC')+equipmentAc+essenceAC+acActive+acCondition,
  fortitude:con+rankBonus+rating('Fortitude')+essFort+fortActive+fortCondition,
  reflex:dex+rankBonus+rating('Reflex')+essRef+refActive+refCondition,
  will:wis+rankBonus+rating('Will')+essWill+willActive+willCondition,
  initiative:dex+essInit+initActive+initCondition,
  rankBonus,equipmentAc,
  breakdown:{
   ac:[['Base',10],['DEX',dex],['Rank Bonus',rankBonus],['Rating',rating('AC')],['Gear',equipmentAc],['Essence',essenceAC],['Active',acActive],['Conditions',acCondition]],
   fortitude:[['CON',con],['Rank Bonus',rankBonus],['Rating',rating('Fortitude')],['Essence',essFort],['Active',fortActive],['Conditions',fortCondition]],
   reflex:[['DEX',dex],['Rank Bonus',rankBonus],['Rating',rating('Reflex')],['Essence',essRef],['Active',refActive],['Conditions',refCondition]],
   will:[['WIS',wis],['Rank Bonus',rankBonus],['Rating',rating('Will')],['Essence',essWill],['Active',willActive],['Conditions',willCondition]],
   initiative:[['DEX',dex],['Essence',essInit],['Active',initActive],['Conditions',initCondition]]
  }
 };
};

function v0497PowerAttackMathText(atk){
 const parts=[
  ['Rank Bonus',atk.rankBonus],
  [atk.abilityKey||'Ability',atk.abilityBonus],
  ['Essence/Milestones',atk.mastery],
  ['Round',atk.roundBonus],
  ['Active',atk.manual],
  ['Conditions',atk.condition]
 ];
 return parts.filter(([,v])=>Number(v)!==0||['Rank Bonus',atk.abilityKey||'Ability'].includes(parts.find(x=>x[1]===v)?.[0]))
   .map(([l,v])=>`${l} ${signed(v)}`).join(' · ');
}
