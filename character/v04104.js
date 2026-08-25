
/* v0.4.10.4 — Hierarchical Rank Progression
   5 Powers -> 1 Essence; 4 Essences -> Character.
   Tier promotion requires every contributor to cross the threshold.
*/

const ESSENCE_POWER_SLOTS=5;
const CHARACTER_ESSENCE_SLOTS=4;

/* The legacy backend currently represents the Iron threshold as Iron 10.
   Normalize that for the rules/UI as Bronze 0. This also works recursively
   for later tier-10 records if they appear before backend storage is migrated. */
function normalizeTierRank(tier='Iron',rank=1){
 let ti=Math.max(0,tierIndex(tier)),r=Math.max(0,Number(rank)||0);
 while(r>=10 && ti<TIERS.length-1){
  ti+=1;r-=10;
 }
 return {tier:TIERS[ti]||tier,tierIndex:ti,rank:r};
}
function normalizedPowerProgress(idOrCp){
 const cp=typeof idOrCp==='string'?state.powers[idOrCp]:idOrCp;
 if(!cp)return normalizeTierRank('Iron',1);
 return normalizeTierRank(cp.tier||'Iron',cp.rank??1);
}
function displayPowerTierRank(cp){
 const n=normalizedPowerProgress(cp);
 return `${n.tier} ${n.rank}`;
}

/* Average contributors only inside the lowest current tier.
   Anything already beyond that tier counts as having completed the full
   10-step threshold. Therefore 9/10/10/10/10 remains Rank 9, while
   10/10/10/10/10 becomes the next tier at Rank 0. */
function aggregateRankProgress(contributors){
 if(!contributors.length)return normalizeTierRank('Iron',0);
 const normalized=contributors.map(c=>normalizeTierRank(c.tier,c.rank));
 const minTier=Math.min(...normalized.map(x=>x.tierIndex));
 const values=normalized.map(x=>x.tierIndex>minTier?10:x.rank);
 const rank=Math.floor(values.reduce((a,b)=>a+b,0)/normalized.length);
 if(rank>=10 && minTier<TIERS.length-1)return {tier:TIERS[minTier+1],tierIndex:minTier+1,rank:0};
 return {tier:TIERS[minTier],tierIndex:minTier,rank};
}

essenceInfo=function(name){
 const slots=[];
 for(let i=1;i<=ESSENCE_POWER_SLOTS;i++){
  const pd=assignedPowerForSlot(name,i),cp=pd?state.powers[pd.ownedId]:null;
  const n=cp?normalizedPowerProgress(cp):normalizeTierRank('Iron',1);
  slots.push({
   slot:i,pd,cp,
   tier:n.tier,rank:n.rank,
   progressionSource:cp?'power':'empty-slot'
  });
 }
 const progress=aggregateRankProgress(slots.map(s=>({tier:s.tier,rank:s.rank})));
 return {
  name,
  tier:progress.tier,
  rank:progress.rank,
  slots,
  total:slots.reduce((sum,s)=>sum+(s.rank||0),0),
  ability:sourceEssenceAbility(name)
 };
};

characterProgress=function(){
 const actual=allEssenceInfo();
 /* Characters are built around four Essence positions. If fewer than four
    are currently assigned, the missing positions count as Iron 1 so they
    cannot be ignored for Character Rank progression. */
 const contributors=actual.slice(0,CHARACTER_ESSENCE_SLOTS).map(e=>({tier:e.tier,rank:e.rank}));
 while(contributors.length<CHARACTER_ESSENCE_SLOTS)contributors.push({tier:'Iron',rank:1});
 const progress=aggregateRankProgress(contributors);
 return {tier:progress.tier,rank:progress.rank,essences:contributors};
};

/* Player-facing Power advancement/display treats legacy Rank 10 as Bronze 0. */
const powerCanAdvanceV04104Base=powerCanAdvance;
powerCanAdvance=function(id){
 const cp=ownedPower(id),pd=pdef(id),essence=sourceEssenceForPower(id);
 if(!cp||cp.ancestry||!pd||!essence)return {ok:false,reason:'Not rankable'};
 const n=normalizedPowerProgress(cp);
 /* Backend Bronze progression is not configured yet. A legacy Iron 10 record
    is already Bronze 0 and should not offer another Iron purchase. */
 if(n.tierIndex>0 || (cp.tier==='Iron'&&Number(cp.rank)>=10)){
  return {ok:false,reason:`${n.tier} ${n.rank} · next-tier advancement not configured`};
 }
 const nextRaw=(Number(cp.rank)||1)+1,cost=POWER_XP_COSTS[nextRaw]??null;
 if(cost==null)return {ok:false,reason:`Rank ${nextRaw} XP cost not configured`};
 if(state.xp<cost)return {ok:false,reason:`Need ${cost} XP`,cost,next:nextRaw};
 const next=normalizeTierRank(cp.tier||'Iron',nextRaw);
 return {ok:true,next:`${next.tier} ${next.rank}`,cost,next:nextRaw};
};
