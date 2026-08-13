
/* Confluence System Data Studio v0.4.8 */
let conditionRows=[],editingConditionId=null;

function installV048Studio(){
 const tabs=document.querySelector('.studio-tabs');
 if(!document.querySelector('[data-tab="conditions"]')){
  const b=document.createElement('button');b.className='studio-tab';b.dataset.tab='conditions';b.textContent='Condition Library';tabs.appendChild(b);
  b.onclick=()=>setTab('conditions');
 }
 if(!document.getElementById('conditionsTab')){
  const s=document.createElement('section');s.id='conditionsTab';s.className='studio-section hidden';
  s.innerHTML=`<div class="studio-layout"><aside class="panel library-pane">
   <div class="panel-head"><div><div class="eyebrow">MASTER DATA</div><h2>Conditions</h2></div><button id="newCondition" class="primary">New Condition</button></div>
   <input id="conditionSearch" class="wide" placeholder="Search Conditions"><label class="checkline"><input id="showInactiveConditions" type="checkbox" checked> Show inactive</label><div id="conditionList" class="library-list"></div>
  </aside><main class="panel editor-pane">
   <div class="panel-head"><div><div class="eyebrow">CONDITION DEFINITION</div><h2 id="conditionEditorTitle">New Condition</h2></div><span id="conditionStatus" class="pill">Unsaved</span></div>
   <div class="form-grid"><label>Condition ID<input id="conditionId" placeholder="e.g. blinded"></label><label>Name<input id="conditionName" placeholder="Blinded"></label>
   <label>Value Behavior<select id="conditionValueType"><option value="none">No numeric value</option><option value="required">Numeric value required</option><option value="optional">Numeric value optional</option></select></label>
   <label>Lifecycle<select id="conditionLifecycle"><option value="manual">Manual</option><option value="round_decay">Round decay</option><option value="rest">Ends on Long Rest</option><option value="rest_decay">Decreases on Long Rest</option><option value="event">Event-driven</option><option value="procedure">Procedure</option><option value="action_economy">Action economy</option></select></label></div>
   <label>Summary<textarea id="conditionSummary" rows="3"></textarea></label><label>Player Reminder<textarea id="conditionReminder" rows="3"></textarea></label>
   <section class="subpanel"><div class="eyebrow">STRUCTURED MODIFIERS</div><p class="muted">One per line: target = value. Examples: skill:Perception = -4, defense:AC = -2, attack:* = -2. Use -value for scaling conditions, e.g. saving:* = -value.</p><textarea id="conditionModifiers" rows="8" placeholder="skill:Perception = -4"></textarea></section>
   <label>Derived Conditions (comma separated)<input id="conditionDerived" placeholder="off_guard, immobilized"></label><label>Overrides (comma separated)<input id="conditionOverrides"></label>
   <details class="advanced-json"><summary>Advanced Condition JSON</summary><textarea id="conditionExtraJson" rows="8" class="code-field">{}</textarea></details>
   <label class="checkline"><input id="conditionActive" type="checkbox" checked> Active in master library</label>
   <div class="actions editor-actions"><button id="saveCondition" class="primary">Save Condition</button><button id="duplicateCondition">Duplicate as New</button></div>
  </main></div>`;
  document.querySelector('.studio-app').appendChild(s);
 }
 enhancePowerEditor();
 bindConditionStudio();
}
const oldSetTab=setTab;
setTab=function(tab){
 oldSetTab(tab);
 document.getElementById('conditionsTab')?.classList.toggle('hidden',tab!=='conditions');
 document.querySelectorAll('.studio-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
};

function enhancePowerEditor(){
 const jsonLabel=powerDefinitionJson.closest('label');
 if(document.getElementById('powerDescription'))return;
 const box=document.createElement('section');box.className='subpanel';box.innerHTML=`
  <div class="eyebrow">CONFLUENCE POWER TEXT</div>
  <div class="form-grid"><label>Power Type / Concept<input id="powerType" placeholder="Attack · Core Concept"></label><label>Keywords<input id="powerKeywords" placeholder="Martial, Weapon"></label>
  <label>Dungeon Resonance<input id="powerResonance" value="Neutral"></label><label>Action Type<input id="powerActionType" placeholder="Single Action"></label>
  <label>Attack Type & Range<input id="powerRange" placeholder="Melee weapon"></label><label>Target<input id="powerTarget" placeholder="One creature"></label></div>
  <label>Description / Flavor<textarea id="powerDescription" rows="4"></textarea></label>
  <div class="form-grid"><label>Trigger<textarea id="powerTrigger" rows="2"></textarea></label><label>Requirements<textarea id="powerRequirements" rows="2"></textarea></label></div>
  <label>Attack<textarea id="powerAttackText" rows="2" placeholder="Power Attack vs. AC"></textarea></label>
  <label>Hit<textarea id="powerHitText" rows="3"></textarea></label><label>Miss<textarea id="powerMissText" rows="3"></textarea></label>
  <label>Effect<textarea id="powerEffectText" rows="3"></textarea></label><label>Special<textarea id="powerSpecialText" rows="3"></textarea></label><label>Sustain<textarea id="powerSustainText" rows="2"></textarea></label>`;
 jsonLabel.parentNode.insertBefore(box,jsonLabel);
}
function fillPowerFields(d){
 powerType.value=d.power_type||d.concept||d.slot?.category||'';
 powerKeywords.value=(d.classification?.keywords||d.classification?.traits||d.keywords||[]).join?.(', ')||'';
 powerResonance.value=d.classification?.dungeon_resonance||d.dungeon_resonance||'Neutral';
 powerActionType.value=d.activation?.action_type||d.action_type||'';
 powerRange.value=d.attack_type_range||d.targeting?.range?.origin||d.range||'';
 powerTarget.value=d.target||d.targeting?.target?.selector||'';
 powerDescription.value=d.description||d.flavor||d.flavor_text||'';
 powerTrigger.value=typeof d.activation?.trigger==='string'?d.activation.trigger:(d.trigger||'');
 powerRequirements.value=Array.isArray(d.activation?.requirements)?d.activation.requirements.join('\n'):(d.requirements||'');
 powerAttackText.value=d.text?.attack||d.attack_text||'';
 powerHitText.value=d.text?.hit||d.hit_text||'';
 powerMissText.value=d.text?.miss||d.miss_text||'';
 powerEffectText.value=d.text?.effect||d.effect_text||'';
 powerSpecialText.value=d.text?.special||d.special_text||'';
 powerSustainText.value=d.text?.sustain||d.sustain_text||'';
}
const oldLoadPower=loadPower;
loadPower=function(id){oldLoadPower(id);const row=powerRows.find(x=>x.id===id);if(row)fillPowerFields(row.definition||{})};
const oldNewPowerEditor=newPowerEditor;
newPowerEditor=function(){oldNewPowerEditor();fillPowerFields({})};
const oldSavePowerRecord=savePowerRecord;
savePowerRecord=async function(){
 let d=parseJsonField(powerDefinitionJson,'Power Definition JSON','object');
 d.power_type=powerType.value.trim();d.description=powerDescription.value.trim();
 d.classification={...(d.classification||{}),frequency:powerFrequency.value,keywords:powerKeywords.value.split(',').map(x=>x.trim()).filter(Boolean),dungeon_resonance:powerResonance.value.trim()||'Neutral'};
 d.activation={...(d.activation||{}),action_type:powerActionType.value.trim(),trigger:powerTrigger.value.trim()||null,requirements:powerRequirements.value.split('\n').map(x=>x.trim()).filter(Boolean)};
 d.attack_type_range=powerRange.value.trim();d.target=powerTarget.value.trim();
 d.text={...(d.text||{}),attack:powerAttackText.value.trim(),hit:powerHitText.value.trim(),miss:powerMissText.value.trim(),effect:powerEffectText.value.trim(),special:powerSpecialText.value.trim(),sustain:powerSustainText.value.trim()};
 powerDefinitionJson.value=pretty(d);
 return oldSavePowerRecord();
};

function parseConditionModifiers(text){
 return String(text||'').split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{
  const [target,raw]=line.split('=').map(x=>x.trim());if(!target||!raw)throw new Error(`Invalid modifier line: ${line}`);
  if(raw.toLowerCase()==='-value')return {target,valueFromCondition:-1,type:'condition'};
  if(raw.toLowerCase()==='value')return {target,valueFromCondition:1,type:'condition'};
  const value=Number(raw);if(!Number.isFinite(value))throw new Error(`Invalid modifier value: ${raw}`);
  return {target,value,type:'condition'};
 });
}
function formatConditionModifiers(mods){return (mods||[]).map(m=>`${m.target} = ${m.valueFromCondition===-1?'-value':m.valueFromCondition===1?'value':m.value}`).join('\n')}
async function loadConditions(){
 const {data,error}=await confluenceSupabase.from('condition_definitions').select('id,name,definition,is_active').order('name');if(error)throw error;conditionRows=data||[];renderConditionList();
}
function renderConditionList(){
 const q=conditionSearch.value.trim().toLowerCase(),show=showInactiveConditions.checked;
 const rows=conditionRows.filter(x=>(show||x.is_active)&&(x.name.toLowerCase().includes(q)||x.id.includes(q)));
 conditionList.innerHTML=rows.map(x=>`<button class="library-item ${editingConditionId===x.id?'selected':''} ${x.is_active?'':'inactive'}" data-condition-id="${esc(x.id)}"><span><b>${esc(x.name)}</b><small>${esc(x.id)}</small></span><span class="library-meta">${x.is_active?'Active':'INACTIVE'}</span></button>`).join('')||'<div class="empty">No Conditions match this filter.</div>';
 conditionList.querySelectorAll('[data-condition-id]').forEach(b=>b.onclick=()=>loadCondition(b.dataset.conditionId));
}
function newConditionEditor(){
 editingConditionId=null;conditionEditorTitle.textContent='New Condition';conditionStatus.textContent='Unsaved';conditionId.disabled=false;conditionId.value='';conditionName.value='';conditionValueType.value='none';conditionLifecycle.value='manual';conditionSummary.value='';conditionReminder.value='';conditionModifiers.value='';conditionDerived.value='';conditionOverrides.value='';conditionExtraJson.value='{}';conditionActive.checked=true;renderConditionList();
}
function loadCondition(id){
 const row=conditionRows.find(x=>x.id===id);if(!row)return;const d=row.definition||{};editingConditionId=id;conditionEditorTitle.textContent=row.name;conditionStatus.textContent=row.is_active?'Active':'Inactive';conditionId.value=id;conditionId.disabled=true;conditionName.value=row.name;conditionValueType.value=d.valueType||'none';conditionLifecycle.value=d.lifecycle?.type||'manual';conditionSummary.value=d.summary||'';conditionReminder.value=d.reminder||'';conditionModifiers.value=formatConditionModifiers(d.modifiers);conditionDerived.value=(d.derived||[]).map(x=>x.conditionId||x).join(', ');conditionOverrides.value=(d.overrides||[]).join(', ');conditionActive.checked=!!row.is_active;const known=new Set(['id','name','valueType','lifecycle','summary','reminder','modifiers','derived','overrides']);conditionExtraJson.value=pretty(Object.fromEntries(Object.entries(d).filter(([k])=>!known.has(k))));renderConditionList();
}
async function saveConditionRecord(){
 const id=editingConditionId||slugify(conditionId.value||conditionName.value),name=conditionName.value.trim();if(!id||!name)throw new Error('Condition ID and Name are required.');
 const extra=parseJsonField(conditionExtraJson,'Advanced Condition JSON','object'),life=conditionLifecycle.value;
 const definition={...extra,id,name,valueType:conditionValueType.value,lifecycle:{type:life,...(life==='round_decay'||life==='rest_decay'?{amount:1}: {})},summary:conditionSummary.value.trim(),reminder:conditionReminder.value.trim(),modifiers:parseConditionModifiers(conditionModifiers.value),derived:conditionDerived.value.split(',').map(x=>x.trim()).filter(Boolean).map(conditionId=>({conditionId})),overrides:conditionOverrides.value.split(',').map(x=>x.trim()).filter(Boolean)};
 const {error}=await confluenceSupabase.rpc('gm_upsert_condition_definition',{p_id:id,p_name:name,p_definition:definition,p_is_active:conditionActive.checked});if(error)throw error;editingConditionId=id;await loadConditions();loadCondition(id);show(`Saved Condition: ${name}`);
}
function bindConditionStudio(){
 conditionSearch.oninput=renderConditionList;showInactiveConditions.onchange=renderConditionList;newCondition.onclick=newConditionEditor;saveCondition.onclick=()=>saveConditionRecord().catch(e=>show(e.message,true));duplicateCondition.onclick=()=>{editingConditionId=null;conditionId.disabled=false;conditionId.value='';conditionName.value+=' Copy';conditionEditorTitle.textContent='New Condition from Copy';conditionStatus.textContent='Unsaved'};
 loadConditions().then(newConditionEditor).catch(e=>show(e.message,true));
}
installV048Studio();
