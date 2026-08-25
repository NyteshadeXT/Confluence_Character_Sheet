
/* v0.4.10.6 — Essence Training Choice UI Fix */

function v04106PendingTrainingChoices(){
 const pending=[];
 for(const essence of state.essences){
  for(const e of reachedEssenceEffectsV0491Raw(essence)){
   if(e.type!=='choice'||!e.choice)continue;
   const key=v0491ChoiceKey(essence,e);
   if(state.essenceChoices?.[key])continue;
   const trainingOptions=(e.choice.options||[]).filter(o=>(o.effects||[]).some(x=>['grant_training','increase_training'].includes(x.type)));
   if(!trainingOptions.length)continue;
   pending.push({
    essence,key,
    milestone:e.name||'Essence Training',
    description:e.description||'',
    prompt:e.choice.prompt||'Choose one training benefit.',
    options:trainingOptions
   });
  }
 }
 return pending;
}

function v04106TrainingChoicePanel(){
 const pending=v04106PendingTrainingChoices();
 if(!pending.length)return '';
 return `<section class="training-choice-panel">
   <div class="eyebrow">ESSENCE TRAINING CHOICE</div>
   <h3>New Training Benefit</h3>
   ${pending.map(c=>`<div class="training-choice-card">
     <div class="training-choice-head"><b>${v0496Esc(c.essence)} — ${v0496Esc(c.milestone)}</b></div>
     ${c.description?`<p class="small">${v0496Esc(c.description)}</p>`:''}
     <label>${v0496Esc(c.prompt)}
       <select data-essence-choice="${v0496Esc(c.key)}">
         <option value="">Choose…</option>
         ${c.options.map(o=>`<option value="${v0496Esc(o.id||o.label)}">${v0496Esc(o.label||o.id)}</option>`).join('')}
       </select>
     </label>
   </div>`).join('')}
 </section>`;
}

const renderTrainingV04106Base=renderTraining;
renderTraining=function(){
 renderTrainingV04106Base();
 const host=document.getElementById('training');
 if(!host)return;
 const panel=v04106TrainingChoicePanel();
 if(panel)host.insertAdjacentHTML('afterbegin',panel);
};

/* When a training choice is selected, persist the actual option id, apply the
   resulting resolved Essence training effect, save, and refresh immediately. */
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('.training-choice-panel [data-essence-choice]');
 if(!sel||!sel.value)return;
 const key=sel.dataset.essenceChoice;
 if(state.essenceChoices?.[key])return;
 state.essenceChoices[key]=sel.value;
 applyEssenceChoiceTraining();
 save();
 render();
 toast('Essence training choice applied');
},true);
