let ancestryRows=[],essenceRows=[],powerRows=[],eligibilityRows=[];
let editingAncestryId=null,editingEssenceId=null,editingPowerId=null;

const SLOT_META={
  1:{category:'Core Concept',frequency:'At-Will'},
  2:{category:'Utility / Passive',frequency:'Passive'},
  3:{category:'Signature Strike',frequency:'Resource'},
  4:{category:'Tactical Strike',frequency:'Resource'},
  5:{category:'Apex',frequency:'Daily'}
};

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slugify(s){return String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function pretty(obj){return JSON.stringify(obj??{},null,2)}
function parseJsonField(el,label,expected){
  let value;
  try{value=JSON.parse(el.value|| (expected==='array'?'[]':'{}'))}catch(e){throw new Error(`${label} contains invalid JSON: ${e.message}`)}
  if(expected==='array'&&!Array.isArray(value))throw new Error(`${label} must be a JSON array.`);
  if(expected==='object'&&(Array.isArray(value)||value===null||typeof value!=='object'))throw new Error(`${label} must be a JSON object.`);
  return value;
}
function show(msg,bad=false){notice.textContent=msg;notice.className='status '+(bad?'bad':'good')}
function setTab(tab){
  document.querySelectorAll('.studio-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  ancestriesTab.classList.toggle('hidden',tab!=='ancestries');
  essencesTab.classList.toggle('hidden',tab!=='essences');
  powersTab.classList.toggle('hidden',tab!=='powers');
}
document.querySelectorAll('.studio-tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

async function requireGm(){
  const session=await requireSession();
  identity.textContent=session.user.email||'Signed in';
  const {data,error}=await confluenceSupabase.rpc('is_system_gm');
  if(error)throw error;
  if(!data)throw new Error('GM access is required to use the System Data Studio.');
  return session;
}

async function loadLibrary(preserve=true){
  const [{data:a,error:aErr},{data:e,error:eErr},{data:p,error:pErr},{data:x,error:xErr}]=await Promise.all([
    confluenceSupabase.from('ancestry_definitions').select('id,name,definition,is_active').order('name'),
    confluenceSupabase.from('essence_definitions').select('id,name,associated_ability,definition,is_active').order('name'),
    confluenceSupabase.from('power_definitions').select('id,name,slot_index,definition,is_active').order('slot_index').order('name'),
    confluenceSupabase.from('essence_power_eligibility').select('essence_id,power_id')
  ]);
  if(aErr)throw aErr;if(eErr)throw eErr;if(pErr)throw pErr;if(xErr)throw xErr;
  ancestryRows=a||[];essenceRows=e||[];powerRows=p||[];eligibilityRows=x||[];
  renderAncestryList();renderEssenceList();renderPowerList();renderEligibility();
  if(preserve&&editingAncestryId){const row=ancestryRows.find(x=>x.id===editingAncestryId);if(row)loadAncestry(row.id)}
  if(preserve&&editingEssenceId){const row=essenceRows.find(x=>x.id===editingEssenceId);if(row)loadEssence(row.id)}
  if(preserve&&editingPowerId){const row=powerRows.find(x=>x.id===editingPowerId);if(row)loadPower(row.id)}
}

function renderAncestryList(){
 const q=ancestrySearch.value.trim().toLowerCase(),showInactive=showInactiveAncestries.checked;
 const rows=ancestryRows.filter(x=>(showInactive||x.is_active)&&(x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)));
 ancestryList.innerHTML=rows.map(x=>`<button class="library-item ${editingAncestryId===x.id?'selected':''} ${x.is_active?'':'inactive'}" data-ancestry-id="${esc(x.id)}"><span><b>${esc(x.name)}</b><small>${esc(x.id)}</small></span><span class="library-meta">${x.is_active?'Active':'INACTIVE'}</span></button>`).join('')||'<div class="empty">No Ancestries match this filter.</div>';
 ancestryList.querySelectorAll('[data-ancestry-id]').forEach(b=>b.onclick=()=>loadAncestry(b.dataset.ancestryId));
}
function newAncestryEditor(){editingAncestryId=null;ancestryEditorTitle.textContent='New Ancestry';ancestryStatus.textContent='Unsaved';ancestryId.disabled=false;ancestryId.value='';ancestryName.value='';ancestryDescription.value='';for(const id of ['ancestryStr','ancestryDex','ancestryCon','ancestryInt','ancestryWis','ancestryCha','ancestryHp','ancestryMana','ancestryStamina','ancestrySurges'])document.getElementById(id).value=0;ancestryPowersJson.value='[]';ancestryExtraJson.value='{}';ancestryActive.checked=true;renderAncestryList();ancestryName.focus()}
function loadAncestry(id){const row=ancestryRows.find(x=>x.id===id);if(!row)return;editingAncestryId=id;const d=row.definition||{},m=d.mods||{},r=d.resources||{};ancestryEditorTitle.textContent=row.name;ancestryStatus.textContent=row.is_active?'Active':'Inactive';ancestryId.value=row.id;ancestryId.disabled=true;ancestryName.value=row.name;ancestryDescription.value=d.description||'';ancestryStr.value=m.Str||0;ancestryDex.value=m.Dex||0;ancestryCon.value=m.Con||0;ancestryInt.value=m.Int||0;ancestryWis.value=m.Wis||0;ancestryCha.value=m.Cha||0;ancestryHp.value=r.hp||0;ancestryMana.value=r.mana||0;ancestryStamina.value=r.stamina||0;ancestrySurges.value=r.surges||0;ancestryPowersJson.value=pretty(Array.isArray(d.powers)?d.powers:[]);const known=new Set(['id','name','description','mods','resources','powers']);ancestryExtraJson.value=pretty(Object.fromEntries(Object.entries(d).filter(([k])=>!known.has(k))));ancestryActive.checked=!!row.is_active;renderAncestryList()}
async function saveAncestryRecord(){const id=editingAncestryId||slugify(ancestryId.value||ancestryName.value),name=ancestryName.value.trim();if(!id)throw new Error('Ancestry ID is required.');if(!name)throw new Error('Ancestry name is required.');const powers=parseJsonField(ancestryPowersJson,'Ancestry Powers','array');const extra=parseJsonField(ancestryExtraJson,'Advanced Ancestry JSON','object');const definition={...extra,id,name,description:ancestryDescription.value.trim(),mods:{Str:+ancestryStr.value||0,Dex:+ancestryDex.value||0,Con:+ancestryCon.value||0,Int:+ancestryInt.value||0,Wis:+ancestryWis.value||0,Cha:+ancestryCha.value||0},resources:{hp:+ancestryHp.value||0,mana:+ancestryMana.value||0,stamina:+ancestryStamina.value||0,surges:+ancestrySurges.value||0},powers};const {error}=await confluenceSupabase.rpc('gm_upsert_ancestry_definition',{p_id:id,p_name:name,p_definition:definition,p_is_active:ancestryActive.checked});if(error)throw error;editingAncestryId=id;await loadLibrary(false);loadAncestry(id);show(`Saved Ancestry: ${name}`)}
function duplicateAncestryRecord(){if(!editingAncestryId)return;editingAncestryId=null;ancestryId.disabled=false;ancestryId.value='';ancestryName.value=`${ancestryName.value} Copy`;ancestryEditorTitle.textContent='New Ancestry from Copy';ancestryStatus.textContent='Unsaved';renderAncestryList()}

function renderEssenceList(){
  const q=essenceSearch.value.trim().toLowerCase(),showInactive=showInactiveEssences.checked;
  const rows=essenceRows.filter(x=>(showInactive||x.is_active)&&(x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)));
  essenceList.innerHTML=rows.map(x=>{
    const count=eligibilityRows.filter(e=>e.essence_id===x.id).length;
    return `<button class="library-item ${editingEssenceId===x.id?'selected':''} ${x.is_active?'':'inactive'}" data-essence-id="${esc(x.id)}">
      <span><b>${esc(x.name)}</b><small>${esc(x.id)} · ${esc(x.associated_ability)}</small></span>
      <span class="library-meta">${count} Powers${x.is_active?'':' · INACTIVE'}</span>
    </button>`;
  }).join('')||'<div class="empty">No Essences match this filter.</div>';
  essenceList.querySelectorAll('[data-essence-id]').forEach(b=>b.onclick=()=>loadEssence(b.dataset.essenceId));
}

function renderPowerList(){
  const q=powerSearch.value.trim().toLowerCase(),slot=powerSlotFilter.value,showInactive=showInactivePowers.checked;
  const rows=powerRows.filter(x=>(showInactive||x.is_active)&&(!slot||String(x.slot_index)===slot)&&(x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)));
  powerList.innerHTML=rows.map(x=>{
    const enames=eligibilityRows.filter(e=>e.power_id===x.id).map(e=>essenceRows.find(z=>z.id===e.essence_id)?.name||e.essence_id);
    return `<button class="library-item ${editingPowerId===x.id?'selected':''} ${x.is_active?'':'inactive'}" data-power-id="${esc(x.id)}">
      <span><b>${esc(x.name)}</b><small>Slot ${x.slot_index} · ${esc(x.id)}</small></span>
      <span class="library-meta">${esc(enames.join(', ')||'No Essence')}${x.is_active?'':' · INACTIVE'}</span>
    </button>`;
  }).join('')||'<div class="empty">No Powers match this filter.</div>';
  powerList.querySelectorAll('[data-power-id]').forEach(b=>b.onclick=()=>loadPower(b.dataset.powerId));
}

