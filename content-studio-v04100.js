
/* v0.4.10.0 — Power attack configuration + richer rank mutations */
const powerDefense=document.getElementById('powerDefense');
const powerAbilityMode=document.getElementById('powerAbilityMode');
const powerFixedAbility=document.getElementById('powerFixedAbility');
const powerFixedAbilityWrap=document.getElementById('powerFixedAbilityWrap');
const powerAbilityChoicesWrap=document.getElementById('powerAbilityChoicesWrap');

function v04100ToggleAbilityMode(){
 const mode=powerAbilityMode.value;
 powerFixedAbilityWrap.classList.toggle('hidden',mode!=='fixed');
 powerAbilityChoicesWrap.classList.toggle('hidden',mode!=='choice');
}
function v04100ReadAttackConfig(){
 const d=v0499Json(),atk=d.profile?.resolution?.attack||d.resolution?.attack||d.resolution?.attacks?.[0]||{},cfg=d.attack_ability||{};
 powerDefense.value=atk.defense||'';
 document.querySelectorAll('#powerAbilityChoices input').forEach(cb=>cb.checked=false);
 if(cfg.mode==='choice'&&Array.isArray(cfg.allowed)){
  powerAbilityMode.value='choice';
  document.querySelectorAll('#powerAbilityChoices input').forEach(cb=>cb.checked=cfg.allowed.includes(cb.value));
 }else if(cfg.mode==='fixed'&&cfg.fixed){
  powerAbilityMode.value='fixed'; powerFixedAbility.value=cfg.fixed;
 }else{
  powerAbilityMode.value='essence';
 }
 v04100ToggleAbilityMode();
}
function v04100SyncAttackConfig(){
 const d=v0499Json(),defense=powerDefense.value||null,mode=powerAbilityMode.value;
 d.profile=d.profile||{}; d.profile.resolution=d.profile.resolution||{};
 d.profile.resolution.attack={...(d.profile.resolution.attack||{})};
 if(defense)d.profile.resolution.attack.defense=defense;else delete d.profile.resolution.attack.defense;
 if(mode==='choice'){
  const allowed=[...document.querySelectorAll('#powerAbilityChoices input:checked')].map(x=>x.value);
  d.attack_ability={mode:'choice',allowed};
 }else if(mode==='fixed'){
  d.attack_ability={mode:'fixed',fixed:powerFixedAbility.value};
 }else d.attack_ability={mode:'essence'};
 powerDefinitionJson.value=pretty(d);
}
powerDefense.addEventListener('change',v04100SyncAttackConfig);
powerAbilityMode.addEventListener('change',()=>{v04100ToggleAbilityMode();v04100SyncAttackConfig()});
powerFixedAbility.addEventListener('change',v04100SyncAttackConfig);
document.getElementById('powerAbilityChoices').addEventListener('change',v04100SyncAttackConfig);

const v04100LoadPower=loadPower;
loadPower=function(id){v04100LoadPower(id);v04100ReadAttackConfig();renderPowerRankProgression()};
const v04100NewPower=newPowerEditor;
newPowerEditor=function(){v04100NewPower();powerDefense.value='';powerAbilityMode.value='essence';v04100ToggleAbilityMode();v04100SyncAttackConfig();renderPowerRankProgression()};
const v04100SavePower=savePowerRecord;
savePowerRecord=async function(){v04100SyncAttackConfig();syncPowerRankBuilderToJson();return v04100SavePower()};

POWER_EFFECT_TYPES.splice(8,0,
 ['modify_existing_effect','Modify Existing Effect Value'],
 ['enhance_existing_effect','Enhance Existing Effect']
);
const v04100PlaceholderBase=v0499Placeholder;
v0499Placeholder=function(t){
 if(t==='modify_existing_effect')return 'Effect name | old value | new value   e.g. Expose | +2 | +3';
 if(t==='enhance_existing_effect')return 'Effect name | additional rule text';
 return v04100PlaceholderBase(t);
};
const v04100BuildOperationBase=v0499BuildOperation;
v0499BuildOperation=function(type,value,base){
 if(type==='modify_existing_effect'){
   const [effectName,find,replace]=String(value).split('|').map(x=>x.trim());
   return {ui_type:type,ui_value:value,operation:'modify_named_effect',effect_name:effectName,find,replace};
 }
 if(type==='enhance_existing_effect'){
   const [effectName,...rest]=String(value).split('|');
   return {ui_type:type,ui_value:value,operation:'enhance_named_effect',effect_name:String(effectName||'').trim(),value:rest.join('|').trim()};
 }
 return v04100BuildOperationBase(type,value,base);
};
