
/* v0.4.10.8 — Targeted Power Text Mutation safety layer */
const applyExpressionOperationV04108Base=applyExpressionOperation;
applyExpressionOperation=function(model,op){
 if(op.operation==='replace_text_once'){
   const section=op.section||op.target_section;
   if(!section)return;
   model.text=model.text||{};
   let current=String(model.text[section]??model[`${section}_text`]??'');
   const find=String(op.find??'');
   if(find){
     const idx=current.indexOf(find);
     if(idx>=0){
       current=current.slice(0,idx)+String(op.replace??'')+current.slice(idx+find.length);
     }
   }
   model.text[section]=current;
   return;
 }
 return applyExpressionOperationV04108Base(model,op);
};