function renderEligibility(selectedIds=[]){
  const selected=new Set(selectedIds);
  powerEligibility.innerHTML=essenceRows.map(e=>`<label class="eligibility-card ${e.is_active?'':'inactive'}">
    <input type="checkbox" value="${esc(e.id)}" ${selected.has(e.id)?'checked':''}>
    <span><b>${esc(e.name)}</b><small>${esc(e.associated_ability)}${e.is_active?'':' · inactive'}</small></span>
  </label>`).join('');
}

function newEssenceEditor(){
  editingEssenceId=null;
  essenceEditorTitle.textContent='New Essence';essenceStatus.textContent='Unsaved';
  essenceId.disabled=false;essenceId.value='';essenceName.value='';essenceAbility.value='Strength';essenceTier.value='Iron';
  essenceDescription.value='';essenceTraits.value='';essenceScores.value='[]';essenceExtraJson.value='{}';essenceActive.checked=true;
  renderEssenceList();essenceName.focus();
}

function loadEssence(id){
  const row=essenceRows.find(x=>x.id===id);if(!row)return;
  editingEssenceId=id;const d=row.definition||{};
  essenceEditorTitle.textContent=row.name;essenceStatus.textContent=row.is_active?'Active':'Inactive';
  essenceId.value=row.id;essenceId.disabled=true;essenceName.value=row.name;essenceAbility.value=row.associated_ability||'Strength';
  essenceTier.value=d.tier||'Iron';essenceDescription.value=d.description||'';
  essenceTraits.value=(d.primary_traits||[]).join(', ');
  essenceScores.value=pretty(d.associated_scores||[]);
  const known=new Set(['id','name','associated_ability','tier','description','primary_traits','associated_scores']);
  const extra=Object.fromEntries(Object.entries(d).filter(([k])=>!known.has(k)));
  essenceExtraJson.value=pretty(extra);essenceActive.checked=!!row.is_active;
  renderEssenceList();
}

