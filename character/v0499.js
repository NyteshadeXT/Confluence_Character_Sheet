/* MVP RC5: tier-aware training purchase preview, matching Neon skill RPC. */
function rankableTrainingStatus(name){
 const raw=state.training[name]||{};
 const status=raw.status||raw.proficiency||'Untrained';
 const trained=String(status).toLowerCase()!=='untrained';
 const rating=Math.max(1,Number(raw.rating)||Number(raw.rank)||1);
 const current=trained?rating:0;
 const tierNames=['Iron','Bronze','Silver','Gold'];
 const tierIndex=Math.min(3,Math.floor((rating-1)/10));
 const tier=tierNames[tierIndex];
 const localRank=((rating-1)%10)+1;
 const charTierIndex=tierNames.indexOf(characterProgress().tier);
 const next=current+1;
 if(!trained)return {ok:false,current,next,cost:null,reason:'Requires Training'};
 if(tierIndex>charTierIndex)return {ok:false,current,next,cost:null,reason:'Skill exceeds character tier'};
 let cost,description;
 if(localRank===10){
   if(tierIndex>=3||charTierIndex<=tierIndex)
     return {ok:false,current,next,cost:null,reason:'Next tier not unlocked'};
   cost=150;
   description=`${tierNames[tierIndex+1]} Rank 1 breakthrough`;
 }else{
   const base=SKILL_XP_COSTS[localRank+1];
   if(base==null)return {ok:false,current,next,cost:null,reason:'XP cost unavailable'};
   cost=base*(tierIndex+1);
   description=`${tier} Rank ${localRank+1}`;
 }
 if(state.xp<cost)return {ok:false,current,next,cost,reason:`Need ${cost} XP`};
 return {ok:true,current,next,cost,reason:`${description} · ${cost} XP`};
}
skillRankStatus=rankableTrainingStatus;
