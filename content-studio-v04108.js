
/* v0.4.10.8 — Targeted Power Text Mutation */

POWER_EFFECT_TYPES.splice(5,0,
 ['modify_text_value','Modify Existing Text Value']
);

const v04108PlaceholderBase=v0499Placeholder;
v0499Placeholder=function(t){
 if(t==='modify_text_value'){
  return 'Section | find text | replacement   e.g. Hit | Essence ability modifier. | Essence ability modifier + 2.';
 }
 return v04108PlaceholderBase(t);
};

const v04108BuildOperationBase=v0499BuildOperation;
v0499BuildOperation=function(type,value,base){
 if(type==='modify_text_value'){
   const parts=String(value).split('|').map(x=>x.trim());
   const section=(parts[0]||'Hit').toLowerCase();
   const find=parts[1]||'';
   const replace=parts.slice(2).join('|').trim();
   return {
     ui_type:type,
     ui_value:value,
     operation:'replace_text_once',
     section,
     find,
     replace
   };
 }
 return v04108BuildOperationBase(type,value,base);
};

const v04108InferTypeBase=v0499InferType;
v0499InferType=function(op){
 if(op.operation==='replace_text_once')return 'modify_text_value';
 return v04108InferTypeBase(op);
};
