
/* Confluence Character v0.4.8 — System Rules Expansion */
let MASTER_CONDITION_MODELS=[];

function conditionModifierValue(mod,condition){
 const cv=Math.max(1,Number(condition?.value)||1);
 if(mod.valueFromCondition!=null)return Number(mod.valueFromCondition)*cv;
 return Number(mod.value)||0;
}
function targetMatches(target,kind,name,attr){
 if(!target)return false;
 if(target==='check:*')return ['skill','attack','initiative'].includes(kind);
 if(target===`${kind}:*`)return true;
 if(target===`${kind}:${name}`)return true;
 if(kind==='skill'&&target===`ability:${attr}`)return true;
 if(kind==='attack'&&target===`ability:${attr}`)return true;
 if(kind==='saving'&&target===`defense:${name}`)return true;
 return false;
}
function structuredConditionModifier(kind,name='',attr=''){
 let total=0;
 for(const c of effectiveConditions()){
   for(const mod of c.def.modifiers||[]){
     if(targetMatches(mod.target,kind,name,attr))total+=conditionModifierValue(mod,c);
   }
 }
 return total;
}
async function loadMasterConditions(){
 try{
  const {data,error}=await confluenceSupabase.from('condition_definitions').select('id,name,definition,is_active').eq('is_active',true).order('name');
  if(error)throw error;
  MASTER_CONDITION_MODELS=data||[];
  for(const row of MASTER_CONDITION_MODELS){
   const i=CONDITION_DEFINITIONS.findIndex(x=>x.id===row.id);
   const merged={...(i>=0?CONDITION_DEFINITIONS[i]:{}),...(row.definition||{}),id:row.id,name:row.name};
   if(i>=0)CONDITION_DEFINITIONS.splice(i,1,merged);else CONDITION_DEFINITIONS.push(merged);
  }
  if(CONNECTED_BACKEND.connected)render();
 }catch(err){console.warn('[v0.4.8 Condition Library]',err)}
}

/* Structured condition math. Legacy fallback remains for conditions not yet configured in System Data. */
const legacyConditionAttackModifier=conditionAttackModifier;
const legacyConditionDefenseModifier=conditionDefenseModifier;
const legacyConditionInitiativeModifier=conditionInitiativeModifier;
const legacyConditionSkillModifier=conditionSkillModifier;

conditionAttackModifier=function(attrKey){
 const structured=structuredConditionModifier('attack','*',attrKey);
 const configured=effectiveConditions().some(c=>(c.def.modifiers||[]).some(m=>targetMatches(m.target,'attack','*',attrKey)||m.target==='check:*'));
 return configured?structured:legacyConditionAttackModifier(attrKey);
};
conditionDefenseModifier=function(name){
 const kind=name==='AC'?'defense':'saving';
 const structured=structuredConditionModifier(kind,name,'');
 const configured=effectiveConditions().some(c=>(c.def.modifiers||[]).some(m=>targetMatches(m.target,kind,name,'')||m.target===`defense:${name}`));
 return configured?structured:legacyConditionDefenseModifier(name);
};
conditionInitiativeModifier=function(){
 const structured=structuredConditionModifier('initiative','Initiative','Dex');
 const configured=effectiveConditions().some(c=>(c.def.modifiers||[]).some(m=>targetMatches(m.target,'initiative','Initiative','Dex')));
 return configured?structured:legacyConditionInitiativeModifier();
};
conditionSkillModifier=function(name){
 const attr=SKILL_ABILITIES[name],structured=structuredConditionModifier('skill',name,attr);
 const configured=effectiveConditions().some(c=>(c.def.modifiers||[]).some(m=>targetMatches(m.target,'skill',name,attr)));
 return configured?structured:legacyConditionSkillModifier(name);
};

