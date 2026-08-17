
/* Confluence Character v0.4.9.4 — Skill XP Advancement & Scaled Power Costs */
const SKILL_XP_COSTS={2:10,3:15,4:20,5:25,6:35,7:45,8:60,9:75,10:100};
const POWER_XP_COSTS={2:10,3:15,4:20,5:25,6:30,7:35,8:40,9:50,10:60};

function skillRankCap(){
 const tier=characterProgress().tier;
 return tier==='Iron'?10:tier==='Bronze'?20:tier==='Silver'?30:tier==='Gold'?40:Infinity;
}
function skillRankStatus(name){
 const t=training(name),current=t.status==='Untrained'?0:(t.rating||1),next=current+1,cap=skillRankCap(),cost=SKILL_XP_COSTS[next]??null;
 if(t.status==='Untrained')return {ok:false,current,next,cost:null,reason:'Requires Training'};
 if(next>cap)return {ok:false,current,next,cost:null,reason:`${characterProgress().tier} cap · Rank ${cap}`};
 if(cost==null)return {ok:false,current,next,cost:null,reason:`Rank ${next} XP cost not configured`};
 if(state.xp<cost)return {ok:false,current,next,cost,reason:`Need ${cost} XP`};
 return {ok:true,current,next,cost,reason:`Rank ${next} · ${cost} XP`};
}
async function advanceSkill(name){
 if(CONNECTED_BACKEND.readOnly){toast('GM character view is read-only');return}
 const s=skillRankStatus(name);if(!s.ok){toast(s.reason);return}
 try{
  const {data,error}=await withTimeout(confluenceSupabase.rpc('player_rank_skill',{p_character_id:CONNECTED_BACKEND.characterId,p_skill_name:name}),10000,'Skill rank');
  if(error)throw error;
  await refreshFromBackend();toast(`${name} advanced to Rank ${data?.rank||s.next}`);
 }catch(err){toast(err.message||String(err))}
}

const powerCanAdvanceV0494Base=powerCanAdvance;
powerCanAdvance=function(id){
 const cp=ownedPower(id),pd=pdef(id),essence=sourceEssenceForPower(id);
 if(!cp||cp.ancestry||!pd||!essence)return {ok:false,reason:'Not rankable'};
 const next=cp.rank+1,cost=POWER_XP_COSTS[next]??null;
 if(cp.rank>=10)return {ok:false,reason:'Tier advancement not configured'};
 if(cost==null)return {ok:false,reason:`Rank ${next} XP cost not configured`};
 if(state.xp<cost)return {ok:false,reason:`Need ${cost} XP`,cost,next};
 return {ok:true,next:`${cp.tier} ${next}`,cost,next};
};

renderTraining=function(){
 document.getElementById('training').innerHTML=Object.entries(TRAINING).map(([group,rows])=>`<div class="training-group"><div class="subhead">${group}</div>${rows.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([name,type,supports])=>{
  const t=training(name),sv=type==='skill'?skillValue(name):null;
  if(type==='skill'){
   const rs=skillRankStatus(name),rank=t.status==='Untrained'?0:(t.rating||1);
   return `<div class="training-row skill-rank-row ${t.status!=='Untrained'?'is-trained':''}">
    <b>${name}</b>
    <span class="training-total" title="Current total modifier">${signed(sv.total)}</span>
    <select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>
    <span class="skill-rank-badge">Rank ${rank}</span>
    <button class="skill-rank-button ${rs.ok?'primary':''}" data-rank-skill="${name}" ${rs.ok?'':'disabled'}>${rs.ok?`Rank Up · ${rs.cost} XP`:rs.reason}</button>
    <details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Rank ${rank} · Active ${signed(sv.manual)} · Conditions ${signed(sv.condition)}${sv.essence!=null?` · Essence ${signed(sv.essence)}`:''}</span></details>
   </div>`;
  }
  if(!supports)return `<div class="training-row no-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b><select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select></div>`;
  return `<div class="training-row has-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b><span></span><select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select><input class="training-rating" data-rating="${name}" type="number" min="${t.status==='Untrained'?0:1}" value="${t.status==='Untrained'?0:(t.rating||1)}" ${t.status==='Untrained'?'disabled':''}></div>`;
 }).join('')}</div>`).join('');
};

renderPowerLibrary=function(){
 const ids=Object.keys(state.powers).filter(id=>!state.powers[id].ancestry),el=document.getElementById('powerLibrary');
 if(!ids.length){el.innerHTML='<div class="empty">No Essence Powers are known yet. Powers appear here only after the GM reveals them.</div>';return}
 const essenceOrder=[...state.essences,...new Set(ids.map(sourceEssenceForPower).filter(Boolean).filter(x=>!state.essences.includes(x)))];
 el.innerHTML=essenceOrder.map(essence=>{
  const group=ids.filter(id=>sourceEssenceForPower(id)===essence).sort((a,b)=>(powerMeta(pdef(a))?.slot||99)-(powerMeta(pdef(b))?.slot||99)||pdef(a).name.localeCompare(pdef(b).name));
  if(!group.length)return '';
  return `<details class="owned-essence-group" open><summary class="owned-essence-head"><span><span class="collapse-chevron">▾</span><b>${essence} Essence</b></span><span>${group.length}/5 Powers</span></summary><div class="owned-essence-body">${group.map(id=>{
   const a=powerCanAdvance(id),slot=powerMeta(pdef(id))?.slot;
   return `<div class="owned-power-row"><div class="owned-slot">SLOT ${slot}</div><div class="owned-power-card">${resolvedPowerCard(id)}<div class="actions power-rank-actions"><button class="primary" data-rank-power="${id}" ${a.ok?'':'disabled'}>${a.ok?`Rank Up · ${a.cost} XP`:a.reason}</button><span class="small">${a.ok?`Next: ${a.next}`:a.reason}</span></div></div></div>`;
  }).join('')}</div></details>`;
 }).join('');
};

document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-rank-skill]');if(b){e.preventDefault();e.stopPropagation();advanceSkill(b.dataset.rankSkill)}
},true);
