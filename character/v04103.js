
/* v0.4.10.3 — Incremental Training Milestones */
function v04103IncreaseTraining(target,maxStatus='Expert'){
 const current=state.training[target]||{status:'Untrained',rating:null};
 const currentIndex=Math.max(0,PROFICIENCIES.indexOf(current.status));
 const capIndex=Math.max(0,PROFICIENCIES.indexOf(maxStatus));
 const nextIndex=Math.min(currentIndex+1,capIndex);
 const nextStatus=PROFICIENCIES[nextIndex]||current.status||'Untrained';
 const nextRating=nextStatus==='Untrained'?null:Math.max(1,Number(current.rating)||1);
 if(nextIndex>currentIndex){
  state.training[target]={status:nextStatus,rating:nextRating};
 }
}
const applyEssenceChoiceTrainingV04103Base=applyEssenceChoiceTraining;
function v041061IncrementKey(effect){
 return `increment-training:${effect.essence||''}:${effect.tier||''}:${effect.rank||0}:${effect.name||''}:${effect.target||''}:${effect.choiceId||effect.choiceLabel||''}`;
}
applyEssenceChoiceTraining=function(){
 applyEssenceChoiceTrainingV04103Base();
 state.appliedMilestoneEffects=state.appliedMilestoneEffects||{};
 for(const essence of state.essences){
  for(const effect of reachedEssenceEffects(essence)){
   if(effect.type!=='increase_training'||!effect.target)continue;
   const key=v041061IncrementKey(effect);
   if(state.appliedMilestoneEffects[key])continue;
   v04103IncreaseTraining(effect.target,effect.max_status||'Expert');
   state.appliedMilestoneEffects[key]=true;
  }
 }
};

function v04103TrainingGrantSources(){
 const out=new Map();
 for(const essence of state.essences){
  for(const effect of reachedEssenceEffects(essence)){
   if(!['grant_training','increase_training'].includes(effect.type)||!effect.target)continue;
   out.set(effect.target,{
    essence,
    name:effect.name||'Essence Milestone',
    rank:effect.rank,
    tier:effect.tier,
    type:effect.type,
    cap:effect.max_status||effect.status||'Trained'
   });
  }
 }
 return out;
}

const renderTrainingV04103Base=renderTraining;
renderTraining=function(){
 renderTrainingV04103Base();
 const sources=v04103TrainingGrantSources();
 for(const [target,g] of sources){
  const select=document.querySelector(`[data-training="${CSS.escape(target)}"]`);
  if(!select)continue;
  const row=select.closest('.compact-training-row,.training-row');
  if(!row)continue;
  row.classList.add('essence-granted-training');
  if(!row.querySelector('.training-source-badge')){
   const badge=document.createElement('span');
   badge.className='training-source-badge';
   badge.textContent=`${g.essence} R${g.rank}`;
   badge.title=g.type==='increase_training'
    ? `Granted by ${g.essence} Essence — ${g.name}: increase one proficiency step, maximum ${g.cap}`
    : `Granted by ${g.essence} Essence — ${g.name}`;
   const name=row.querySelector('b');
   if(name)name.insertAdjacentElement('afterend',badge);
  }
 }
};