/* Make condition math explicit anywhere skill math is shown. */
const renderQuickSkillsV047=renderQuickSkills;
renderQuickSkills=function(){
 const el=document.getElementById('combatSkills');if(!el)return;
 const names=TRAINING.Skills.filter(x=>x[1]==='skill').map(x=>x[0]).sort((a,b)=>a.localeCompare(b));
 el.innerHTML=names.map(name=>{const s=skillValue(name);return `<div class="quick-skill"><span>${name}</span><strong>${signed(s.total)}</strong><details><summary>Math</summary><small>${s.key} ${signed(s.attr)} · Rating ${signed(s.r)} · Active ${signed(s.manual)} · Conditions ${signed(s.condition)}</small></details></div>`}).join('');
};
const renderTrainingV047=renderTraining;
renderTraining=function(){
 document.getElementById('training').innerHTML=Object.entries(TRAINING).map(([group,rows])=>`<div class="training-group"><div class="subhead">${group}</div>${rows.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([name,type,supports])=>{
  const t=training(name),sv=type==='skill'?skillValue(name):null;
  if(!supports)return `<div class="training-row no-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b><select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select></div>`;
  return `<div class="training-row has-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b>${sv?`<span class="final-mod">${signed(sv.total)}</span>`:'<span></span>'}<select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select><input class="training-rating" data-rating="${name}" type="number" min="1" value="${t.rating||1}" ${t.status==='Untrained'?'disabled':''}>${sv?`<details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Rating ${signed(sv.r)} · Active ${signed(sv.manual)} · Conditions ${signed(sv.condition)}</span></details>`:''}</div>`;
 }).join('')}</div>`).join('');
};

/* Equipment: single-group weapons don't need Permanent Focus UI; inventory can remove items. */
renderEquipment=function(){
 const el=document.getElementById('ownedEquipment');
 el.innerHTML=state.equipment.length?state.equipment.map(item=>{
  const d=def(item.definitionId),du=durability(item);if(!d)return'';
  const groups=d.groups||[];
  const focus=d.kind==='weapon'&&groups.length>1?`<div class="selector-row"><label>Weapon Group Focus <select data-focus="${item.uid}" ${item.focusGroup?'disabled':''}>${groups.map(g=>`<option ${g===item.focusGroup?'selected':''}>${g}</option>`).join('')}</select></label><span class="small">${item.focusGroup?`Locked: ${item.focusGroup}`:'Choose once'}</span></div>`:'';
  const dur=d.kind!=='weapon'?`<div class="small">Durability: <b class="${du.state==='functional'?'good':du.state==='broken'?'warn':'bad'}">${du.state}</b> · ${du.hp}/${du.max} HP · Hardness ${du.hardness}</div><div class="durability ${du.state}"><span style="width:${du.max?du.hp/du.max*100:0}%"></span></div>`:'';
  return `<div class="equip-card ${item.equipped?'is-equipped':''} ${item.destroyed?'is-destroyed':''}"><div class="equip-title"><span>${d.name}</span><span>${item.destroyed?'<span class="bad">DESTROYED</span>':item.equipped?'<span class="equipped-badge">EQUIPPED</span>':''}</span></div>${equipmentDetail(d)}${focus}${dur}<div class="actions">${!item.destroyed?`<button data-equip="${item.uid}">${item.equipped?'Unequip':'Equip'}</button>`:''}${d.kind!=='weapon'&&!item.destroyed?`<button data-repair="${item.uid}" title="Restore 5 durability HP, up to the item maximum.">Repair 5 Durability</button>`:''}<button class="danger" data-remove-equipment="${item.uid}">Remove</button></div></div>`;
 }).join(''):'<div class="empty">No equipment owned.</div>';
 const sel=document.getElementById('catalogSelect');sel.innerHTML=EQUIPMENT_DB.map(d=>`<option value="${d.id}">${d.name} · ${d.kind}</option>`).join('');renderCatalogDetail();
};
async function removeOwnedEquipment(uid){
 const item=state.equipment.find(x=>x.uid===uid),d=def(item?.definitionId);if(!item)return;
 if(!confirm(`Remove ${d?.name||'this item'} from owned equipment? This cannot be undone.`))return;
 state.equipment=state.equipment.filter(x=>x.uid!==uid);
 save();render();toast(`${d?.name||'Item'} removed`);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-remove-equipment]');if(b){e.stopPropagation();removeOwnedEquipment(b.dataset.removeEquipment)}
},true);

/* Rich Confluence Power presentation. */
function powerField(p,...paths){
 for(const path of paths){let v=p;for(const k of path.split('.'))v=v?.[k];if(v!=null&&v!==''&&(Array.isArray(v)?v.length:true))return v}
 return null;
}
function asText(v){
 if(v==null)return '';
 if(typeof v==='string'||typeof v==='number')return String(v);
 if(Array.isArray(v))return v.map(asText).filter(Boolean).join('; ');
 if(v.text)return v.text;
 return effectText(v);
}
function powerSections(p,id){
 const r=p.profile?.resolution||p.resolution||{},attack=r.attack||r.attacks?.[0];
 const attackText=powerField(p,'text.attack','attack_text')||(attack?`Power Attack vs. ${String(attack.defense||'Defense').toUpperCase()}`:'');
 const hit=powerField(p,'text.hit','hit_text')||r.hit;
 const miss=powerField(p,'text.miss','miss_text')||r.miss;
 const effect=powerField(p,'text.effect','effect_text')||p.profile?.effects||p.effects;
 const special=powerField(p,'text.special','special_text','special_rules');
 const sustain=powerField(p,'text.sustain','sustain_text');
 return [['Attack',attackText,'attack'],['Hit',hit,'hit'],['Miss',miss,'miss'],['Effect',effect,'effect'],['Special',special,'special'],['Sustain',sustain,'special']]
   .filter(x=>asText(x[1])).map(([label,val,cls])=>`<div class="power-text-section ${cls}"><b>${label}</b><div>${replaceModifierReferences(asText(val),id)}</div></div>`).join('');
}
resolvedPowerCard=function(id,combat=false){
 const source=pdef(id),p=resolvedPowerModel(id)||source,cp=state.powers[id],m=powerMeta(source),ess=sourceEssenceForPower(id),ab=sourceEssenceAbility(ess);
 if(!p||!cp||!m)return '';
 const role=POWER_SLOT_ROLES[m.slot]?.name||`Slot ${m.slot}`;
 const frequency=powerField(p,'classification.frequency','slot.frequency')||m.frequency||'Special';
 const keywords=powerField(p,'classification.keywords','classification.traits','keywords','traits')||[];
 const description=powerField(p,'description','flavor','flavor_text','profile.description')||'';
 const resonance=powerField(p,'classification.dungeon_resonance','dungeon_resonance')||'Neutral';
 const action=powerField(p,'activation.action_type','action_type')||'';
 const range=powerField(p,'targeting.range.origin','attack_type_range','range')||'';
 const target=powerField(p,'targeting.target.selector','target')||'';
 const trigger=powerField(p,'activation.trigger','trigger')||'';
 const requirements=powerField(p,'activation.requirements','requirements')||[];
 const costs=(p.costs||[]).map(c=>`${c.amount} ${c.resource}`).join(' + ')||'—';
 return `<article class="power-card resolved-power rich-power">
  <div class="power-title"><span>${p.name}</span><span class="rank-big">${cp.tier} ${cp.rank}</span></div>
  <div class="power-concept">${powerField(p,'power_type','concept','slot.category')||role}</div>
  <div class="meta"><span class="tag">${frequency}</span>${(Array.isArray(keywords)?keywords:String(keywords).split(',')).map(k=>`<span class="tag">${k}</span>`).join('')}<span class="tag">${ess||'No Essence'}</span></div>
  ${description?`<p class="power-flavor">${description}</p>`:''}
  <div class="power-facts">${resonance?`<div><b>Dungeon Resonance:</b> ${resonance}</div>`:''}${action?`<div><b>Action Type:</b> ${action}</div>`:''}${range?`<div><b>Attack Type and Range:</b> ${range}</div>`:''}${target?`<div><b>Target:</b> ${target}</div>`:''}${trigger?`<div><b>Trigger:</b> ${asText(trigger)}</div>`:''}${asText(requirements)?`<div><b>Requirements:</b> ${asText(requirements)}</div>`:''}</div>
  ${powerSections(p,id)}
  <div class="small power-footer">Slot ${m.slot} · ${role} · Cost ${costs} · Source ability ${ab||'Not assigned'}${ab?` ${signed(ability(ab).bonus)}`:''}</div>
  ${combat?powerUseButton(id):''}
 </article>`;
};

/* Load System Data condition overrides after the base sheet has authenticated. */
setTimeout(loadMasterConditions,0);