async function saveEssenceRecord(){
  const id=(editingEssenceId||slugify(essenceId.value||essenceName.value));
  if(!id)throw new Error('Essence ID is required.');
  const name=essenceName.value.trim();if(!name)throw new Error('Essence name is required.');
  const scores=parseJsonField(essenceScores,'Associated Scores','array');
  const extra=parseJsonField(essenceExtraJson,'Advanced Essence JSON','object');
  const definition={...extra,id,name,tier:essenceTier.value,description:essenceDescription.value.trim(),
    primary_traits:essenceTraits.value.split(',').map(x=>x.trim()).filter(Boolean),
    associated_scores:scores,associated_ability:essenceAbility.value};
  const {error}=await confluenceSupabase.rpc('gm_upsert_essence_definition',{
    p_id:id,p_name:name,p_associated_ability:essenceAbility.value,p_definition:definition,p_is_active:essenceActive.checked
  });
  if(error)throw error;
  editingEssenceId=id;await loadLibrary(false);loadEssence(id);show(`Saved Essence: ${name}`);
}

function duplicateEssenceRecord(){
  if(!editingEssenceId)return;
  editingEssenceId=null;essenceId.disabled=false;essenceId.value='';essenceName.value=`${essenceName.value} Copy`;
  essenceEditorTitle.textContent='New Essence from Copy';essenceStatus.textContent='Unsaved';renderEssenceList();
}

function newPowerEditor(){
  editingPowerId=null;powerEditorTitle.textContent='New Power';powerStatus.textContent='Unsaved';
  powerId.disabled=false;powerId.value='';powerName.value='';powerSlot.value='1';powerFrequency.value=SLOT_META[1].frequency;
  powerDefinitionJson.value=pretty({slot:{index:1,category:SLOT_META[1].category,frequency:SLOT_META[1].frequency},rank_expressions:{Iron:[]}});
  powerActive.checked=true;renderEligibility([]);renderPowerList();powerName.focus();
}

