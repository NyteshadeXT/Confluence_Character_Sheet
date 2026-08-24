
/* Confluence Character v0.4.9.6 — Resolved Power Display */

const v0496Esc=typeof v0492Esc==='function'?v0492Esc:(s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
function v0496PowerExpressionList(id){
 const p=pdef(id),cp=state.powers[id];if(!p||!cp)return [];
 const tier=cp.tier||'Iron';
 const legacy=Array.isArray(p.rank_expressions?.[tier])?p.rank_expressions[tier]:[];
 const structured=p.tier_progression?.find?.(t=>t.tier===tier)?.rank_expressions||[];
 const all=[...structured,...legacy]
   .filter(ex=>Number(ex.rank)<=Number(cp.rank))
   .sort((a,b)=>Number(a.rank)-Number(b.rank));
 const seen=new Set(),out=[];
 for(const ex of all){
  const key=`${ex.rank}|${ex.name||''}|${ex.effect||ex.description||''}|${JSON.stringify(ex.operations||[])}`;
  if(seen.has(key))continue;
  seen.add(key);out.push(ex);
 }
 return out;
}
activeExpressions=function(id){return v0496PowerExpressionList(id)};

function v049681ApplyLegacyExpression(model,ex){
 const text=String(ex.effect||ex.description||'').trim();
 if(!text)return;
 model.text=model.text||{};
 const hit=String(model.text.hit??model.hit_text??'');

 const dmg=text.match(/damage\s+(?:increases|changes)\s+to\s+([0-9]+d[0-9]+(?:\s*[+\-]\s*[^.;]+)?)/i);
 if(dmg&&hit){
  const replacement=dmg[1].trim();
  const current=hit.match(/[0-9]+d[0-9]+(?:\s*[+\-]\s*[^.,;]+)?/i);
  if(current)model.text.hit=hit.replace(current[0],replacement);
 }

 const atk=text.match(/gain\s+([+-]?\d+)\s+(?:bonus\s+)?to\s+attack rolls?/i);
 if(atk){
  model.resolved_rank_effects=model.resolved_rank_effects||[];
  model.resolved_rank_effects.push({type:'rank_attack_bonus',amount:Number(atk[1])||0,text});
 }

 if(!(dmg&&hit)){
  model.resolved_rank_effects=model.resolved_rank_effects||[];
  model.resolved_rank_effects.push({type:'rank_expression_text',rank:ex.rank,name:ex.name||`Rank ${ex.rank}`,text});
 }
}

function v0496ApplyTextOperation(model,op){
 const section=op.section||op.target_section;
 if(!section)return;
 model.text=model.text||{};
 let current=String(model.text[section]??model[`${section}_text`]??'');
 if(op.operation==='replace_text'){
  if(op.find==='__CURRENT_DAMAGE_DICE__'){
   current=current.replace(/\b\d+d\d+\b/i,String(op.replace??''));
  }else if(op.find==='__CURRENT_DAMAGE_FORMULA__'){
   current=current.replace(/\b\d+d\d+(?:\s*[+\-]\s*[^.,;\n]+)?/i,String(op.replace??''));
  }else if(op.find==='__CURRENT_RANGE__'){
   current=current.replace(/\b(?:Melee|Ranged)\s+\d+\b/i,String(op.replace??''));
  }else if(op.find!=null)current=current.split(String(op.find)).join(String(op.replace??''));
  else if(op.value!=null)current=String(op.value);
 }else if(op.operation==='append_text'){
  current=[current,String(op.value||op.text||'')].filter(Boolean).join(current?'\n\n':'');
 }else if(op.operation==='prepend_text'){
  current=[String(op.value||op.text||''),current].filter(Boolean).join(current?'\n\n':'');
 }
 model.text[section]=current;
}
const applyExpressionOperationV0496Base=applyExpressionOperation;
applyExpressionOperation=function(model,op){
 if(['replace_text','append_text','prepend_text'].includes(op.operation))return v0496ApplyTextOperation(model,op);
 return applyExpressionOperationV0496Base(model,op);
};
resolvedPowerModel=function(id){
 const source=pdef(id);if(!source)return null;
 const model=clone(source);model.resolved_rank_effects=[];
 for(const ex of v0496PowerExpressionList(id)){
  const ops=ex.operations||[];
  if(ops.length){
   for(const op of ops){
    if(['modify','add','replace','remove','unlock','replace_text','append_text','prepend_text'].includes(op.operation)&&!op.trigger){
      applyExpressionOperation(model,op);
    }
   }
  }else{
   v049681ApplyLegacyExpression(model,ex);
  }
  model.resolved_rank_effects.push({
   type:'rank_expression',
   rank:ex.rank,
   name:ex.name||`Rank ${ex.rank}`,
   text:ex.effect||ex.description||''
  });
 }
 return model;
};

function v0496EssenceDamageType(id,rawText=''){
 const essence=sourceEssenceForPower(id);if(!essence)return null;
 const text=String(rawText||'');
 // Explicit structured mapping wins when present.
 const p=pdef(id)||{};
 const map=p.damage_type_by_essence||p.essence_damage_types||{};
 const direct=map[essence]||map[essence.toLowerCase?.()];
 if(direct)return String(direct);
 // Support the existing player-facing mapping convention in Hit text.
 const lines=text.replace(/\r/g,'').split('\n');
 for(const line of lines){
  const clean=line.replace(/\*/g,'').replace(/^[-•]\s*/,'').trim();
  const m=clean.match(/^(.+?)\s*[:\-]?\s+(Radiant|Psychic|Mental|Sonic|Force|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Physical)\s+damage\.?$/i);
  if(!m)continue;
  const names=m[1].split('&').map(x=>x.trim().toLowerCase());
  if(names.includes(essence.toLowerCase())){
   const type=m[2].toLowerCase();
   return type==='mental'?'psychic':type;
  }
 }
 return null;
}
function v0496ResolveDamageText(text,id){
 let out=String(text||''),damageType=v0496EssenceDamageType(id,out);
 if(!damageType)return out;
 // Remove the explanatory mapping once the character's source Essence is known.
 out=out.replace(/\s*The damage type is determined by the Essence that unlocked this power:\s*(?:\n\s*[-•].*)+/i,'');
 out=out.replace(/\s*The damage type is determined by the Essence that unlocked this power:[\s\S]*$/i,'');
 // Add the resolved type before the first untyped "damage".
 out=out.replace(/(\b(?:\d+d\d+(?:\s*[+\-]\s*[^.,;\n]+)?|[\d]+\[W\](?:\s*[+\-]\s*[^.,;\n]+)?)\s+)damage\b/i,`$1${damageType} damage`);
 return out.trim();
}
function v0496ResolveAttackText(text,id){
 const atk=powerAttackBonus(id);
 let out=String(text||'');
 if(/\bPower Attack\b/i.test(out)){
  out=out.replace(/\bPower Attack\b(?!\s*\()/i,`Power Attack (${signed(atk.total)})`);
 }
 return out;
}
function v0496ResolveSectionText(section,value,id){
 let text=asText(value);
 if(section==='attack')text=v0496ResolveAttackText(text,id);
 if(section==='hit'||section==='effect'||section==='miss')text=v0496ResolveDamageText(text,id);
 return replaceModifierReferences(text,id);
}

powerSections=function(p,id){
 const r=p.profile?.resolution||p.resolution||{},attack=r.attack||r.attacks?.[0];
 const attackText=powerField(p,'text.attack','attack_text')||(attack?`Power Attack vs. ${String(attack.defense||'Defense')}`:'');
 const hit=powerField(p,'text.hit','hit_text')||r.hit;
 const miss=powerField(p,'text.miss','miss_text')||r.miss;
 const effect=powerField(p,'text.effect','effect_text')||p.profile?.effects||p.effects;
 const special=powerField(p,'text.special','special_text','special_rules');
 const sustain=powerField(p,'text.sustain','sustain_text');
 return [['attack','Attack',attackText,'attack'],['hit','Hit',hit,'hit'],['miss','Miss',miss,'miss'],['effect','Effect',effect,'effect'],['special','Special',special,'special'],['sustain','Sustain',sustain,'special']]
 .filter(x=>asText(x[2])).map(([section,label,val,cls])=>{
   const resolved=v0496ResolveSectionText(section,val,id);
   return `<div class="power-text-section ${cls}"><b>${label}</b>${formatPowerRichText(resolved,id)}</div>`;
 }).join('');
};

function v0496ExpressionSummary(id){
 const ex=v0496PowerExpressionList(id);if(!ex.length)return '';
 return `<details class="power-progression"><summary>Applied Rank Effects</summary>${ex.map(x=>`<div class="rank-effect-row"><b>Rank ${x.rank}${x.name?` — ${v0496Esc(x.name)}`:''}</b>${x.effect?`<span>${formatPowerRichText(x.effect,id)}</span>`:''}</div>`).join('')}</details>`;
}
const resolvedPowerCardV0496Base=resolvedPowerCard;
resolvedPowerCard=function(id,combat=false){
 let html=resolvedPowerCardV0496Base(id,combat);
 const marker='</article>';
 if(html.includes(marker))html=html.replace(marker,`${v0496ExpressionSummary(id)}${marker}`);
 return html;
};
