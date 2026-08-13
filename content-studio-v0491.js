
/* Confluence System Data Studio v0.4.9.1 — Essence Milestone Choices */
const V0491_EFFECT_TYPES=[
 ['modify_attribute','Attribute'],['modify_defense','Defense'],['modify_initiative','Initiative'],
 ['modify_attack','Weapon / General Attack'],['modify_power_attack_ability','Power Attack Ability'],
 ['modify_skill','Skill'],['grant_training','Training']
];

function v0491Slug(s){return slugify(s)||'milestone_choice'}
function v0491DirectEffects(effects){return (effects||[]).filter(e=>e.type!=='choice')}
function v0491ChoiceEffect(effects){return (effects||[]).find(e=>e.type==='choice')||null}
function v0491NormalizeChoice(c,name='Milestone Choice'){
 const choice=c?.choice||c||{};
 return {
  key:choice.key||v0491Slug(name),
  prompt:choice.prompt||'Choose one permanent benefit.',
  options:(choice.options||[]).map((o,i)=>({
    id:o.id||v0491Slug(o.label||`option-${i+1}`),
    label:o.label||`Option ${i+1}`,
    effects:Array.isArray(o.effects)?o.effects:[]
  }))
 };
}
function v0491MilestonesFromDefinition(d){
 const out=[];
 for(const tp of d.tier_progression||[]){
  for(const m of [...(tp.milestones||[]),...(tp.other_unlocks||[])]){
   const c=v0491ChoiceEffect(m.effects||[]);
   out.push({tier:tp.tier,rank:m.rank,name:m.name||'',description:m.description||'',effects:v0491DirectEffects(m.effects||[]),choice:c?v0491NormalizeChoice(c,m.name):null});
  }
 }
 return out;
}
function v0491FormatDirectEffect(e){
 const map={modify_attack:'attack',modify_power_attack_ability:'power_attack_ability',modify_attribute:'attribute',modify_defense:'defense',modify_initiative:'initiative',modify_skill:'skill',grant_training:'training'};
 if(e.type==='grant_training')return `training | ${e.target||''} | ${e.status||'Trained'}`;
 return `${map[e.type]||e.type} | ${e.target||e.scope||''} | ${e.amount??0}`;
}
function formatMilestoneEffects(effects){return (effects||[]).filter(e=>e.type!=='choice').map(v0491FormatDirectEffect).join('\n')}
function parseMilestoneEffects(text){
 return String(text||'').split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{
  const [kindRaw,target,amountRaw]=line.split('|').map(x=>x.trim()),kind=kindRaw.toLowerCase();
  const map={attack:'modify_attack',power_attack_ability:'modify_power_attack_ability',attribute:'modify_attribute',defense:'modify_defense',initiative:'modify_initiative',skill:'modify_skill',training:'grant_training'};
  const type=map[kind]||kind;
  if(!target)throw new Error(`Invalid milestone effect: ${line}`);
  if(type==='grant_training')return {type,target,status:amountRaw||'Trained',rating:1};
  const amount=Number(amountRaw);if(!Number.isFinite(amount))throw new Error(`Invalid milestone effect amount: ${line}`);
  return {type,target,amount,...(type==='modify_attack'?{scope:target}:{})};
 })
}
function v0491EffectEditor(effect={},optionIndex,effectIndex){
 const type=effect.type||'modify_attribute';
 const target=effect.target||effect.scope||'';
 const amount=effect.amount??1;
 const status=effect.status||'Trained';
 return `<div class="choice-effect-row" data-choice-effect="${optionIndex}|${effectIndex}">
   <label>Effect<select data-ce="type">${V0491_EFFECT_TYPES.map(([v,l])=>`<option value="${v}" ${type===v?'selected':''}>${l}</option>`).join('')}</select></label>
   <label>Target<input data-ce="target" value="${esc(target)}" placeholder="${type==='modify_power_attack_ability'?'Strength':'Will, Intelligence, Perception…'}"></label>
   <label class="choice-amount">Bonus<input data-ce="amount" type="number" value="${Number(amount)||0}" step="1"></label>
   <label class="choice-status">Training<select data-ce="status">${['Trained','Expert','Master','Legendary','Mythic'].map(s=>`<option ${s===status?'selected':''}>${s}</option>`).join('')}</select></label>
   <button type="button" class="danger compact" data-remove-choice-effect="${optionIndex}|${effectIndex}">Remove Effect</button>
  </div>`;
}
function v0491ChoiceEditor(choice,milestoneIndex){
 if(!choice)return `<div class="choice-builder-empty"><button type="button" data-add-milestone-choice="${milestoneIndex}">Add Permanent Choice</button><span class="field-help">Use this when the milestone asks the player to choose between permanent benefits.</span></div>`;
 return `<section class="milestone-choice-builder" data-choice-builder="${milestoneIndex}">
   <div class="repeatable-head"><div><div class="eyebrow">PERMANENT MILESTONE CHOICE</div><b>${esc(choice.prompt||'Choose one')}</b></div><button type="button" class="danger compact" data-remove-milestone-choice="${milestoneIndex}">Remove Choice</button></div>
   <div class="form-grid"><label>Choice ID<input data-choice="key" value="${esc(choice.key||'')}" placeholder="master_of_thought"></label><label>Player Prompt<input data-choice="prompt" value="${esc(choice.prompt||'Choose one permanent benefit.')}"></label></div>
   <div class="choice-option-list">${(choice.options||[]).map((o,oi)=>`<div class="choice-option-card" data-choice-option="${oi}">
      <div class="repeatable-head"><b>${esc(o.label||`Option ${oi+1}`)}</b><button type="button" class="danger compact" data-remove-choice-option="${milestoneIndex}|${oi}">Remove Option</button></div>
      <div class="form-grid"><label>Option ID<input data-co="id" value="${esc(o.id||'')}"></label><label>Player Label<input data-co="label" value="${esc(o.label||'')}"></label></div>
      <div class="choice-effects">${(o.effects||[]).map((e,ei)=>v0491EffectEditor(e,oi,ei)).join('')}</div>
      <button type="button" data-add-choice-effect="${milestoneIndex}|${oi}">Add Effect to Option</button>
    </div>`).join('')}</div>
   <button type="button" data-add-choice-option="${milestoneIndex}">Add Choice Option</button>
  </section>`;
}
renderEssenceMilestoneEditor=function(){
 essenceMilestoneList.innerHTML=essenceMilestoneDraft.length?essenceMilestoneDraft.map((m,i)=>`<div class="repeatable-card" data-milestone-row="${i}">
   <div class="repeatable-head"><b>${esc(m.name||'Milestone')}</b><button type="button" class="danger compact" data-remove-milestone="${i}">Remove</button></div>
   <div class="form-grid three"><label>Tier<select data-ms="tier">${ESSENCE_TIERS.map(t=>`<option ${t===m.tier?'selected':''}>${t}</option>`).join('')}</select></label><label>Rank<input data-ms="rank" type="number" min="0" max="9" value="${m.rank??1}"></label><label>Name<input data-ms="name" value="${esc(m.name||'')}"></label></div>
   <label>Description<textarea data-ms="description" rows="2">${esc(m.description||'')}</textarea></label>
   <label>Always-On Mechanical Effects<textarea data-ms="effects" rows="4" class="code-field" placeholder="defense | Fortitude | 1&#10;power_attack_ability | Strength | 1">${esc(formatMilestoneEffects(m.effects||[]))}</textarea>
   <span class="field-help">One effect per line. Supported: attack, power_attack_ability, attribute, defense, initiative, skill, training.</span></label>
   ${v0491ChoiceEditor(m.choice||null,i)}
  </div>`).join(''):'<div class="empty">No Essence mastery milestones defined.</div>';
};
function v0491ReadChoice(row,m){
 const builder=row.querySelector('[data-choice-builder]');if(!builder)return null;
 const key=builder.querySelector('[data-choice="key"]').value.trim()||v0491Slug(m.name),prompt=builder.querySelector('[data-choice="prompt"]').value.trim()||'Choose one permanent benefit.';
 const options=[...builder.querySelectorAll('[data-choice-option]')].map((o,oi)=>{
  const id=o.querySelector('[data-co="id"]').value.trim()||v0491Slug(o.querySelector('[data-co="label"]').value||`option-${oi+1}`),label=o.querySelector('[data-co="label"]').value.trim()||`Option ${oi+1}`;
  const effects=[...o.querySelectorAll('[data-choice-effect]')].map(er=>{
    const type=er.querySelector('[data-ce="type"]').value,target=er.querySelector('[data-ce="target"]').value.trim();
    if(!target)throw new Error(`Choice option "${label}" has an effect with no target.`);
    if(type==='grant_training')return {type,target,status:er.querySelector('[data-ce="status"]').value,rating:1};
    const amount=Number(er.querySelector('[data-ce="amount"]').value)||0;
    return {type,target,amount,...(type==='modify_attack'?{scope:target}:{})};
  });
  if(!effects.length)throw new Error(`Choice option "${label}" needs at least one effect.`);
  return {id,label,effects};
 });
 if(options.length<2)throw new Error(`Milestone choice "${m.name}" needs at least two options.`);
 return {key,prompt,options};
}
captureMilestoneDraft=function(){
 document.querySelectorAll('[data-milestone-row]').forEach(row=>{
  const i=Number(row.dataset.milestoneRow),get=k=>row.querySelector(`[data-ms="${k}"]`);
  const m={tier:get('tier').value,rank:Number(get('rank').value)||0,name:get('name').value.trim(),description:get('description').value.trim(),effects:parseMilestoneEffects(get('effects').value)};
  m.choice=v0491ReadChoice(row,m);essenceMilestoneDraft[i]=m;
 });
};
function v0491PersistCurrentMilestones(){try{captureMilestoneDraft()}catch(e){show(e.message,true);throw e}}
document.addEventListener('click',e=>{
 const addChoice=e.target.closest('[data-add-milestone-choice]');if(addChoice){v0491PersistCurrentMilestones();const i=Number(addChoice.dataset.addMilestoneChoice);essenceMilestoneDraft[i].choice={key:v0491Slug(essenceMilestoneDraft[i].name),prompt:'Choose one permanent benefit.',options:[{id:'option_a',label:'Option A',effects:[{type:'modify_attribute',target:'Intelligence',amount:1}]},{id:'option_b',label:'Option B',effects:[{type:'modify_attribute',target:'Wisdom',amount:1}]}]};renderEssenceMilestoneEditor();return}
 const removeChoice=e.target.closest('[data-remove-milestone-choice]');if(removeChoice){v0491PersistCurrentMilestones();essenceMilestoneDraft[Number(removeChoice.dataset.removeMilestoneChoice)].choice=null;renderEssenceMilestoneEditor();return}
 const addOption=e.target.closest('[data-add-choice-option]');if(addOption){v0491PersistCurrentMilestones();const i=Number(addOption.dataset.addChoiceOption),c=essenceMilestoneDraft[i].choice;c.options.push({id:`option_${c.options.length+1}`,label:`Option ${c.options.length+1}`,effects:[{type:'modify_attribute',target:'Intelligence',amount:1}]});renderEssenceMilestoneEditor();return}
 const removeOption=e.target.closest('[data-remove-choice-option]');if(removeOption){v0491PersistCurrentMilestones();const [mi,oi]=removeOption.dataset.removeChoiceOption.split('|').map(Number);essenceMilestoneDraft[mi].choice.options.splice(oi,1);renderEssenceMilestoneEditor();return}
 const addEffect=e.target.closest('[data-add-choice-effect]');if(addEffect){v0491PersistCurrentMilestones();const [mi,oi]=addEffect.dataset.addChoiceEffect.split('|').map(Number);essenceMilestoneDraft[mi].choice.options[oi].effects.push({type:'modify_defense',target:'Will',amount:1});renderEssenceMilestoneEditor();return}
 const removeEffect=e.target.closest('[data-remove-choice-effect]');if(removeEffect){v0491PersistCurrentMilestones();const [oi,ei]=removeEffect.dataset.removeChoiceEffect.split('|').map(Number),mi=Number(removeEffect.closest('[data-milestone-row]').dataset.milestoneRow);essenceMilestoneDraft[mi].choice.options[oi].effects.splice(ei,1);renderEssenceMilestoneEditor();return}
},true);

