
/* v0.4.11.0 — Source Essence ability default + optional alternate ability */
const powerAlternateAbility=document.getElementById('powerAlternateAbility');
const legacyPowerAbilityConfig=document.getElementById('legacyPowerAbilityConfig');

function v04110ReadAbilityConfig(){
 const d=v0499Json(),cfg=d.attack_ability||{};
 powerAlternateAbility.value='';
 legacyPowerAbilityConfig.classList.add('hidden');
 legacyPowerAbilityConfig.textContent='';
 if(cfg.mode==='essence_alternate'&&cfg.alternate){
   powerAlternateAbility.value=cfg.alternate;
 }else if(cfg.mode==='choice'&&Array.isArray(cfg.allowed)&&cfg.allowed.length){
   legacyPowerAbilityConfig.classList.remove('hidden');
   legacyPowerAbilityConfig.textContent=`Legacy ability configuration: ${cfg.allowed.join(' / ')}. Choose an Alternate Ability to convert this Power to the new source-Essence model.`;
 }
}
function v04110SyncAbilityConfig(){
 const d=v0499Json(),alternate=powerAlternateAbility.value||null;
 d.attack_ability=alternate?{mode:'essence_alternate',alternate}:{mode:'essence'};
 powerDefinitionJson.value=pretty(d);
 legacyPowerAbilityConfig.classList.add('hidden');
}
powerAlternateAbility.addEventListener('change',v04110SyncAbilityConfig);

const v04110LoadPowerBase=loadPower;
loadPower=function(id){v04110LoadPowerBase(id);v04110ReadAbilityConfig()};

const v04110NewPowerBase=newPowerEditor;
newPowerEditor=function(){v04110NewPowerBase();powerAlternateAbility.value='';v04110SyncAbilityConfig()};

const v04110SavePowerBase=savePowerRecord;
savePowerRecord=async function(){v04110SyncAbilityConfig();return v04110SavePowerBase()};
