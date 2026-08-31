
/* v0.4.11.0 — Power Ability Association + Bronze Breakthrough Progression */

const IRON_POWER_XP={2:10,3:15,4:20,5:25,6:30,7:35,8:40,9:50};
const BRONZE_BREAKTHROUGH_XP=150;
const BRONZE_POWER_XP={1:25,2:30,3:40,4:50,5:65,6:80,7:100,8:125,9:150};

function v04110AbilityLongFromKey(key){
 return {Str:'Strength',Dex:'Dexterity',Con:'Constitution',Int:'Intelligence',Wis:'Wisdom',Cha:'Charisma'}[key]||key||null;
}
function v04110SourceAbilityLong(id){
 return v04110AbilityLongFromKey(sourceEssenceAbility(sourceEssenceForPower(id)));
}
function v04110AbilityConfig(id){
 const cfg=(pdef(id)||{}).attack_ability||{};
 if(cfg.mode==='essence_alternate'&&cfg.alternate)return cfg;
 if(cfg.mode==='choice'&&Array.isArray(cfg.allowed)&&cfg.allowed.length)return cfg; // legacy
 if(cfg.mode==='fixed'&&cfg.fixed)return cfg; // legacy
 return {mode:'essence'};
}
function v04110AbilityOptions(id){
 const cfg=v04110AbilityConfig(id),source=v04110SourceAbilityLong(id);
 if(cfg.mode==='essence_alternate')return [...new Set([source,cfg.alternate].filter(Boolean))];
 if(cfg.mode==='choice')return [...new Set(cfg.allowed||[])];
 if(cfg.mode==='fixed')return [cfg.fixed];
 return source?[source]:[];
}
function v04110AbilityChoiceKey(id){return `power-ability:${id}`}
function v04110ChosenAbilityLong(id){
 const cfg=v04110AbilityConfig(id),opts=v04110AbilityOptions(id);
 if(cfg.mode==='fixed')return cfg.fixed;
 if(opts.length<=1)return opts[0]||v04110SourceAbilityLong(id);
 const saved=state.essenceChoices?.[v04110AbilityChoiceKey(id)];
 return saved&&opts.includes(saved)?saved:null;
}
function v04110PowerAttackAbilityKey(id){
 return abilityKeyFromName(v04110ChosenAbilityLong(id))||sourceEssenceAbility(sourceEssenceForPower(id));
}
v0491PowerAttackAbilityKey=v04110PowerAttackAbilityKey;
v04100PowerAttackAbilityKey=v04110PowerAttackAbilityKey;

function v04110PendingAbilityChoices(){
 const out=[];
 for(const id of Object.keys(state.powers)){
  if(state.powers[id]?.ancestry)continue;
  const options=v04110AbilityOptions(id),key=v04110AbilityChoiceKey(id);
  if(options.length>1&&!state.essenceChoices?.[key]){
   out.push({id,key,p:pdef(id),options,source:v04110SourceAbilityLong(id)});
  }
 }
 return out;
}

const replaceModifierReferencesV04110Base=replaceModifierReferences;
replaceModifierReferences=function(text,id){
 let out=replaceModifierReferencesV04110Base(text,id);
 const key=v04110PowerAttackAbilityKey(id),mod=key?ability(key).bonus:0;
 return out
  .replace(/\byour Essence ability modifier\b/gi,signed(mod))
  .replace(/\bEssence ability modifier\b/gi,signed(mod))
  .replace(/\byour chosen ability modifier\b/gi,signed(mod))
  .replace(/\bchosen ability modifier\b/gi,signed(mod));
};

/* Power rank progression: Iron 1-9; paid Bronze 0 breakthrough; then Bronze 1-9. */
function normalizedPowerProgress(cp){
 if(!cp)return {tier:'Iron',tierIndex:0,rank:1};
 return {tier:cp.tier||'Iron',tierIndex:tierIndex(cp.tier||'Iron'),rank:Number(cp.rank)||0};
}
function displayPowerTierRank(cp){
 const n=normalizedPowerProgress(cp);return `${n.tier} ${n.rank}`;
}
function v04110EssencePowerSlots(essence){
 const slots=[];
 for(let i=1;i<=5;i++){
  const pd=assignedPowerForSlot(essence,i),cp=pd?state.powers[pd.ownedId]:null;
  slots.push({slot:i,pd,cp});
 }
 return slots;
}
function v04110EssenceBreakthroughStatus(essence){
 const slots=v04110EssencePowerSlots(essence);
 const hasFive=slots.every(s=>!!s.cp);
 const boundaryReady=hasFive&&slots.every(s=>{
   const n=normalizedPowerProgress(s.cp);
   return (n.tier==='Iron'&&n.rank===9)||n.tierIndex>0;
 });
 const allBronze=hasFive&&slots.every(s=>normalizedPowerProgress(s.cp).tierIndex>=1);
 return {slots,hasFive,boundaryReady,allBronze};
}

