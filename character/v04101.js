
/* v0.4.10.1 — Rank Mutation Resolver Fix */
function v04101ApplyNamedMutations(id,model){
 if(!model)return model;
 for(const ex of v0496PowerExpressionList(id)){
  for(const op of ex.operations||[]){
   if(op.trigger)continue;
   if(op.operation==='modify_named_effect'||op.operation==='enhance_named_effect'){
    applyExpressionOperation(model,op);
   }
  }
 }
 return model;
}
const resolvedPowerModelV04101Base=resolvedPowerModel;
resolvedPowerModel=function(id){
 return v04101ApplyNamedMutations(id,resolvedPowerModelV04101Base(id));
};
