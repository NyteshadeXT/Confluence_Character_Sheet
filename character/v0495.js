
/* Confluence Character v0.4.9.5 — Weapon Skill Advancement & Compact UI */
function rankableTrainingStatus(name){
 const t=training(name),current=t.status==='Untrained'?0:(t.rating||1),next=current+1,cap=skillRankCap(),cost=SKILL_XP_COSTS[next]??null;
 if(t.status==='Untrained')return {ok:false,current,next,cost:null,reason:'Requires Training'};
 if(next>cap)return {ok:false,current,next,cost:null,reason:`${characterProgress().tier} cap · Rank ${cap}`};
 if(cost==null)return {ok:false,current,next,cost:null,reason:`Rank ${next} XP cost not configured`};
 if(state.xp<cost)return {ok:false,current,next,cost,reason:`Need ${cost} XP`};
 return {ok:true,current,next,cost,reason:`Rank ${next} · ${cost} XP`};
}
skillRankStatus=rankableTrainingStatus;

async function advanceTrainingRank(name){
 if(CONNECTED_BACKEND.readOnly){toast('GM character view is read-only');return}
 const s=rankableTrainingStatus(name);if(!s.ok){toast(s.reason);return}
 try{
  const {data,error}=await withTimeout(
   confluenceSupabase.rpc('player_rank_skill',{p_character_id:CONNECTED_BACKEND.characterId,p_skill_name:name}),
   10000,'Training rank'
  );
  if(error)throw error;
  await refreshFromBackend();toast(`${name} advanced to Rank ${data?.rank||s.next}`);
 }catch(err){toast(err.message||String(err))}
}
advanceSkill=advanceTrainingRank;

function compactRankableTrainingRow(name,type){
 const t=training(name),rank=t.status==='Untrained'?0:(t.rating||1),rs=rankableTrainingStatus(name);
 const isSkill=type==='skill',sv=isSkill?skillValue(name):null;
 return `<div class="compact-training-row ${t.status!=='Untrained'?'is-trained':''}">
   <div class="training-name"><b>${name}</b>${isSkill?`<span class="training-score">${signed(sv.total)}</span>`:''}</div>
   <select class="training-prof" data-training="${name}" aria-label="${name} proficiency">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>
   <span class="skill-rank-badge">R${rank}</span>
   <button class="compact-rank-button ${rs.ok?'primary':''}" data-rank-training="${name}" ${rs.ok?'':'disabled'}>${rs.ok?`↑ ${rs.cost} XP`:rs.reason}</button>
   ${isSkill?`<details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Rank ${rank} · Active ${signed(sv.manual)} · Conditions ${signed(sv.condition)}${sv.essence!=null?` · Essence ${signed(sv.essence)}`:''}</span></details>`:''}
  </div>`;
}
function compactProficiencyRow(name){
 const t=training(name);
 return `<div class="compact-training-row proficiency-only ${t.status!=='Untrained'?'is-trained':''}">
   <div class="training-name"><b>${name}</b></div>
   <select class="training-prof" data-training="${name}" aria-label="${name} proficiency">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>
  </div>`;
}
renderTraining=function(){
 const skills=TRAINING.Skills.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>compactRankableTrainingRow(n,t)).join('');
 const weapons=TRAINING.Weapons.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n,t])=>compactRankableTrainingRow(n,t)).join('');
 const armor=TRAINING.Armor.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n])=>compactProficiencyRow(n)).join('');
 const saves=TRAINING['Saving Throws'].slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([n])=>compactProficiencyRow(n)).join('');
 document.getElementById('training').innerHTML=`
  <div class="training-primary-grid">
   <section class="training-compact-group"><div class="compact-group-head"><span>Skills</span><small>Total · Proficiency · Rank · Advance</small></div>${skills}</section>
   <section class="training-compact-group"><div class="compact-group-head"><span>Weapon Skills</span><small>Proficiency · Rank · Advance</small></div>${weapons}</section>
  </div>
  <div class="training-secondary-grid">
   <section class="training-compact-group"><div class="compact-group-head"><span>Armor & Shields</span><small>Proficiency</small></div>${armor}</section>
   <section class="training-compact-group"><div class="compact-group-head"><span>Saving Throws</span><small>Proficiency</small></div>${saves}</section>
  </div>`;
};

/* Keep the same server-side advancement operation for Skills and Weapon Skills. */
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-rank-training]');
 if(b){e.preventDefault();e.stopPropagation();advanceTrainingRank(b.dataset.rankTraining)}
},true);

/* The normal Power library defaults to collapsed Essence groups in compact desktop mode. */
renderPowerLibrary=function(){
 const ids=Object.keys(state.powers).filter(id=>!state.powers[id].ancestry),el=document.getElementById('powerLibrary');
 if(!ids.length){el.innerHTML='<div class="empty">No Essence Powers are known yet. Powers appear here only after the GM reveals them.</div>';return}
 const essenceOrder=[...state.essences,...new Set(ids.map(sourceEssenceForPower).filter(Boolean).filter(x=>!state.essences.includes(x)))];
 el.innerHTML=essenceOrder.map(essence=>{
  const group=ids.filter(id=>sourceEssenceForPower(id)===essence).sort((a,b)=>(powerMeta(pdef(a))?.slot||99)-(powerMeta(pdef(b))?.slot||99)||pdef(a).name.localeCompare(pdef(b).name));
  if(!group.length)return '';
  return `<details class="owned-essence-group">
   <summary class="owned-essence-head"><span><span class="collapse-chevron">▾</span><b>${essence} Essence</b></span><span>${group.length} Powers</span></summary>
   <div class="owned-essence-body">${group.map(id=>{
    const a=powerCanAdvance(id),slot=powerMeta(pdef(id))?.slot;
    return `<div class="owned-power-row"><div class="owned-slot">S${slot}</div><div class="owned-power-card">${resolvedPowerCard(id)}<div class="actions power-rank-actions"><button class="primary" data-rank-power="${id}" ${a.ok?'':'disabled'}>${a.ok?`Rank Up · ${a.cost} XP`:a.reason}</button><span class="small">${a.ok?`Next: ${a.next}`:a.reason}</span></div></div></div>`;
   }).join('')}</div>
  </details>`;
 }).join('');
};