/* Training Interaction is retired. Training can still be granted as a Rank Effect. */
const v049TrainingPanel=document.getElementById('addEssenceTraining')?.closest('.subpanel');
if(v049TrainingPanel)v049TrainingPanel.style.display='none';

const loadEssenceV0491Base=loadEssence;
loadEssence=function(id){
 loadEssenceV0491Base(id);const row=essenceRows.find(x=>x.id===id);if(!row)return;
 essenceMilestoneDraft=v0491MilestonesFromDefinition(row.definition||{});renderEssenceMilestoneEditor();
};
const newEssenceEditorV0491Base=newEssenceEditor;
newEssenceEditor=function(){newEssenceEditorV0491Base();essenceMilestoneDraft=[];renderEssenceMilestoneEditor()};

function v0491MergeProgression(resourceTiers,milestones){
 const map=new Map(resourceTiers.map(t=>[t.tier,{...t,milestones:[],other_unlocks:[]}]));
 for(const m of milestones){
  const tp=map.get(m.tier)||emptyTier(m.tier),effects=[...(m.effects||[])];
  if(m.choice)effects.push({type:'choice',choice:v0491NormalizeChoice(m.choice,m.name)});
  tp.milestones.push({rank:m.rank,name:m.name,description:m.description,effects});map.set(m.tier,tp);
 }
 return ESSENCE_TIERS.map(t=>map.get(t)||emptyTier(t));
}
saveEssenceRecord=async function(){
 captureMilestoneDraft();const extra=parseJsonField(essenceExtraJson,'Advanced Essence JSON','object');
 const id=(editingEssenceId||slugify(essenceId.value||essenceName.value)),name=essenceName.value.trim();
 if(!id)throw new Error('Essence ID is required.');if(!name)throw new Error('Essence name is required.');
 delete extra.training_interaction;
 const definition={...extra,id,name,tier:essenceTier.value,description:essenceDescription.value.trim(),core_concept:essenceCoreConcept.value.split(',').map(x=>x.trim()).filter(Boolean),primary_traits:essenceTraits.value.split(',').map(x=>x.trim()).filter(Boolean),associated_ability:essenceAbility.value,associated_scores:[],progression_flavor:{durability:essenceDurability.value.trim(),recovery:essenceRecovery.value.trim(),exertion:essenceExertion.value.trim(),focus:essenceFocus.value.trim()},tier_progression:v0491MergeProgression(collectResourceProgression(),essenceMilestoneDraft)};
 const {error}=await confluenceSupabase.rpc('gm_upsert_essence_definition',{p_id:id,p_name:name,p_associated_ability:essenceAbility.value,p_definition:definition,p_is_active:essenceActive.checked});if(error)throw error;
 editingEssenceId=id;await loadLibrary(false);loadEssence(id);show(`Saved Essence: ${name}`);
};
