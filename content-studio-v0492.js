
/* Confluence System Data Studio v0.4.9.2 — Attack Effects & Essence Power Coverage */
if(typeof V0491_EFFECT_TYPES!=='undefined'){
 if(!V0491_EFFECT_TYPES.some(x=>x[0]==='modify_power_attack_keyword'))V0491_EFFECT_TYPES.push(['modify_power_attack_keyword','Power Attack Keyword']);
 if(!V0491_EFFECT_TYPES.some(x=>x[0]==='modify_round_attack'))V0491_EFFECT_TYPES.push(['modify_round_attack','Combat Round Attack']);
}
const parseMilestoneEffectsV0492Base=parseMilestoneEffects;
parseMilestoneEffects=function(text){
 return String(text||'').split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{
  const [kindRaw,target,amountRaw]=line.split('|').map(x=>x.trim()),kind=kindRaw.toLowerCase();
  if(kind==='power_attack_keyword'||kind==='round_attack'){
   const amount=Number(amountRaw);if(!target||!Number.isFinite(amount))throw new Error(`Invalid milestone effect: ${line}`);
   return {type:kind==='power_attack_keyword'?'modify_power_attack_keyword':'modify_round_attack',target,amount};
  }
  return parseMilestoneEffectsV0492Base(line)[0];
 });
};
const formatMilestoneEffectsV0492Base=formatMilestoneEffects;
formatMilestoneEffects=function(effects){
 return (effects||[]).filter(e=>e.type!=='choice').map(e=>{
  if(e.type==='modify_power_attack_keyword')return `power_attack_keyword | ${e.target||''} | ${e.amount??0}`;
  if(e.type==='modify_round_attack')return `round_attack | ${e.target||e.round||''} | ${e.amount??0}`;
  return formatMilestoneEffectsV0492Base([e]);
 }).join('\n');
};

renderEssenceList=function(){
 const q=essenceSearch.value.trim().toLowerCase(),showInactive=showInactiveEssences.checked;
 const rows=essenceRows.filter(x=>(showInactive||x.is_active)&&(x.name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)));
 essenceList.innerHTML=rows.map(x=>{
   const links=eligibilityRows.filter(e=>e.essence_id===x.id);
   const counts=[1,2,3,4,5].map(slot=>links.filter(link=>Number(powerRows.find(p=>p.id===link.power_id)?.slot_index)===slot).length);
   const count=counts.reduce((a,b)=>a+b,0),missing=counts.map((n,i)=>n?null:i+1).filter(Boolean),complete=!missing.length;
   return `<button class="library-item essence-coverage-card ${editingEssenceId===x.id?'selected':''} ${x.is_active?'':'inactive'}" data-essence-id="${esc(x.id)}">
      <span class="essence-coverage-main"><b>${esc(x.name)}</b><small>${esc(x.id)} · ${esc(x.associated_ability)}</small><span class="slot-coverage">${counts.map((n,i)=>`<span class="${n?'has-power':'missing-power'}">S${i+1}:${n}</span>`).join('')}</span></span>
      <span class="library-meta"><b>${complete?'Full Suite':'Incomplete'}</b><small>${count} Power${count===1?'':'s'}${missing.length?` · Missing ${missing.join(', ')}`:''}</small>${x.is_active?'':' · INACTIVE'}</span>
    </button>`;
 }).join('')||'<div class="empty">No Essences match this filter.</div>';
 essenceList.querySelectorAll('[data-essence-id]').forEach(b=>b.onclick=()=>loadEssence(b.dataset.essenceId));
};
renderEssenceList();
