
/* v0.4.10.7 — GM Power Deletion */
const deletePower=document.getElementById('deletePower');

function v04107SyncDeletePower(){
 if(!deletePower)return;
 deletePower.disabled=!editingPowerId;
 deletePower.textContent=editingPowerId?'Delete Power':'Delete Power';
}

const v04107LoadPowerBase=loadPower;
loadPower=function(id){
 v04107LoadPowerBase(id);
 v04107SyncDeletePower();
};

const v04107NewPowerBase=newPowerEditor;
newPowerEditor=function(){
 v04107NewPowerBase();
 v04107SyncDeletePower();
};

const v04107DuplicatePowerBase=duplicatePowerRecord;
duplicatePowerRecord=function(){
 v04107DuplicatePowerBase();
 v04107SyncDeletePower();
};

async function v04107DeletePower(){
 if(!editingPowerId)return;
 const row=powerRows.find(x=>x.id===editingPowerId);
 const name=row?.name||powerName.value||editingPowerId;
 const warning=`Permanently delete "${name}"?

This removes:
• the master Power definition
• all Essence eligibility links
• the Power from any characters who currently own it
• matching character loadout references

This cannot be undone.`;
 if(!window.confirm(warning))return;

 deletePower.disabled=true;
 try{
  const {data,error}=await confluenceSupabase.rpc('gm_delete_power_definition',{p_power_id:editingPowerId});
  if(error)throw error;
  const removedChars=Number(data?.character_assignments_removed||0);
  const removedEligibility=Number(data?.eligibility_links_removed||0);
  await loadLibrary(false);
  newPowerEditor();
  show(`Deleted Power: ${name}. Removed ${removedEligibility} eligibility link${removedEligibility===1?'':'s'} and ${removedChars} character assignment${removedChars===1?'':'s'}.`);
 }catch(e){
  show(e.message||String(e),true);
  v04107SyncDeletePower();
 }
}
deletePower?.addEventListener('click',()=>v04107DeletePower());
v04107SyncDeletePower();
