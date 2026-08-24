
/* v0.4.9.9 — Friendly Power Rank Progression Builder */
const POWER_RANKS=[3,6,9];
const POWER_EFFECT_TYPES=[
 ['replace_damage_dice','Replace Damage Dice'],
 ['replace_damage_formula','Replace Damage Formula'],
 ['add_attack_bonus','Add Attack Bonus'],
 ['change_damage_type','Change Damage Type'],
 ['change_range','Change Range'],
 ['change_target','Change Target / Target Count'],
 ['append_hit','Add Hit Effect'],
 ['replace_hit','Replace Hit Text'],
 ['append_miss','Add Miss Effect'],
 ['append_effect','Add Effect / Rider'],
 ['change_cost','Change Resource Cost'],
 ['custom_text','Custom Player-Facing Rank Effect']
];
function v0499Esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v0499Json(){try{return JSON.parse(powerDefinitionJson.value||'{}')}catch{return {}}}
function v0499Expressions(){
 const d=v0499Json(),arr=Array.isArray(d.rank_expressions?.Iron)?d.rank_expressions.Iron:[];
 return POWER_RANKS.map(rank=>{
  const e=arr.find(x=>Number(x.rank)===rank)||{};
  return {rank,name:e.name||'',effect:e.effect||e.description||'',operations:Array.isArray(e.operations)?e.operations:[]};
 });
}
function v0499EffectRow(rank,op={},index=0){
 const type=op.ui_type||v0499InferType(op);
 const val=op.ui_value??op.value??op.replace??op.amount??'';
 return `<div class="rank-operation" data-rank="${rank}" data-op="${index}">
   <select class="rank-effect-type">${POWER_EFFECT_TYPES.map(([v,l])=>`<option value="${v}" ${v===type?'selected':''}>${l}</option>`).join('')}</select>
   <input class="rank-effect-value" value="${v0499Esc(val)}" placeholder="${v0499Placeholder(type)}">
   <button type="button" class="danger-lite remove-rank-effect">Remove</button>
  </div>`;
}
function v0499InferType(op){
 if(op.ui_type)return op.ui_type;
 if(op.operation==='replace_text'&&op.section==='hit'&&/^\d+d\d+$/i.test(String(op.replace||'')))return'replace_damage_dice';
 if(op.operation==='replace_text'&&op.section==='hit')return'replace_hit';
 if(op.operation==='append_text'&&op.section==='hit')return'append_hit';
 if(op.operation==='append_text'&&op.section==='miss')return'append_miss';
 if(op.operation==='append_text'&&op.section==='effect')return'append_effect';
 if(op.operation==='modify'&&op.target==='power_attack')return'add_attack_bonus';
 return'custom_text';
}
function v0499Placeholder(t){
 return ({
  replace_damage_dice:'e.g. 1d8',replace_damage_formula:'e.g. 2d6 + Essence ability modifier',
  add_attack_bonus:'e.g. 1',change_damage_type:'e.g. psychic',change_range:'e.g. Ranged 10',
  change_target:'e.g. Two creatures',append_hit:'Additional Hit effect text',
  replace_hit:'Complete replacement Hit text',append_miss:'Miss effect text',
  append_effect:'Additional effect / rider',change_cost:'e.g. Mana 2',
  custom_text:'Describe the Rank enhancement'
 })[t]||'Value';
}
function renderPowerRankProgression(){
 const host=document.getElementById('powerRankProgression');if(!host)return;
 host.innerHTML=v0499Expressions().map(e=>`<article class="rank-builder-card" data-rank="${e.rank}">
  <div class="rank-builder-head"><b>Rank ${e.rank}</b><span>${e.operations.length?'Configured':'Not Defined'}</span></div>
  <div class="rank-builder-grid">
   <label>Name<input class="rank-name" value="${v0499Esc(e.name)}" placeholder="Rank ${e.rank} enhancement"></label>
   <label class="wide">Description<textarea class="rank-description" rows="2" placeholder="Player-facing explanation">${v0499Esc(e.effect)}</textarea></label>
  </div>
  <div class="rank-effects">${e.operations.map((op,i)=>v0499EffectRow(e.rank,op,i)).join('')}</div>
  <button type="button" class="add-rank-effect" data-rank="${e.rank}">+ Add Mechanical Effect</button>
 </article>`).join('');
}
function v0499BuildOperation(type,value,base){
 const op={...(base||{}),ui_type:type,ui_value:value};
 delete op.find;delete op.replace;delete op.amount;delete op.target;delete op.section;delete op.value;
 switch(type){
  case'replace_damage_dice':return{...op,operation:'replace_text',section:'hit',find:'__CURRENT_DAMAGE_DICE__',replace:value};
  case'replace_damage_formula':return{...op,operation:'replace_text',section:'hit',find:'__CURRENT_DAMAGE_FORMULA__',replace:value};
  case'add_attack_bonus':return{...op,operation:'modify',target:'power_attack',amount:Number(value)||0};
  case'change_damage_type':return{...op,operation:'replace',target:'damage_type',value};
  case'change_range':return{...op,operation:'replace_text',section:'attack',find:'__CURRENT_RANGE__',replace:value};
  case'change_target':return{...op,operation:'replace',target:'target',value};
  case'append_hit':return{...op,operation:'append_text',section:'hit',value};
  case'replace_hit':return{...op,operation:'replace_text',section:'hit',value};
  case'append_miss':return{...op,operation:'append_text',section:'miss',value};
  case'append_effect':return{...op,operation:'append_text',section:'effect',value};
  case'change_cost':return{...op,operation:'replace',target:'resource_cost',value};
  default:return{...op,operation:'append_text',section:'effect',value};
 }
}
function syncPowerRankBuilderToJson(){
 const d=v0499Json(),existing=Array.isArray(d.rank_expressions?.Iron)?d.rank_expressions.Iron:[],
       nonStandard=existing.filter(x=>!POWER_RANKS.includes(Number(x.rank)));
 const built=[...document.querySelectorAll('.rank-builder-card')].map(card=>{
  const rank=Number(card.dataset.rank),name=card.querySelector('.rank-name').value.trim(),
        effect=card.querySelector('.rank-description').value.trim();
  const operations=[...card.querySelectorAll('.rank-operation')].map(row=>{
   const type=row.querySelector('.rank-effect-type').value,value=row.querySelector('.rank-effect-value').value.trim();
   return value?v0499BuildOperation(type,value):null;
  }).filter(Boolean);
  return(name||effect||operations.length)?{rank,name,effect,operations}:null;
 }).filter(Boolean);
 d.rank_expressions={...(d.rank_expressions||{}),Iron:[...nonStandard,...built].sort((a,b)=>Number(a.rank)-Number(b.rank))};
 powerDefinitionJson.value=pretty(d);
}
document.addEventListener('click',e=>{
 if(e.target.matches('.add-rank-effect')){
  const card=e.target.closest('.rank-builder-card'),box=card.querySelector('.rank-effects');
  box.insertAdjacentHTML('beforeend',v0499EffectRow(Number(card.dataset.rank),{},box.children.length));
  syncPowerRankBuilderToJson();
 }
 if(e.target.matches('.remove-rank-effect')){e.target.closest('.rank-operation').remove();syncPowerRankBuilderToJson()}
});
document.addEventListener('input',e=>{
 if(e.target.closest?.('#powerRankProgression'))syncPowerRankBuilderToJson();
});
document.addEventListener('change',e=>{
 if(e.target.matches('.rank-effect-type')){
  e.target.closest('.rank-operation').querySelector('.rank-effect-value').placeholder=v0499Placeholder(e.target.value);
  syncPowerRankBuilderToJson();
 }
});
const v0499LoadPower=loadPower;
loadPower=function(id){v0499LoadPower(id);renderPowerRankProgression()};
const v0499NewPower=newPowerEditor;
newPowerEditor=function(){v0499NewPower();renderPowerRankProgression()};
const v0499SavePower=savePowerRecord;
savePowerRecord=async function(){syncPowerRankBuilderToJson();return v0499SavePower()};
