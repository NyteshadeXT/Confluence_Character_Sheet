
/* v0.4.10.2 — Optional Essence Training Milestones */
const V04102_EFFECT_TYPES=V0491_EFFECT_TYPES;
const v04102EffectEditorBase=v0491EffectEditor;
v0491EffectEditor=function(effect={},optionIndex,effectIndex){
 let html=v04102EffectEditorBase(effect,optionIndex,effectIndex);
 if((effect.type||'')==='grant_training'){
  html=html.replace('Will, Intelligence, Perception…','Light Blade Group, Athletics, Chainmail…');
 }
 return html;
};
const v04102RenderMilestonesBase=renderEssenceMilestoneEditor;
renderEssenceMilestoneEditor=function(){
 v04102RenderMilestonesBase();
 document.querySelectorAll('[data-ms="rank"]').forEach(x=>x.max='10');
 document.querySelectorAll('[data-milestone-row]').forEach(row=>{
   const choice=row.querySelector('.choice-builder-empty .field-help');
   if(choice)choice.textContent='Use this for permanent milestone choices, including choosing between training proficiencies.';
   const area=row.querySelector('[data-ms="effects"]');
   if(area)area.placeholder='training | Athletics | Trained\\nattack | Blade | 1\\ndefense | Reflex | 1';
 });
};
