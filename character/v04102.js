
/* v0.4.10.2 — Optional Essence Training Milestones */
function v04102EssenceGrantedTraining(){
 const grants=new Map();
 for(const essence of state.essences){
  for(const effect of reachedEssenceEffects(essence)){
   if(effect.type!=='grant_training'||!effect.target)continue;
   const status=effect.status||'Trained',rating=Number(effect.rating)||1;
   const prev=grants.get(effect.target);
   if(!prev||PROFICIENCIES.indexOf(status)>PROFICIENCIES.indexOf(prev.status)){
    grants.set(effect.target,{status,rating,essence,name:effect.name||'Essence Milestone',rank:effect.rank,tier:effect.tier});
   }
  }
 }
 return grants;
}
const applyEssenceChoiceTrainingV04102Base=applyEssenceChoiceTraining;
applyEssenceChoiceTraining=function(){
 applyEssenceChoiceTrainingV04102Base();
 for(const [target,g] of v04102EssenceGrantedTraining()){
  const current=state.training[target];
  if(!current||PROFICIENCIES.indexOf(current.status)<PROFICIENCIES.indexOf(g.status)){
   state.training[target]={status:g.status,rating:Math.max(Number(current?.rating)||0,g.rating)};
  }
 }
};
const renderTrainingV04102Base=renderTraining;
renderTraining=function(){
 renderTrainingV04102Base();
 const grants=v04102EssenceGrantedTraining();
 for(const [target,g] of grants){
  const select=document.querySelector(`[data-training="${CSS.escape(target)}"]`);
  if(!select)continue;
  const row=select.closest('.training-row');
  row?.classList.add('essence-granted-training');
  const badge=document.createElement('span');
  badge.className='training-source-badge';
  badge.textContent=`${g.essence} R${g.rank}`;
  badge.title=`Granted by ${g.essence} Essence — ${g.name}`;
  const name=row.querySelector('b');
  if(name&&!row.querySelector('.training-source-badge'))name.insertAdjacentElement('afterend',badge);
 }
};