function selectedEligibility(){return [...powerEligibility.querySelectorAll('input:checked')].map(x=>x.value)}

function loadPower(id){
  const row=powerRows.find(x=>x.id===id);if(!row)return;
  editingPowerId=id;const d=structuredClone(row.definition||{});
  powerEditorTitle.textContent=row.name;powerStatus.textContent=row.is_active?'Active':'Inactive';
  powerId.value=row.id;powerId.disabled=true;powerName.value=row.name;powerSlot.value=String(row.slot_index);
  powerFrequency.value=d.slot?.frequency||SLOT_META[row.slot_index]?.frequency||'Special';
  powerActive.checked=!!row.is_active;
  powerDefinitionJson.value=pretty(d);
  renderEligibility(eligibilityRows.filter(e=>e.power_id===id).map(e=>e.essence_id));
  renderPowerList();
}

function syncPowerJsonHeader(){
  let d={};try{d=JSON.parse(powerDefinitionJson.value||'{}')}catch{return}
  const slot=Number(powerSlot.value),meta=SLOT_META[slot],ids=selectedEligibility();
  d.id=editingPowerId||slugify(powerId.value||powerName.value);
  d.name=powerName.value.trim();
  d.slot={...(d.slot||{}),index:slot,category:meta.category,frequency:powerFrequency.value};
  d.eligible_essences=ids.map(id=>essenceRows.find(e=>e.id===id)?.name||id);
  powerDefinitionJson.value=pretty(d);
}

async function savePowerRecord(){
  const id=(editingPowerId||slugify(powerId.value||powerName.value));
  if(!id)throw new Error('Power ID is required.');
  const name=powerName.value.trim();if(!name)throw new Error('Power name is required.');
  const ids=selectedEligibility();if(!ids.length)throw new Error('Select at least one eligible Essence.');
  const slot=Number(powerSlot.value),meta=SLOT_META[slot];
  let definition=parseJsonField(powerDefinitionJson,'Power Definition JSON','object');
  definition={...definition,id,name,slot:{...(definition.slot||{}),index:slot,category:meta.category,frequency:powerFrequency.value},
    eligible_essences:ids.map(eid=>essenceRows.find(e=>e.id===eid)?.name||eid)};
  const {error}=await confluenceSupabase.rpc('gm_upsert_power_definition',{
    p_id:id,p_name:name,p_slot_index:slot,p_definition:definition,p_eligible_essence_ids:ids,p_is_active:powerActive.checked
  });
  if(error)throw error;
  editingPowerId=id;await loadLibrary(false);loadPower(id);show(`Saved Power: ${name}`);
}

function duplicatePowerRecord(){
  if(!editingPowerId)return;
  editingPowerId=null;powerId.disabled=false;powerId.value='';powerName.value=`${powerName.value} Copy`;
  powerEditorTitle.textContent='New Power from Copy';powerStatus.textContent='Unsaved';syncPowerJsonHeader();renderPowerList();
}

ancestrySearch.oninput=renderAncestryList;showInactiveAncestries.onchange=renderAncestryList;newAncestry.onclick=newAncestryEditor;saveAncestry.onclick=()=>saveAncestryRecord().catch(e=>show(e.message,true));duplicateAncestry.onclick=duplicateAncestryRecord;
essenceSearch.oninput=renderEssenceList;showInactiveEssences.onchange=renderEssenceList;
powerSearch.oninput=renderPowerList;powerSlotFilter.onchange=renderPowerList;showInactivePowers.onchange=renderPowerList;
newEssence.onclick=newEssenceEditor;newPower.onclick=newPowerEditor;
saveEssence.onclick=()=>saveEssenceRecord().catch(e=>show(e.message,true));
savePower.onclick=()=>savePowerRecord().catch(e=>show(e.message,true));
duplicateEssence.onclick=duplicateEssenceRecord;duplicatePower.onclick=duplicatePowerRecord;
powerSlot.onchange=()=>{powerFrequency.value=SLOT_META[Number(powerSlot.value)].frequency;syncPowerJsonHeader()};
powerFrequency.onchange=syncPowerJsonHeader;powerName.oninput=()=>{if(!editingPowerId&&!powerId.value)powerId.placeholder=slugify(powerName.value)||'power-id'};
powerEligibility.addEventListener('change',syncPowerJsonHeader);
logout.onclick=signOut;

(async()=>{
  try{await requireGm();await loadLibrary(false);newAncestryEditor();newEssenceEditor();newPowerEditor();show('GM content library loaded.')}
  catch(e){show(e.message||String(e),true)}
})();