function aggregateRankProgress(contributors){
 if(!contributors.length)return {tier:'Iron',tierIndex:0,rank:0};
 const xs=contributors.map(c=>({tier:c.tier,tierIndex:tierIndex(c.tier),rank:Number(c.rank)||0}));
 const minTier=Math.min(...xs.map(x=>x.tierIndex));
 const values=xs.map(x=>x.tierIndex>minTier?10:x.rank);
 const rank=Math.floor(values.reduce((a,b)=>a+b,0)/xs.length);
 if(rank>=10&&minTier<TIERS.length-1)return {tier:TIERS[minTier+1],tierIndex:minTier+1,rank:0};
 return {tier:TIERS[minTier],tierIndex:minTier,rank};
}
essenceInfo=function(name){
 const slots=[];
 for(let i=1;i<=5;i++){
  const pd=assignedPowerForSlot(name,i),cp=pd?state.powers[pd.ownedId]:null;
  const n=cp?normalizedPowerProgress(cp):{tier:'Iron',tierIndex:0,rank:1};
  slots.push({slot:i,pd,cp,tier:n.tier,rank:n.rank,progressionSource:cp?'power':'empty-slot'});
 }
 const progress=aggregateRankProgress(slots.map(s=>({tier:s.tier,rank:s.rank})));
 return {name,tier:progress.tier,rank:progress.rank,slots,total:slots.reduce((s,x)=>s+x.rank,0),ability:sourceEssenceAbility(name)};
};
characterProgress=function(){
 const contributors=allEssenceInfo().slice(0,4).map(e=>({tier:e.tier,rank:e.rank}));
 while(contributors.length<4)contributors.push({tier:'Iron',rank:1});
 const p=aggregateRankProgress(contributors);
 return {tier:p.tier,rank:p.rank,essences:contributors};
};

powerCanAdvance=function(id){
 const cp=ownedPower(id),essence=sourceEssenceForPower(id);
 if(!cp||cp.ancestry||!essence)return {ok:false,reason:'Not rankable'};
 const n=normalizedPowerProgress(cp),xp=Number(state.xp)||0;

 if(n.tier==='Iron'&&n.rank<9){
   const next=n.rank+1,cost=IRON_POWER_XP[next];
   if(xp<cost)return {ok:false,reason:`Need ${cost} XP`,cost,next:`Iron ${next}`};
   return {ok:true,cost,next:`Iron ${next}`,kind:'rank'};
 }
 if(n.tier==='Iron'&&n.rank===9){
   const s=v04110EssenceBreakthroughStatus(essence);
   if(!s.boundaryReady)return {ok:false,reason:'All 5 Powers must reach Iron 9'};
   if(xp<BRONZE_BREAKTHROUGH_XP)return {ok:false,reason:`Need ${BRONZE_BREAKTHROUGH_XP} XP`,cost:BRONZE_BREAKTHROUGH_XP,next:'Bronze 0'};
   return {ok:true,cost:BRONZE_BREAKTHROUGH_XP,next:'Bronze 0',kind:'breakthrough'};
 }
 if(n.tier==='Bronze'){
   const s=v04110EssenceBreakthroughStatus(essence);
   if(!s.allBronze)return {ok:false,reason:'Waiting for all 5 Powers to reach Bronze 0'};
   if(n.rank>=9)return {ok:false,reason:'Silver breakthrough not configured'};
   const next=n.rank+1,cost=BRONZE_POWER_XP[next];
   if(xp<cost)return {ok:false,reason:`Need ${cost} XP`,cost,next:`Bronze ${next}`};
   return {ok:true,cost,next:`Bronze ${next}`,kind:'rank'};
 }
 return {ok:false,reason:`${n.tier} advancement not configured`};
};

const renderPowerLibraryV04110Base=renderPowerLibrary;
renderPowerLibrary=function(){
 renderPowerLibraryV04110Base();
 const host=document.getElementById('powerLibrary');if(!host)return;

 const pending=v04110PendingAbilityChoices();
 if(pending.length){
  host.insertAdjacentHTML('afterbegin',`<section class="power-choice-panel">
   <div class="eyebrow">PERMANENT POWER ABILITY</div><h3>Choose Power Ability</h3>
   <p class="small">The source Essence ability is the default. This Power also permits one alternate ability.</p>
   ${pending.map(x=>`<label class="power-choice-row"><span><b>${v0496Esc(x.p?.name||x.id)}</b><small>Essence default: ${v0496Esc(x.source||'—')}</small></span>
    <select data-v04110-power-ability="${v0496Esc(x.key)}"><option value="">Choose…</option>${x.options.map(a=>`<option value="${v0496Esc(a)}">${v0496Esc(a)}${a===x.source?' · Essence default':''}</option>`).join('')}</select></label>`).join('')}
  </section>`);
 }

 for(const essence of state.essences){
  const s=v04110EssenceBreakthroughStatus(essence);
  const group=[...host.querySelectorAll('.owned-essence-group')].find(g=>g.querySelector('.owned-essence-head')?.textContent.includes(`${essence} Essence`));
  if(!group)continue;
  if(s.boundaryReady&&!s.allBronze){
   group.insertAdjacentHTML('afterbegin',`<div class="breakthrough-banner"><b>IRON COMPLETE</b><span>Bronze 0 breakthrough unlocked · ${BRONZE_BREAKTHROUGH_XP} XP per Power</span></div>`);
  }else if(s.allBronze){
   const e=essenceInfo(essence);
   group.insertAdjacentHTML('afterbegin',`<div class="breakthrough-banner bronze"><b>${essence} · Bronze ${e.rank}</b><span>Bronze advancement unlocked</span></div>`);
  }
 }
};
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('[data-v04110-power-ability]');
 if(!sel||!sel.value)return;
 const key=sel.dataset.v04110PowerAbility;
 if(state.essenceChoices?.[key])return;
 state.essenceChoices[key]=sel.value;save();render();toast(`${sel.value} selected for this Power`);
},true);
