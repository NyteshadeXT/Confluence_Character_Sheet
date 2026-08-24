
/* v0.4.10.0 — Power-specific ability choices + named rank rider mutations */
function v04100PowerAbilityConfig(id){
 const p=pdef(id)||{},cfg=p.attack_ability||{};
 if(cfg.mode==='choice'&&Array.isArray(cfg.allowed)&&cfg.allowed.length)return cfg;
 if(cfg.mode==='fixed'&&cfg.fixed)return cfg;
 return {mode:'essence'};
}
function v04100PowerAbilityChoiceKey(id){return `power-ability:${id}`}
function v04100ChosenPowerAbilityLong(id){
 const cfg=v04100PowerAbilityConfig(id);
 if(cfg.mode==='fixed')return cfg.fixed;
 if(cfg.mode==='choice'){
  const saved=state.essenceChoices?.[v04100PowerAbilityChoiceKey(id)];
  if(saved&&cfg.allowed.includes(saved))return saved;
  return null;
 }
 const key=sourceEssenceAbility(sourceEssenceForPower(id));
 return {Str:'Strength',Dex:'Dexterity',Con:'Constitution',Int:'Intelligence',Wis:'Wisdom',Cha:'Charisma'}[key]||null;
}
function v04100PowerAttackAbilityKey(id){
 const chosen=v04100ChosenPowerAbilityLong(id);
 return abilityKeyFromName(chosen)||sourceEssenceAbility(sourceEssenceForPower(id));
}
v0491PowerAttackAbilityKey=v04100PowerAttackAbilityKey;

function v04100PendingPowerAbilityChoices(){
 const out=[];
 for(const id of Object.keys(state.powers)){
  if(state.powers[id]?.ancestry)continue;
  const cfg=v04100PowerAbilityConfig(id);
  if(cfg.mode!=='choice')continue;
  const key=v04100PowerAbilityChoiceKey(id);
  if(!state.essenceChoices?.[key])out.push({id,key,p:pdef(id),cfg});
 }
 return out;
}
const renderPowerLibraryV04100Base=renderPowerLibrary;
renderPowerLibrary=function(){
 renderPowerLibraryV04100Base();
 const pending=v04100PendingPowerAbilityChoices(),host=document.getElementById('powerLibrary');
 if(!host||!pending.length)return;
 host.insertAdjacentHTML('afterbegin',`<section class="power-choice-panel">
   <div class="eyebrow">PERMANENT POWER CHOICE</div><h3>Choose Attack Ability</h3>
   <p class="small">This choice is permanent and drives the Power's attack and chosen-ability modifier text.</p>
   ${pending.map(x=>`<label class="power-choice-row"><span><b>${v0496Esc(x.p?.name||x.id)}</b><small>${x.cfg.allowed.join(' or ')}</small></span>
   <select data-power-ability-choice="${x.key}"><option value="">Choose…</option>${x.cfg.allowed.map(a=>`<option>${a}</option>`).join('')}</select></label>`).join('')}
 </section>`);
};
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('[data-power-ability-choice]');if(!sel||!sel.value)return;
 if(state.essenceChoices?.[sel.dataset.powerAbilityChoice])return;
 state.essenceChoices[sel.dataset.powerAbilityChoice]=sel.value;save();render();toast(`${sel.value} selected`);
},true);

const replaceModifierReferencesV04100Base=replaceModifierReferences;
replaceModifierReferences=function(text,id){
 let out=replaceModifierReferencesV04100Base(text,id);
 const key=v04100PowerAttackAbilityKey(id),chosen=key?ability(key).bonus:0;
 return out.replace(/\byour chosen ability modifier\b/gi,signed(chosen))
           .replace(/\bchosen ability modifier\b/gi,signed(chosen));
};

function v04100EscapeRe(s){return String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function v04100ModifyNamedEffectText(current,op){
 const name=String(op.effect_name||'').trim(),find=String(op.find||'');
 if(!name||!find)return current;
 const re=new RegExp(`(${v04100EscapeRe(name)}\\b[\\s\\S]*?)${v04100EscapeRe(find)}`,'i');
 return re.test(current)?current.replace(re,(_,prefix)=>prefix+String(op.replace??'')):current;
}
function v04100EnhanceNamedEffectText(current,op){
 const name=String(op.effect_name||'').trim(),extra=String(op.value||'').trim();
 if(!name||!extra)return current;
 const re=new RegExp(`(${v04100EscapeRe(name)}\\b[^\\n]*)(\\n|$)`,'i');
 if(re.test(current))return current.replace(re,`$1 ${extra}$2`);
 return `${current}${current?'\\n\\n':''}**${name}:** ${extra}`;
}
const applyExpressionOperationV04100Base=applyExpressionOperation;
applyExpressionOperation=function(model,op){
 if(op.operation==='modify_named_effect'){
  model.text=model.text||{};
  for(const section of ['hit','effect','miss','special']){
   const cur=String(model.text[section]??model[`${section}_text`]??'');
   if(cur)model.text[section]=v04100ModifyNamedEffectText(cur,op);
  }
  return;
 }
 if(op.operation==='enhance_named_effect'){
  model.text=model.text||{};let done=false;
  for(const section of ['hit','effect','miss','special']){
   const cur=String(model.text[section]??model[`${section}_text`]??'');
   if(cur&&new RegExp(`\\b${v04100EscapeRe(op.effect_name)}\\b`,'i').test(cur)){
    model.text[section]=v04100EnhanceNamedEffectText(cur,op);done=true;break;
   }
  }
  if(!done)model.text.effect=v04100EnhanceNamedEffectText(String(model.text.effect||''),op);
  return;
 }
 return applyExpressionOperationV04100Base(model,op);
};

function v04100LabelRankAppendOperations(id,p){
 for(const ex of v0496PowerExpressionList(id)){
  for(const op of ex.operations||[]){
   if(op.operation!=='append_text'||!op.section)continue;
   const raw=String(op.value||'').trim(),label=ex.name||`Rank ${ex.rank}`;
   if(!raw)continue;
   p.text=p.text||{};const cur=String(p.text[op.section]||'');
   if(cur.includes(raw)&&!cur.includes(`**${label}:**`))p.text[op.section]=cur.replace(raw,`**${label}:** ${raw}`);
  }
 }
 return p;
}
const resolvedPowerModelV04100Base=resolvedPowerModel;
resolvedPowerModel=function(id){
 const p=resolvedPowerModelV04100Base(id);
 return p?v04100LabelRankAppendOperations(id,p):p;
};
