
/* v0.4.10.5 — Preserve Increase Training Maximum on Save/Reload */

const v04105NormalizeChoiceBase=v0491NormalizeChoice;
v0491NormalizeChoice=function(c,name='Milestone Choice'){
 const normalized=v04105NormalizeChoiceBase(c,name);
 normalized.options=(normalized.options||[]).map(opt=>({
  ...opt,
  effects:(opt.effects||[]).map(e=>{
   if(e.type==='increase_training'){
    return {...e,max_status:e.max_status||e.status||'Expert'};
   }
   return e;
  })
 }));
 return normalized;
};

/* Ensure the choice effect editor uses max_status, not the legacy status field,
   when rendering Increase Training One Step. */
const v04105EffectEditorBase=v0491EffectEditor;
v0491EffectEditor=function(effect={},optionIndex,effectIndex){
 if(effect.type==='increase_training'){
  effect={...effect,status:effect.max_status||effect.status||'Expert'};
 }
 return v04105EffectEditorBase(effect,optionIndex,effectIndex);
};

/* Preserve max_status when extracting milestones from stored definitions. */
const v04105MilestonesFromDefinitionBase=v0491MilestonesFromDefinition;
v0491MilestonesFromDefinition=function(d){
 const rows=v04105MilestonesFromDefinitionBase(d);
 return rows.map(m=>({
  ...m,
  choice:m.choice?{
   ...m.choice,
   options:(m.choice.options||[]).map(o=>({
    ...o,
    effects:(o.effects||[]).map(e=>e.type==='increase_training'
      ? {...e,max_status:e.max_status||e.status||'Expert'}
      : e)
   }))
  }:m.choice
 }));
};
