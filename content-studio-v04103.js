
/* v0.4.10.3 — Incremental Training Milestones */
V0491_EFFECT_TYPES.push(['increase_training','Increase Training One Step']);

const v04103FormatDirectEffectBase=v0491FormatDirectEffect;
v0491FormatDirectEffect=function(e){
 if(e.type==='increase_training')return `training_step | ${e.target||''} | ${e.max_status||'Expert'}`;
 return v04103FormatDirectEffectBase(e);
};

const v04103ParseMilestoneEffectsBase=parseMilestoneEffects;
parseMilestoneEffects=function(text){
 return String(text||'').split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{
  const [kindRaw,target,valueRaw]=line.split('|').map(x=>x.trim());
  const kind=String(kindRaw||'').toLowerCase();
  if(kind==='training_step'||kind==='increase_training'){
   if(!target)throw new Error(`Invalid milestone effect: ${line}`);
   return {type:'increase_training',target,max_status:valueRaw||'Expert'};
  }
  return v04103ParseMilestoneEffectsBase(line)[0];
 });
};

const v04103EffectEditorBase=v0491EffectEditor;
v0491EffectEditor=function(effect={},optionIndex,effectIndex){
 let html=v04103EffectEditorBase(effect,optionIndex,effectIndex);
 if(effect.type==='increase_training'){
   html=html
    .replace('class="choice-amount"','class="choice-amount hidden"')
    .replace('class="choice-status"','class="choice-status"')
    .replace('Training<select data-ce="status">','Maximum<select data-ce="status">');
 }
 return html;
};

const v04103ReadChoiceBase=v0491ReadChoice;
v0491ReadChoice=function(row,m){
 const builder=row.querySelector('[data-choice-builder]');
 if(!builder)return null;
 const key=builder.querySelector('[data-choice="key"]').value.trim()||v0491Slug(m.name);
 const prompt=builder.querySelector('[data-choice="prompt"]').value.trim()||'Choose one permanent benefit.';
 const options=[...builder.querySelectorAll('[data-choice-option]')].map((o,oi)=>{
  const label=o.querySelector('[data-co="label"]').value.trim()||`Option ${oi+1}`;
  const id=o.querySelector('[data-co="id"]').value.trim()||v0491Slug(label);
  const effects=[...o.querySelectorAll('[data-choice-effect]')].map(er=>{
   const type=er.querySelector('[data-ce="type"]').value;
   const target=er.querySelector('[data-ce="target"]').value.trim();
   if(!target)throw new Error(`Choice option "${label}" has an effect with no target.`);
   if(type==='grant_training'){
    return {type,target,status:er.querySelector('[data-ce="status"]').value,rating:1};
   }
   if(type==='increase_training'){
    return {type,target,max_status:er.querySelector('[data-ce="status"]').value||'Expert'};
   }
   const amount=Number(er.querySelector('[data-ce="amount"]').value)||0;
   return {type,target,amount,...(type==='modify_attack'?{scope:target}:{})};
  });
  if(!effects.length)throw new Error(`Choice option "${label}" needs at least one effect.`);
  return {id,label,effects};
 });
 if(options.length<2)throw new Error(`Milestone choice "${m.name}" needs at least two options.`);
 return {key,prompt,options};
};

const v04103RenderMilestonesBase=renderEssenceMilestoneEditor;
renderEssenceMilestoneEditor=function(){
 v04103RenderMilestonesBase();
 document.querySelectorAll('[data-choice-effect]').forEach(row=>{
  const type=row.querySelector('[data-ce="type"]')?.value;
  const target=row.querySelector('[data-ce="target"]');
  if(type==='increase_training'&&target){
   target.placeholder='Light Blade, Heavy Blade, Athletics…';
  }
 });
};
