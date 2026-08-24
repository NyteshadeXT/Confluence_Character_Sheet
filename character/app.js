
const STORAGE_KEY = 'confluence-character-alpha-v0.8';
const TIERS = ['Iron','Bronze','Silver','Gold','Platinum'];
const XP_PER_POWER_RANK = 20;
const PROFICIENCIES = ['Untrained','Trained','Expert','Master','Legendary','Mythic'];
const ABILITY_BONUS = {1:-5,2:-4,3:-4,4:-3,5:-3,6:-2,7:-2,8:-1,9:-1,10:0,11:0,12:1,13:1,14:2,15:2,16:3,17:3,18:4,19:4,20:5,21:5,22:6,23:6,24:7,25:7,26:8,27:8,28:9,29:9,30:10,31:10,32:11,33:11,34:12,35:12,36:13,37:13,38:14,39:14,40:15};
let ANCESTRY = {id:null,name:'Unassigned',mods:{Str:0,Dex:0,Con:0,Int:0,Wis:0,Cha:0},resources:{hp:0,mana:0,stamina:0,surges:0},powers:[]};
const LOADOUT_SLOTS = [
 ['Core 1','core'],['Core 2','core'],
 ['Utility 1','utility'],['Utility 2','utility'],
 ['Signature 1','signature'],['Signature 2','signature'],['Signature 3','signature'],
 ['Tactical 1','tactical'],['Tactical 2','tactical'],['Tactical 3','tactical'],
 ['Apex','apex']
];
const POWER_SLOT_ROLES = {
  1:{name:'Core',category:'core',typical:'At-Will'},
  2:{name:'Utility / Passive',category:'utility',typical:'Utility / Passive'},
  3:{name:'Signature Strike',category:'signature',typical:'Usually Encounter'},
  4:{name:'Tactical',category:'tactical',typical:'Usually Encounter'},
  5:{name:'Apex',category:'apex',typical:'Daily'}
};
const HIDDEN_ESSENCE_CATALOG = [];
let MASTER_POWER_MODELS = [];
let MASTER_ESSENCE_MODELS = [];



const POWER_DB = [];
POWER_DB.forEach(p=>{if(p.slot&&POWER_SLOT_ROLES[p.slot])p.category=POWER_SLOT_ROLES[p.slot].category});

const ESSENCE_EFFECTS = [
 {essence:'Chain',tier:'Iron',rank:9,target:'ac',value:1,label:'Enforced Order: +1 AC'},
 {essence:'Chain',tier:'Iron',rank:9,target:'savingThrows',value:1,label:'Enforced Order: +1 Saving Throws'}
];
const CONDITION_DEFINITIONS = [{"id":"blinded","name":"Blinded","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":["dazzled"],"automation":"partial","summary":"Can't see; visual perception is impaired and normal terrain is difficult terrain.","reminder":"If vision is your only precise sense, Perception checks take \u20134; visual effects do not affect you."},{"id":"clumsy","name":"Clumsy","valueType":"required","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value on Dexterity-based rolls and DCs.","reminder":"Applies to AC, Reflex, ranged attacks, Acrobatics, Stealth, Thievery, and other DEX-based rolls/DCs."},{"id":"concealed","name":"Concealed","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"Harder to target due to obscuring features.","reminder":"Creatures you're concealed from make a DC 5 flat check to target you; area effects are unaffected."},{"id":"confused","name":"Confused","valueType":"none","lifecycle":{"type":"event"},"derived":[{"conditionId":"off_guard"}],"overrides":[],"automation":"partial","summary":"You attack wildly and don't treat anyone as an ally.","reminder":"No Delay, Ready, or reactions. Damage from an attack/spell permits a DC 11 flat recovery check."},{"id":"controlled","name":"Controlled","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"A controller dictates how you act.","reminder":"The controller can direct your actions, attacks, reactions, and Delay."},{"id":"dazzled","name":"Dazzled","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"Vision is impaired.","reminder":"If vision is your only precise sense, creatures and objects are concealed from you."},{"id":"doomed","name":"Doomed","valueType":"required","lifecycle":{"type":"rest_decay","event":"full_rest","amount":1},"derived":[],"overrides":[],"automation":"lifecycle","summary":"Your maximum dying threshold is reduced by the condition value.","reminder":"Decreases by 1 after a full night's rest."},{"id":"drained","name":"Drained","valueType":"required","lifecycle":{"type":"rest_decay","event":"full_rest","amount":1},"derived":[],"overrides":[],"automation":"partial","summary":"Penalty equal to value on Constitution-based rolls and DCs.","reminder":"Fortitude is automated. HP reduction remains unresolved because the current rule references character level."},{"id":"dying","name":"Dying","valueType":"required","lifecycle":{"type":"procedure"},"derived":[{"conditionId":"unconscious"}],"overrides":[],"automation":"partial","summary":"You are bleeding out and must make recovery checks.","reminder":"At dying 4 you die. Recovery and damage can increase/decrease the value; losing Dying grants/increases Wounded."},{"id":"encumbered","name":"Encumbered","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"clumsy","value":1}],"overrides":[],"automation":"partial","summary":"You are carrying more than you can manage.","reminder":"Includes Clumsy 1 and a 10-foot Speed penalty."},{"id":"enfeebled","name":"Enfeebled","valueType":"required","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value on Strength-based rolls and DCs.","reminder":"Applies to STR melee attacks, STR damage rolls, Athletics, and other STR-based rolls/DCs."},{"id":"fascinated","name":"Fascinated","valueType":"none","lifecycle":{"type":"event"},"derived":[],"overrides":[],"automation":"numeric","summary":"Distracted by a subject of fascination.","reminder":"\u20132 Perception and skill checks; concentrate actions are restricted. Ends if hostile action targets you/allies."},{"id":"fatigued","name":"Fatigued","valueType":"required","lifecycle":{"type":"rest"},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value to AC and saving throws.","reminder":"Recovered after a full night's rest."},{"id":"fleeing","name":"Fleeing","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"You must flee the source as efficiently as possible.","reminder":"You can't Delay or Ready."},{"id":"frightened","name":"Frightened","valueType":"required","lifecycle":{"type":"round_decay","event":"round","amount":1},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value to all checks and DCs.","reminder":"Decreases by 1 when the Round button advances, unless an effect says otherwise."},{"id":"grabbed","name":"Grabbed","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"off_guard"},{"conditionId":"immobilized"}],"overrides":[],"automation":"partial","summary":"Held in place.","reminder":"Includes Off-Guard and Immobilized. Manipulate actions require a DC 5 flat check."},{"id":"hidden","name":"Hidden","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"A creature knows your space but not your precise position.","reminder":"You are Off-Guard to the hidden creature; targeting generally requires a DC 11 flat check."},{"id":"immobilized","name":"Immobilized","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"You can't use actions with the move trait.","reminder":"Forced movement may require a check against the holding effect or relevant defense."},{"id":"invisible","name":"Invisible","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"undetected"}],"overrides":[],"automation":"reference","summary":"You can't be seen.","reminder":"Typically Undetected; creatures can Seek and may make you Hidden."},{"id":"observed","name":"Observed","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"You are in plain view to the observer.","reminder":"Stealth can change this state to Hidden or Undetected."},{"id":"off_guard","name":"Off-Guard","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"numeric","summary":"Your attention is compromised.","reminder":"\u20132 circumstance penalty to AC."},{"id":"paralyzed","name":"Paralyzed","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"off_guard"}],"overrides":[],"automation":"partial","summary":"Frozen in place and unable to act normally.","reminder":"Includes Off-Guard; only actions requiring the mind are available as GM determines."},{"id":"persistent_damage","name":"Persistent Damage","valueType":"optional","lifecycle":{"type":"procedure"},"derived":[],"overrides":[],"automation":"reference","summary":"Ongoing damage occurs at the end of your turn.","reminder":"Roll the persistent damage, then attempt the listed recovery flat check (normally DC 15). Damage expression/type entry is a future UI."},{"id":"petrified","name":"Petrified","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"Turned to stone and unable to act or sense.","reminder":"The current rule changes you into an object with special AC/Hardness/HP behavior; not automated yet."},{"id":"prone","name":"Prone","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"off_guard"}],"overrides":[],"automation":"numeric","summary":"Lying on the ground.","reminder":"Includes Off-Guard and \u20132 to attack rolls; movement is restricted until you Stand."},{"id":"quickened","name":"Quickened","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"Gain 1 additional action at the start of your turn.","reminder":"The source effect may restrict how the extra action can be used."},{"id":"restrained","name":"Restrained","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"off_guard"},{"conditionId":"immobilized"}],"overrides":["grabbed"],"automation":"partial","summary":"Pinned or bound and barely able to move.","reminder":"Includes Off-Guard and Immobilized; attack/manipulate actions are heavily restricted. Overrides Grabbed."},{"id":"sickened","name":"Sickened","valueType":"required","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value to all checks and DCs.","reminder":"Cannot willingly ingest things. A retch action can reduce the value after a Fortitude save."},{"id":"slowed","name":"Slowed","valueType":"required","lifecycle":{"type":"action_economy"},"derived":[],"overrides":[],"automation":"reference","summary":"Regain fewer actions at the start of your turn.","reminder":"Action-economy automation is deferred."},{"id":"stunned","name":"Stunned","valueType":"required","lifecycle":{"type":"action_economy"},"derived":[],"overrides":["slowed"],"automation":"reference","summary":"Lose actions as you regain them.","reminder":"Overrides Slowed while active; action-economy automation is deferred."},{"id":"stupefied","name":"Stupefied","valueType":"required","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"numeric","summary":"Penalty equal to value on Intelligence-, Wisdom-, and Charisma-based rolls and DCs.","reminder":"Also affects spell attacks/DCs; spell disruption flat check remains a table procedure."},{"id":"unconscious","name":"Unconscious","valueType":"none","lifecycle":{"type":"event"},"derived":[{"conditionId":"blinded"},{"conditionId":"off_guard"},{"conditionId":"prone"}],"overrides":[],"automation":"partial","summary":"You can't act.","reminder":"\u20134 AC, Perception, and Reflex; includes Blinded, Off-Guard, and Prone. Wake-up procedures remain table adjudication."},{"id":"undetected","name":"Undetected","valueType":"none","lifecycle":{"type":"manual"},"derived":[],"overrides":[],"automation":"reference","summary":"A creature doesn't know which space you occupy.","reminder":"Area effects can still affect you; guessed targeting uses hidden-target procedures."},{"id":"unnoticed","name":"Unnoticed","valueType":"none","lifecycle":{"type":"manual"},"derived":[{"conditionId":"undetected"}],"overrides":[],"automation":"reference","summary":"A creature has no idea you're present.","reminder":"You are also Undetected."},{"id":"wounded","name":"Wounded","valueType":"required","lifecycle":{"type":"event"},"derived":[],"overrides":[],"automation":"reference","summary":"Serious injury increases future Dying severity.","reminder":"Ends after specified healing/rest procedures."}];
const TRAINING = {
 Armor:[
  ['Chainmail','armor',false],['Cloth Armor','armor',false],['Heavy Shield','shield',false],['Hide Armor','armor',false],
  ['Leather Armor','armor',false],['Light Shield','shield',false],['Plate Armor','armor',false],['Scale Armor','armor',false]
 ],
 Weapons:[
  ['Axe','weapon',true],['Bow','weapon',true],['Crossbow','weapon',true],['Flail','weapon',true],['Hammer','weapon',true],
  ['Heavy Blade','weapon',true],['Light Blade','weapon',true],['Mace','weapon',true],['Pick','weapon',true],['Polearm','weapon',true],
  ['Sling','weapon',true],['Spear','weapon',true],['Staff','weapon',true],['Unarmed','weapon',true]
 ],
 Skills:[
  ['Acrobatics','skill',true],['Arcana','skill',true],['Athletics','skill',true],['Deception','skill',true],['Diplomacy','skill',true],
  ['Dungeoneering','skill',true],['Insight','skill',true],['Intimidate','skill',true],['Medicine','skill',true],
  ['Nature','skill',true],['Perception','skill',true],['Performance','skill',true],['Religion','skill',true],
  ['Stealth','skill',true],['Survival','skill',true],['Thievery','skill',true]
 ],
 'Saving Throws':[
  ['Fortitude','defense',false],['Reflex','defense',false],['Will','defense',false]
 ]
};
const EQUIPMENT_DB = [{"id":"armor:cloth","name":"Cloth","kind":"armor","weight":4,"hardness":0,"maxHp":10,"trainingName":"Cloth Armor","category":"Light","ac":0,"checkPenalty":0,"speedPenalty":0},{"id":"armor:leather","name":"Leather","kind":"armor","weight":15,"hardness":1,"maxHp":20,"trainingName":"Leather Armor","category":"Light","ac":2,"checkPenalty":0,"speedPenalty":0},{"id":"armor:hide","name":"Hide","kind":"armor","weight":25,"hardness":2,"maxHp":24,"trainingName":"Hide Armor","category":"Light","ac":3,"checkPenalty":-1,"speedPenalty":0},{"id":"armor:chainmail","name":"Chainmail","kind":"armor","weight":40,"hardness":3,"maxHp":30,"trainingName":"Chainmail","category":"Heavy","ac":6,"checkPenalty":-1,"speedPenalty":-1},{"id":"armor:scale","name":"Scale","kind":"armor","weight":45,"hardness":4,"maxHp":36,"trainingName":"Scale Armor","category":"Heavy","ac":7,"checkPenalty":0,"speedPenalty":-1},{"id":"armor:plate","name":"Plate","kind":"armor","weight":50,"hardness":5,"maxHp":42,"trainingName":"Plate Armor","category":"Heavy","ac":8,"checkPenalty":-2,"speedPenalty":-1},{"id":"shield:light","name":"Light Shield","kind":"shield","weight":6,"hardness":3,"maxHp":10,"trainingName":"Light Shield","category":"Shield","ac":1,"checkPenalty":0,"speedPenalty":0},{"id":"shield:heavy","name":"Heavy Shield","kind":"shield","weight":15,"hardness":5,"maxHp":10,"trainingName":"Heavy Shield","category":"Shield","ac":2,"checkPenalty":-2,"speedPenalty":0},{"id":"weapon:club","name":"Club","kind":"weapon","weight":3,"category":"Simple Melee","mode":"melee","damage":"1d6","range":null,"groups":["Mace"]},{"id":"weapon:dagger","name":"Dagger","kind":"weapon","weight":1,"category":"Simple Melee","mode":"melee","damage":"1d4","range":"5/10","groups":["Light Blade"],"properties":[{"id":"off-hand","data":"{}"},{"id":"light-thrown","data":"{\"range\":\"5/10\"}"}]},{"id":"weapon:javelin","name":"Javelin","kind":"weapon","weight":2,"category":"Simple Melee","mode":"melee","damage":"1d6","range":"10/20","groups":["Spear"],"properties":[{"id":"heavy-thrown","data":"{\"range\":\"10/20\"}"}]},{"id":"weapon:mace","name":"Mace","kind":"weapon","weight":6,"category":"Simple Melee","mode":"melee","damage":"1d8","range":null,"groups":["Mace"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:sickle","name":"Sickle","kind":"weapon","weight":2,"category":"Simple Melee","mode":"melee","damage":"1d6","range":null,"groups":["Light Blade"],"properties":[{"id":"off-hand","data":"{}"}]},{"id":"weapon:spear","name":"Spear","kind":"weapon","weight":6,"category":"Simple Melee","mode":"melee","damage":"1d8","range":null,"groups":["Spear"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:greatclub","name":"Greatclub","kind":"weapon","weight":10,"category":"Simple Melee","mode":"melee","damage":"2d4","range":null,"groups":["Mace"]},{"id":"weapon:morningstar","name":"Morningstar","kind":"weapon","weight":8,"category":"Simple Melee","mode":"melee","damage":"1d10","range":null,"groups":["Mace"]},{"id":"weapon:quarterstaff","name":"Quarterstaff","kind":"weapon","weight":4,"category":"Simple Melee","mode":"melee","damage":"1d8","range":null,"groups":["Staff"]},{"id":"weapon:scythe","name":"Scythe","kind":"weapon","weight":10,"category":"Simple Melee","mode":"melee","damage":"2d4","range":null,"groups":["Heavy Blade"]},{"id":"weapon:battleaxe","name":"Battleaxe","kind":"weapon","weight":6,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Axe"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:flail","name":"Flail","kind":"weapon","weight":5,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Flail"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:handaxe","name":"Handaxe","kind":"weapon","weight":3,"category":"Martial Melee","mode":"melee","damage":"1d6","range":"5/10","groups":["Axe"],"properties":[{"id":"off-hand","data":"{}"},{"id":"thrown","data":"{\"range\":\"5/10\"}"}]},{"id":"weapon:longsword","name":"Longsword","kind":"weapon","weight":4,"category":"Martial Melee","mode":"melee","damage":"1d8","range":null,"groups":["Heavy Blade"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:scimitar","name":"Scimitar","kind":"weapon","weight":4,"category":"Martial Melee","mode":"melee","damage":"1d8","range":null,"groups":["Heavy Blade"],"properties":[{"id":"high-crit","data":"{}"}]},{"id":"weapon:short-sword","name":"Short Sword","kind":"weapon","weight":2,"category":"Martial Melee","mode":"melee","damage":"1d6","range":null,"groups":["Light Blade"],"properties":[{"id":"off-hand","data":"{}"}]},{"id":"weapon:throwing-hammer","name":"Throwing Hammer","kind":"weapon","weight":2,"category":"Martial Melee","mode":"melee","damage":"1d6","range":"5/10","groups":["Hammer"],"properties":[{"id":"off-hand","data":"{}"},{"id":"heavy-thrown","data":"{\"range\":\"5/10\"}"}]},{"id":"weapon:warhammer","name":"Warhammer","kind":"weapon","weight":5,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Hammer"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:war-pick","name":"War pick","kind":"weapon","weight":6,"category":"Martial Melee","mode":"melee","damage":"1d8","range":null,"groups":["Pick"],"properties":[{"id":"high-crit","data":"{}"},{"id":"versatile","data":"{}"}]},{"id":"weapon:falchion","name":"Falchion","kind":"weapon","weight":7,"category":"Martial Melee","mode":"melee","damage":"2d4","range":null,"groups":["Heavy Blade"],"properties":[{"id":"high-crit","data":"{}"}]},{"id":"weapon:glaive","name":"Glaive","kind":"weapon","weight":10,"category":"Martial Melee","mode":"melee","damage":"2d4","range":null,"groups":["Heavy Blade","Polearm"],"properties":[{"id":"reach","data":"{}"}]},{"id":"weapon:greataxe","name":"Greataxe","kind":"weapon","weight":12,"category":"Martial Melee","mode":"melee","damage":"1d12","range":null,"groups":["Axe"],"properties":[{"id":"high-crit","data":"{}"}]},{"id":"weapon:greatsword","name":"Greatsword","kind":"weapon","weight":8,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Heavy Blade"]},{"id":"weapon:halberd","name":"Halberd","kind":"weapon","weight":12,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Axe","Polearm"],"properties":[{"id":"reach","data":"{}"}]},{"id":"weapon:heavy-flail","name":"Heavy flail","kind":"weapon","weight":10,"category":"Martial Melee","mode":"melee","damage":"2d6","range":null,"groups":["Flail"]},{"id":"weapon:longspear","name":"Longspear","kind":"weapon","weight":9,"category":"Martial Melee","mode":"melee","damage":"1d10","range":null,"groups":["Polearm","Spear"],"properties":[{"id":"reach","data":"{}"}]},{"id":"weapon:maul","name":"Maul","kind":"weapon","weight":12,"category":"Martial Melee","mode":"melee","damage":"2d6","range":null,"groups":["Hammer"]},{"id":"weapon:bastard-sword","name":"Bastard Sword","kind":"weapon","weight":6,"category":"Advanced Melee","mode":"melee","damage":"1d10","range":null,"groups":["Heavy Blade"],"properties":[{"id":"versatile","data":"{}"}]},{"id":"weapon:katar","name":"Katar","kind":"weapon","weight":1,"category":"Advanced Melee","mode":"melee","damage":"1d6","range":null,"groups":["Light Blade"],"properties":[{"id":"off-hand","data":"{}"},{"id":"high-crit","data":"{}"}]},{"id":"weapon:rapier","name":"Rapier","kind":"weapon","weight":2,"category":"Advanced Melee","mode":"melee","damage":"1d8","range":null,"groups":["Light Blade"]},{"id":"weapon:spiked-chain","name":"Spiked Chain","kind":"weapon","weight":10,"category":"Advanced Melee","mode":"melee","damage":"2d4","range":null,"groups":["Flail"],"properties":[{"id":"reach","data":"{}"}]},{"id":"weapon:unarmed","name":"Unarmed","kind":"weapon","weight":null,"category":"Simple Melee","mode":"melee","damage":"1d4","range":null,"groups":["Unarmed"]},{"id":"weapon:hand-crossbow","name":"Hand Crossbow","kind":"weapon","weight":2,"category":"Simple Ranged","mode":"ranged","damage":"1d6","range":"10/20","groups":["Crossbow"],"properties":[{"id":"load-free","data":"{}"}]},{"id":"weapon:sling","name":"Sling","kind":"weapon","weight":null,"category":"Simple Ranged","mode":"ranged","damage":"1d6","range":"10/20","groups":["Sling"],"properties":[{"id":"load-free","data":"{}"}]},{"id":"weapon:crossbow","name":"Crossbow","kind":"weapon","weight":4,"category":"Simple Ranged","mode":"ranged","damage":"1d8","range":"15/30","groups":["Crossbow"],"properties":[{"id":"load-single","data":"{}"}]},{"id":"weapon:longbow","name":"Longbow","kind":"weapon","weight":3,"category":"Martial Ranged","mode":"ranged","damage":"1d10","range":"20/40","groups":["Bow"],"properties":[{"id":"load-free","data":"{}"}]},{"id":"weapon:short-bow","name":"Short Bow","kind":"weapon","weight":2,"category":"Martial Ranged","mode":"ranged","damage":"1d8","range":"15/30","groups":["Bow"],"properties":[{"id":"load-free","data":"{}"},{"id":"small","data":"{}"}]},{"id":"weapon:throwing-knife","name":"Throwing Knife","kind":"weapon","weight":0.5,"category":"Martial Ranged","mode":"ranged","damage":"1d4","range":"5/10","groups":["Light Blade"],"properties":[{"id":"light-thrown","data":"{\"range\":\"5/10\"}"}]},{"id":"weapon:heavy-crossbow","name":"Heavy Crossbow","kind":"weapon","weight":6,"category":"Martial Ranged","mode":"ranged","damage":"1d12","range":"20/40","groups":["Crossbow"],"properties":[{"id":"load-double","data":"{}"}]}];


const CONNECTED_BACKEND={characterId:new URLSearchParams(location.search).get('character')||'',connected:false,syncing:false,timer:null,readOnly:false,isOwner:false,isGm:false};
function withTimeout(promise,ms,label='Request'){
 return Promise.race([
   promise,
   new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out after ${Math.round(ms/1000)} seconds`)),ms))
 ]);
}

async function backendRequest(action,{body}={}){
 if(action==='snapshot'){
   const {data,error}=await withTimeout(confluenceSupabase.rpc('get_character_snapshot',{p_character_id:CONNECTED_BACKEND.characterId}),10000,'Character snapshot');
   if(error)throw error;return data;
 }
 if(CONNECTED_BACKEND.readOnly)throw new Error('GM character view is read-only');
 if(action==='runtime'){
   const {data,error}=await withTimeout(confluenceSupabase.rpc('player_update_runtime',{p_character_id:CONNECTED_BACKEND.characterId,p_state:body}),10000,'Runtime save');
   if(error)throw error;return data;
 }
 if(action==='profile'){
   const {data,error}=await withTimeout(confluenceSupabase.rpc('player_update_profile_state',{
     p_character_id:CONNECTED_BACKEND.characterId,
     p_training:body.training_json,p_equipment:body.equipment_json,
     p_loadout:body.loadout_json,p_essence_choices:body.essence_choices_json
   }),10000,'Profile save');
   if(error)throw error;return data;
 }
 if(action==='rank'){
   const {data,error}=await withTimeout(confluenceSupabase.rpc('player_rank_power',{p_character_power_id:body.character_power_id}),10000,'Power rank');
   if(error)throw error;return data;
 }
 throw new Error('Unknown backend action');
}

function stateFromBackend(data){
 ANCESTRY={id:data.ancestry_id||null,name:data.ancestry||'Unassigned',mods:{Str:0,Dex:0,Con:0,Int:0,Wis:0,Cha:0,...(data.ancestry_definition?.mods||{})},resources:{hp:0,mana:0,stamina:0,surges:0,...(data.ancestry_definition?.resources||{})},powers:Array.isArray(data.ancestry_definition?.powers)?data.ancestry_definition.powers:[],progression_passive:data.ancestry_definition?.progression_passive||null};
 MASTER_POWER_MODELS.length=0;MASTER_ESSENCE_MODELS.length=0;
 for(const e of data.essences||[])if(e.definition&&!MASTER_ESSENCE_MODELS.some(x=>x.id===e.definition.id))MASTER_ESSENCE_MODELS.push(e.definition);
 for(const p of data.powers||[])if(p.definition&&!MASTER_POWER_MODELS.some(x=>x.id===p.definition.id))MASTER_POWER_MODELS.push(p.definition);

 const d=clone(DEFAULTS);
 d.profile={...d.profile,name:data.name||'Character',ancestry:data.ancestry||'Unknown',player:data.player_user_id||'',dungeon:'The Shattering'};
 d.attributes={...d.attributes,...(data.attributes||{})};
 d.resources={...d.resources,hp:data.runtime?.hp??10,mana:data.runtime?.mana??0,stamina:data.runtime?.stamina??0,
   surges:data.runtime?.surges??0,tempHp:data.runtime?.tempHp??0,barrier:data.runtime?.barrier??0};
 d.xp=Number(data.available_xp)||0;
 d.xpLedger=(data.xp_ledger||[]).map(x=>({amount:x.amount,type:x.transaction_type,note:x.note||''}));
 d.essences=(data.essences||[]).map(e=>e.name);
 d.essenceChoices=data.essence_choices||{};
 d.training=data.training||{};
 d.equipment=data.equipment||[];
 d.loadout=data.loadout||{};
 d.powers={};
 const essenceNames=new Map((data.essences||[]).map(e=>[e.id,e.name]));
 for(const p of data.powers||[]){
   const ename=essenceNames.get(p.source_essence_id)||p.source_essence_id;
   const key=ownedPowerKey(p.power_id,ename);
   d.powers[key]={tier:p.tier,rank:p.rank,ancestry:false,sourceEssence:ename,definitionId:p.power_id,serverOwnedId:p.owned_id};
 }
 d.combat={...d.combat,active:!!data.runtime?.combat_active,round:data.runtime?.round||1,
   shortRestRecoveryAvailable:data.runtime?.short_rest_recovery_available!==false,
   loadoutUnlocked:!!data.runtime?.loadout_unlocked,conditions:data.runtime?.conditions||[],
   modifiers:data.runtime?.modifiers||[],dailyExpended:data.runtime?.daily_expended||{},conditionReview:false};
 return normalize(d);
}
async function refreshFromBackend(message=null){
 const data=await backendRequest('snapshot');
 state=stateFromBackend(data);CONNECTED_BACKEND.connected=true;render();
 const e=document.getElementById('saveState');
 if(e)e.textContent=CONNECTED_BACKEND.readOnly?'GM read-only view':(message||'Connected · saved to backend');
}
function scheduleBackendSync(){
 if(!CONNECTED_BACKEND.connected||CONNECTED_BACKEND.readOnly)return;
 clearTimeout(CONNECTED_BACKEND.timer);
 const e=document.getElementById('saveState');if(e)e.textContent='Saving…';
 CONNECTED_BACKEND.timer=setTimeout(syncStateToBackend,180);
}
async function syncStateToBackend(){
 if(!CONNECTED_BACKEND.connected||CONNECTED_BACKEND.syncing||CONNECTED_BACKEND.readOnly)return;
 CONNECTED_BACKEND.syncing=true;
 try{
   await backendRequest('runtime',{body:{
     current_hp:state.resources.hp,current_mana:state.resources.mana,current_stamina:state.resources.stamina,
     current_healing_surges:state.resources.surges,temporary_hp:state.resources.tempHp,barrier:state.resources.barrier,
     combat_active:state.combat.active,round_number:state.combat.round,
     short_rest_recovery_available:state.combat.shortRestRecoveryAvailable,loadout_unlocked:state.combat.loadoutUnlocked,
     conditions_json:state.combat.conditions,modifiers_json:state.combat.modifiers,daily_expended_json:state.combat.dailyExpended
   }});
   await backendRequest('profile',{body:{
     training_json:state.training,equipment_json:state.equipment,loadout_json:state.loadout,essence_choices_json:state.essenceChoices
   }});
   const e=document.getElementById('saveState');if(e)e.textContent='Saved to backend';
 }catch(err){
   const e=document.getElementById('saveState');if(e)e.textContent='Sync error';
   toast(err.message);
 }finally{CONNECTED_BACKEND.syncing=false}
}
function applyAccessMode(){
 if(!CONNECTED_BACKEND.connected)return;
 const banner=document.getElementById('gmReadOnlyBanner');
 if(banner){banner.classList.toggle('hidden',!CONNECTED_BACKEND.readOnly);banner.style.display=CONNECTED_BACKEND.readOnly?'':'none';}
 document.body.classList.toggle('gm-readonly',CONNECTED_BACKEND.readOnly);
 if(!CONNECTED_BACKEND.readOnly)return;
 document.querySelectorAll('input,select,textarea,button').forEach(el=>{
   const allowed=el.classList.contains('tab')||el.id==='gmToggle'||el.id==='resetBtn'||el.matches('[data-export-character]');
   if(!allowed)el.disabled=true;
 });
 const combat=document.getElementById('combatToggle');if(combat)combat.classList.add('hidden');
}
function applyRoleNavigation(){const gm=document.getElementById('gmToggle');if(gm)gm.classList.toggle('hidden',!CONNECTED_BACKEND.isGm)}

const DEFAULTS = {
 profile:{name:'Character',player:'',ancestry:'Unassigned',dungeon:'The Shattering',party:''},
 attributes:{Str:10,Dex:10,Con:10,Int:10,Wis:10,Cha:10},
 resources:{hp:10,mana:0,stamina:0,surges:0,tempHp:0,barrier:0,quintessence:0},
 xp:0,xpLedger:[],powers:{},essences:[],essenceChoices:{},loadout:{},training:{},equipment:[],
 combat:{active:false,round:1,conditions:[],modifiers:[],lastDamage:null,dailyExpended:{},shortRestRecoveryAvailable:true,loadoutUnlocked:false,conditionReview:false,shortRestDraft:{mana:1,stamina:1}},
 ui:{gmMode:false},gmCustomPowers:[],customMasterPowers:[],customMasterEssences:[]
};

let state = load();

function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'))}catch(e){return clone(DEFAULTS)}}
function normalize(raw){
 const d=clone(DEFAULTS); if(!raw)return d;
 const s={...d,...raw,profile:{...d.profile,...raw.profile},attributes:{...d.attributes,...raw.attributes},resources:{...d.resources,...raw.resources},powers:{...d.powers,...raw.powers},loadout:{...d.loadout,...raw.loadout},training:{...d.training,...raw.training},combat:{...d.combat,...raw.combat},ui:{...d.ui,...raw.ui}};
 s.xp=Math.max(0,Number(s.xp)||0); s.xpLedger=Array.isArray(raw.xpLedger)?raw.xpLedger:d.xpLedger; s.gmCustomPowers=Array.isArray(raw.gmCustomPowers)?raw.gmCustomPowers:[];
 s.customMasterPowers=Array.isArray(raw.customMasterPowers)?raw.customMasterPowers:[];
 s.customMasterEssences=Array.isArray(raw.customMasterEssences)?raw.customMasterEssences:[];
 for(const x of s.customMasterPowers){if(!MASTER_POWER_MODELS.some(p=>p.id===x.id))MASTER_POWER_MODELS.push(x)}
 for(const x of s.customMasterEssences){if(!MASTER_ESSENCE_MODELS.some(e=>e.id===x.id||e.name===x.name))MASTER_ESSENCE_MODELS.push(x)}

 for(const p of s.gmCustomPowers){if(!POWER_DB.some(x=>x.id===p.id))POWER_DB.push(p)}
 s.essences=Array.isArray(raw.essences)?raw.essences:d.essences; s.essenceChoices={...d.essenceChoices,...(raw.essenceChoices||{})}; s.equipment=Array.isArray(raw.equipment)?raw.equipment:d.equipment; s.combat.dailyExpended={...(raw.combat?.dailyExpended||{})}; s.combat.modifiers=Array.isArray(raw.combat?.modifiers)?raw.combat.modifiers:[]; s.combat.shortRestRecoveryAvailable=raw.combat?.shortRestRecoveryAvailable!==false; s.combat.loadoutUnlocked=!!raw.combat?.loadoutUnlocked; s.combat.conditionReview=!!raw.combat?.conditionReview; s.combat.shortRestDraft={mana:Math.max(0,Math.min(2,Number(raw.combat?.shortRestDraft?.mana)??1)),stamina:Math.max(0,Math.min(2,Number(raw.combat?.shortRestDraft?.stamina)??1))}; s.combat.conditions=Array.isArray(raw.combat?.conditions)?raw.combat.conditions.map(c=>{
   const id=c.conditionId||String(c.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
   return {conditionId:id,value:c.value??null,source:c.source||null,notes:c.notes||null};
 }):[];
 return s;
}
function save(){if(CONNECTED_BACKEND.readOnly)return;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));scheduleBackendSync();const e=document.getElementById('saveState');if(e&&!CONNECTED_BACKEND.connected)e.textContent='Local cache · backend disconnected'}
function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function signed(n){n=Number(n)||0;return `${n>=0?'+':''}${n}`}
function tierIndex(t){return Math.max(0,TIERS.indexOf(t))}
function ability(k){
 const long={Str:'Strength',Dex:'Dexterity',Con:'Constitution',Int:'Intelligence',Wis:'Wisdom',Cha:'Charisma'}[k];
 const base=Number(state.attributes[k])||10, ancestry=ANCESTRY.mods[k]||0, essence=essenceAttributeBonus(long)+essenceChoiceAttributeBonus(long);
 const score=base+ancestry+essence;
 return {base,score,bonus:(ABILITY_BONUS[score]??Math.floor((score-10)/2)),ancestry,essence};
}
function training(name){
 const x=state.training[name]||{status:'Untrained',rating:null};
 return {status:x.status||'Untrained',rating:(x.status&&x.status!=='Untrained')?Math.max(1,Number(x.rating)||1):null}
}
function isTrained(name){return training(name).status!=='Untrained'}
function rating(name){return training(name).rating||0}
function def(id){return EQUIPMENT_DB.find(x=>x.id===id)}
function basePowerId(id){return String(id||'').split('::')[0]}
function ownedPowerKey(powerId,essence){return `${basePowerId(powerId)}::${essence}`}
function pdef(id){
 const base=basePowerId(id);
 return MASTER_POWER_MODELS.find(x=>x.id===base) || POWER_DB.find(x=>x.id===base)
}

function powerMeta(p){
 if(!p)return null;
 const sharedSlot=p.role?.slot ?? (typeof p.slot==='object'?p.slot.index:p.slot);
 if(p.role || p.eligible_essences){
   return {
     id:p.id,name:p.name,slot:sharedSlot,category:POWER_SLOT_ROLES[sharedSlot]?.category,
     eligibleEssences:p.eligible_essences||[],description:(p.design_notes||[])[0]||'',
     frequency:p.classification?.frequency||'other',traits:p.classification?.traits||[],
     model:p
   };
 }
 return {id:p.id,name:p.name,slot:sharedSlot,category:p.category,eligibleEssences:p.essence?[p.essence]:[],
   description:p.description||'',frequency:(p.cooldown||'').toLowerCase(),traits:p.traits||[],model:null};
}
function sourceEssenceForPower(id){return state.powers[id]?.sourceEssence || pdef(id)?.essence || null}
function essenceDef(name){return MASTER_ESSENCE_MODELS.find(e=>e.name===name)||null}
function abilityKeyFromName(name){
 const map={Strength:'Str',Dexterity:'Dex',Constitution:'Con',Intelligence:'Int',Wisdom:'Wis',Charisma:'Cha'};
 return map[name]||null;
}
function sourceEssenceAbility(essence){return abilityKeyFromName(essenceDef(essence)?.associated_ability)||null}

function powerAttackBonus(id){
 const cp=state.powers[id], essence=sourceEssenceForPower(id), abilityKey=sourceEssenceAbility(essence);
 const abilityBonus=abilityKey?ability(abilityKey).bonus:0;
 const mastery=(essence==='Might'&&essenceInfo('Might').rank>=9)?1:0,manual=attackManualModifier('power'),condition=conditionAttackModifier(abilityKey);
 return {rank:cp?.rank||0,essence,abilityKey,abilityBonus,mastery,manual,condition,total:(cp?.rank||0)+abilityBonus+mastery+manual+condition}
}
function ironExpressions(p){
 if(!p?.tier_progression)return [];
 return p.tier_progression.find(t=>t.tier==='Iron')?.rank_expressions||[];
}

function deepFindById(node,id){
 if(!node||typeof node!=='object')return null;
 if(node.id===id)return node;
 if(Array.isArray(node)){for(const x of node){const f=deepFindById(x,id);if(f)return f}}
 else{for(const v of Object.values(node)){const f=deepFindById(v,id);if(f)return f}}
 return null;
}
function setSimplePath(obj,path,value){
 const parts=path.split('.').filter(Boolean);let cur=obj;
 for(let i=0;i<parts.length-1;i++){if(cur?.[parts[i]]==null)return false;cur=cur[parts[i]]}
 if(cur==null)return false;cur[parts.at(-1)]=value;return true;
}
function applyExpressionOperation(model,op){
 if(op.operation==='modify'&&op.path){
   const m=op.path.match(/^(.*?)\[(.*?)\](?:\.(.*))?$/);
   if(m){
     let root=model; const prefix=m[1].replace(/\.\*$/,'');
     if(prefix){for(const seg of prefix.split('.')){if(seg==='*')break;root=root?.[seg]}}
     const target=deepFindById(root,m[2]); if(target&&m[3])setSimplePath(target,m[3],op.value);
   }else setSimplePath(model,op.path,op.value);
 }
 if(op.operation==='add'&&op.path&&op.effect){
   if(op.path==='resolved_rank_effects'){model.resolved_rank_effects=model.resolved_rank_effects||[];model.resolved_rank_effects.push(clone(op.effect));}
   else{let root=model;for(const seg of op.path.split('.'))root=root?.[seg];if(Array.isArray(root))root.push(clone(op.effect));}
 }
}
function resolvedPowerModel(id){
 const source=pdef(id);if(!source)return null;
 const model=clone(source);
 for(const ex of activeExpressions(id))for(const op of ex.operations||[]){
   if(['modify','add','replace','remove','unlock'].includes(op.operation) && !op.trigger)applyExpressionOperation(model,op);
 }
 return model;
}
function expressionOperationText(op){
 if(op.operation==='modify')return `${op.path} → ${typeof op.value==='object'?JSON.stringify(op.value):op.value}`;
 if(op.operation==='add'&&op.effect)return `Adds ${effectText(op.effect)}`;
 if(op.operation==='conditional_add')return `Conditional: ${op.effect?effectText(op.effect):(op.notes||'additional effect')}`;
 return op.notes||op.operation;
}
function activeExpressions(id){
 const p=pdef(id),cp=state.powers[id]; if(!p||!cp)return [];
 const tier=p.tier_progression?.find(t=>t.tier===cp.tier);
 return (tier?.rank_expressions||[]).filter(x=>x.status==='final'&&x.rank<=cp.rank);
}
function effectText(e){
 if(!e)return '';
 if(e.type==='damage')return `${e.amount||''}${e.damage_type?` ${e.damage_type} damage`:' damage'}`.trim();
 if(e.type==='weapon_damage')return `${e.weapon_damage?.weapon_multiplier||''}[W]${e.weapon_damage?.ability_modifier?` + ${e.weapon_damage.ability_modifier}`:''}`;
 if(e.type==='half_damage')return `Half damage${e.text?`: ${e.text}`:''}`;
 if(e.type==='ongoing_damage')return `Ongoing ${e.amount} ${e.damage_type||''} damage (${e.duration?.type==='save_ends'?'save ends':e.duration?.type||''})`;
 if(e.type==='condition'||e.type==='condition_escalation')return `${e.condition_name}${e.duration?.type?` (${e.duration.type.replaceAll('_',' ')})`:''}`;
 if(['movement','ally_movement','self_movement'].includes(e.type))return `${e.movement?.movement_type||'move'} ${e.movement?.distance||''}${e.target?` — ${e.target}`:''}`;
 if(e.type==='defense_modifier')return `${signed(e.amount)} ${e.defense||'defense'}`;
 if(e.type==='attack_modifier')return `${signed(e.amount)} attack rolls`;
 if(e.type==='temporary_hp')return `${e.amount} temporary HP`;
 if(e.type==='skill_modifier')return `${signed(e.amount)} ${e.skill} checks`;
 if(e.type==='choice')return `Choose one: ${(e.options||[]).map(effectText).join(' OR ')}`;
 return e.text||e.amount||e.type.replaceAll('_',' ');
}

function powerFrequency(id){return (powerMeta(pdef(id))?.frequency||'other').toLowerCase()}
function powerResourceCost(id){
 const p=pdef(id),m=powerMeta(p),freq=(m?.frequency||'other').toLowerCase(),traits=(m?.traits||[]).map(x=>String(x).toLowerCase());
 if(Array.isArray(p?.costs)&&p.costs.length)return p.costs.filter(c=>c.consumed!==false).map(c=>{
   const raw=String(c.resource||'').toLowerCase().replaceAll(' ','_');
   const resource=(raw==='mana_or_stamina'||raw==='stamina_or_mana')?'either_mana_stamina':raw;
   return {resource,amount:Number(c.amount)||0,label:resource==='either_mana_stamina'?`${c.amount} Mana or Stamina`:`${c.amount} ${c.resource}`};
 });
 if(['at_will','passive','conditional'].includes(freq))return [];
 if(freq==='encounter'||freq==='resource'){
   const martial=traits.includes('martial'),magical=traits.some(x=>['arcane','divine','implement','primal','psionic'].includes(x));
   if(martial&&magical)return [{resource:'either_mana_stamina',amount:1,label:'1 Mana or Stamina'}];
   if(martial)return [{resource:'stamina',amount:1,label:'1 Stamina'}];
   return [{resource:'mana',amount:1,label:'1 Mana'}];
 }
 return [];
}
function isStrained(){return state.resources.mana<=0&&state.resources.stamina<=0}
function powerUseStatus(id){
 const p=pdef(id),cp=state.powers[id],m=powerMeta(p);if(!p||!cp||!m)return {ok:false,reason:'Power unavailable.'};
 if(!Object.values(state.loadout).includes(id))return {ok:false,reason:'Not readied in the current loadout.'};
 const freq=powerFrequency(id),cost=powerResourceCost(id);
 if(freq==='daily'&&state.combat.dailyExpended?.[id])return {ok:false,reason:'Daily Power expended. Restore Daily Powers after the character completes the appropriate daily rest.'};

 for(const c of cost){
   if(c.resource==='either_mana_stamina'){
     if(state.resources.mana<c.amount&&state.resources.stamina<c.amount)return {ok:false,reason:`Requires ${c.label}.`};
   }else if((state.resources[c.resource]||0)<c.amount)return {ok:false,reason:`Requires ${c.label}.`};
 }
 return {ok:true,cost};
}
function spendPowerCost(id,choice){
 for(const c of powerResourceCost(id)){
   if(c.resource==='either_mana_stamina'){
     const k=choice==='stamina'?'stamina':'mana';state.resources[k]=Math.max(0,state.resources[k]-c.amount);
   }else state.resources[c.resource]=Math.max(0,(state.resources[c.resource]||0)-c.amount);
 }
}
function powerAttackDefense(id){
 const p=resolvedPowerModel(id)||pdef(id),r=p?.profile?.resolution||p?.resolution;
 return r?.attack?.defense||r?.attacks?.[0]?.defense||null;
}
function usePower(id){
 const status=powerUseStatus(id),p=pdef(id);if(!status.ok){toast(status.reason);return}
 const cost=powerResourceCost(id);let choice=null;
 if(cost.some(c=>c.resource==='either_mana_stamina')){
   if(state.resources.mana>0&&state.resources.stamina>0)choice=confirm('Spend Stamina? Choose Cancel to spend Mana.')?'stamina':'mana';
   else choice=state.resources.stamina>0?'stamina':'mana';
 }
 spendPowerCost(id,choice);
 if(powerFrequency(id)==='daily'){state.combat.dailyExpended=state.combat.dailyExpended||{};state.combat.dailyExpended[id]=true;}
 const defense=powerAttackDefense(id),atk=powerAttackBonus(id),roll=defense?Math.floor(Math.random()*20)+1:null,total=roll!=null?roll+atk.total:null;
 const entry={id:`use-${Date.now()}`,powerId:id,name:p.name,round:state.combat.round,frequency:powerFrequency(id),
   cost:cost.map(c=>c.resource==='either_mana_stamina'?`${c.amount} ${choice}`:c.label),roll,total,defense,
   resonance:p.classification?.dungeon_resonance||null,time:new Date().toISOString()};
 state.combat.lastPowerUse=entry;state.combat.powerLog.unshift(entry);state.combat.powerLog=state.combat.powerLog.slice(0,30);
 save();render();toast(`${p.name} used${total!=null?` — attack ${total}`:''}`);
}
function restoreDailyPowers(){state.combat.dailyExpended={};save();render();toast('Daily Powers restored');}
function powerUseButton(id){
 const st=powerUseStatus(id),cost=powerResourceCost(id),freq=powerFrequency(id),costText=cost.length?cost.map(c=>c.label).join(' + '):'No resource cost';
 const displayFreq=freq==='encounter'?'Resource Power':freq.replaceAll('_',' ');
 const expended=freq==='daily'&&state.combat.dailyExpended?.[id];
 return `<div class="power-engine"><div class="small"><b>${displayFreq.toUpperCase()}</b> · ${costText}${expended?' · EXPENDED':''}</div><button class="primary" data-use-power="${id}" ${st.ok?'':'disabled'}>${expended?'Expended':'Use Power'}</button>${!st.ok?`<div class="small warning">${st.reason}</div>`:''}</div>`;
}
function renderPowerUseLog(){
 const el=document.getElementById('powerUseLog');if(!el)return;const log=state.combat.powerLog||[];
 el.innerHTML=log.length?log.slice(0,8).map(x=>`<div class="log-row"><b>R${x.round} · ${x.name}</b><span>${x.roll!=null?`d20 ${x.roll} → <b>${x.total}</b> vs ${x.defense}`:'Activated'}${x.cost?.length?` · ${x.cost.join(' + ')}`:''}${x.resonance?` · Resonance: ${x.resonance}`:''}</span></div>`).join(''):'<div class="empty">No Powers used this combat.</div>';
}

function compactCombatPowerCard(id){
 const source=pdef(id),p=resolvedPowerModel(id)||source,cp=state.powers[id],m=powerMeta(source),ess=sourceEssenceForPower(id),atk=powerAttackBonus(id);
 if(!p||!cp||!m)return '';
 const r=p?.profile?.resolution||p?.resolution,attack=r?.attack||r?.attacks?.[0],hit=r?.hit||[],miss=r?.miss||[],effects=p?.profile?.effects||p?.effects||[];
 const freq=powerFrequency(id),displayFreq=freq==='resource'||freq==='encounter'?'Resource':freq.replaceAll('_',' '),expended=freq==='daily'&&state.combat.dailyExpended?.[id];
 const cost=powerResourceCost(id).map(c=>c.label).join(' + ');
 const effectLines=[
   hit.length?`<div><b>Hit</b> ${replaceModifierReferences(hit.map(effectText).join('; '),id)}</div>`:'',
   miss.length?`<div><b>Miss</b> ${replaceModifierReferences(miss.map(effectText).join('; '),id)}</div>`:'',
   effects.length?`<div><b>Effect</b> ${replaceModifierReferences(effects.map(effectText).join('; '),id)}</div>`:'',
   (p.resolved_rank_effects||[]).length?`<div>${replaceModifierReferences((p.resolved_rank_effects||[]).map(effectText).join('; '),id)}</div>`:''
 ].join('');
 return `<article class="combat-power-card ${expended?'is-expended':''}">
  <div class="combat-card-head"><div><div class="eyebrow">${ess} · SLOT ${m.slot} · ${displayFreq.toUpperCase()}</div><h3>${p.name}</h3></div>${cost?`<span class="cost-chip">${cost}</span>`:''}</div>
  ${expended?`<div class="expended-banner">DAILY EXPENDED</div>`:''}
  ${attack?`<div class="roll-callout"><span class="roll-label">TO HIT</span><strong>${signed(atk.total)}</strong><span>vs ${String(attack.defense).toUpperCase()}</span><div class="roll-instruction">Roll 1d20 ${signed(atk.total)}</div></div>
  <details class="math-breakdown"><summary>Attack math</summary><div>Power Rank ${signed(cp.rank)} · ${atk.abilityKey||'Essence'} ${signed(atk.abilityBonus)} · Essence ${signed(atk.mastery||0)} · Active ${signed(atk.manual||0)} · Conditions ${signed(atk.condition||0)}</div></details>`:''}
  <div class="combat-effect-lines">${effectLines||'<div>See Power text for effect.</div>'}</div>
  ${freq==='daily'?`<button data-mark-daily="${id}" ${expended?'disabled':''}>${expended?'Daily Expended':'Mark Daily Used'}</button>`:''}
 </article>`;
}
function markDailyUsed(id){state.combat.dailyExpended=state.combat.dailyExpended||{};state.combat.dailyExpended[id]=true;save();render();}
function resolvedPowerCard(id,combat=false){
 const source=pdef(id),p=resolvedPowerModel(id)||source,cp=state.powers[id],m=powerMeta(source),ess=sourceEssenceForPower(id),ab=sourceEssenceAbility(ess),atk=powerAttackBonus(id);
 if(!p||!cp||!m)return '';
 const role=POWER_SLOT_ROLES[m.slot]?.name||`Slot ${m.slot}`;
 let body='', attackLine='';
 const prof=p.profile||null;
 const resolution=prof?.resolution||p.resolution||null;
 if(resolution?.attack) {
   attackLine=`Power Attack: 1d20 ${signed(atk.total)} vs ${resolution.attack.defense} <span class="small">(Rank ${cp.rank} ${signed(atk.abilityBonus)} ${ab||'Essence Ability?'})</span>`;
 } else if(resolution?.attacks?.length){
   const a=resolution.attacks[0];
   attackLine=`Power Attack: 1d20 ${signed(atk.total)} vs ${a.defense} <span class="small">(${a.roll_count||1} roll${a.roll_count===1?'':'s'}; Rank ${cp.rank} ${signed(atk.abilityBonus)} ${ab||'Essence Ability?'})</span>`;
 }
 const hit=resolution?.hit||[];
 const miss=resolution?.miss||[];
 const effects=prof?.effects||p.effects||[];
 if(attackLine)body+=`<div class="power-resolve"><b>${attackLine}</b></div>`;
 if(hit.length)body+=`<div class="power-resolve"><b>Hit:</b> ${hit.map(effectText).join('; ')}</div>`;
 if(miss.length)body+=`<div class="power-resolve"><b>Miss:</b> ${miss.map(effectText).join('; ')}</div>`;
 if(effects.length)body+=`<div class="power-resolve"><b>Effect:</b> ${effects.map(effectText).join('; ')}</div>`;
 const resolvedRankEffects=p.resolved_rank_effects||[];
 if(resolvedRankEffects.length)body+=`<div class="power-resolve">${resolvedRankEffects.map(effectText).join('; ')}</div>`;
 const costs=(p.costs||[]).map(c=>`${c.amount} ${c.resource}`).join(' + ')||'—';
 return `<div class="power-card resolved-power"><div class="power-title"><span>${p.name}</span><span class="rank-big">${cp.tier} ${cp.rank}</span></div>
 <div class="meta"><span class="tag">${ess||'No Essence'}</span><span class="tag">${role}</span><span class="tag">${p.classification?.frequency||m.frequency}</span><span class="tag">Cost: ${costs}</span></div>
 ${body}<div class="small">Source ability: ${ab||'Not assigned'}${ab?` ${signed(ability(ab).bonus)}`:''}</div>${combat?powerUseButton(id):''}</div>`;
}

function ownedPower(id){return state.powers[id]}
function ensureEssence(name){if(name && !state.essences.includes(name))state.essences.push(name)}
function essencePowers(name){return POWER_DB.filter(p=>p.essence===name)}
function essenceInfo(name){
 const slots=[];
 for(let i=1;i<=5;i++){
  const pd=assignedPowerForSlot(name,i);
  const cp=pd?state.powers[pd.ownedId]:null;
  slots.push({slot:i,pd,cp,tier:cp?.tier||'Iron',rank:cp?.rank||0});
 }
 const minTier=Math.min(...slots.map(s=>s.cp?tierIndex(s.tier):0));
 const tier=TIERS[minTier];
 const total=slots.reduce((sum,s)=>sum+(s.cp?(tierIndex(s.tier)>minTier?9:tierIndex(s.tier)===minTier?s.rank:0):0),0);
 return {name,tier,rank:Math.floor(total/5),slots,total,ability:sourceEssenceAbility(name)};
}
function allEssenceInfo(){return state.essences.map(essenceInfo)}
function characterProgress(){
 const es=allEssenceInfo();
 if(!es.length)return {tier:'Iron',rank:0};
 const min=Math.min(...es.map(e=>tierIndex(e.tier)));
 const vals=es.map(e=>tierIndex(e.tier)>min?9:e.rank);
 return {tier:TIERS[min],rank:Math.floor(vals.reduce((a,b)=>a+b,0)/vals.length)}
}
function activeEssenceEffects(){
 const out=[];
 for(const e of allEssenceInfo())for(const fx of ESSENCE_EFFECTS){
  if(fx.essence!==e.name)continue;
  const et=tierIndex(e.tier), ft=tierIndex(fx.tier);
  if(ft<et||(ft===et&&fx.rank<=e.rank))out.push(fx);
 }
 return out;
}
function essenceTotal(target){return activeEssenceEffects().filter(x=>x.target===target).reduce((a,b)=>a+b.value,0)}

function essenceTierProgressionsReached(name){
 const e=essenceDef(name),info=essenceInfo(name); if(!e)return [];
 const current=tierIndex(info.tier);
 return (e.tier_progression||[]).filter(t=>tierIndex(t.tier)<=current).map(t=>({...t,effectiveRank:tierIndex(t.tier)<current?9:info.rank}));
}
function currentEssenceTierProgression(name){
 const e=essenceDef(name), info=essenceInfo(name);
 return e?.tier_progression?.find(t=>t.tier===info.tier)||null;
}
function reachedEssenceEffects(name){
 const info=essenceInfo(name), current=tierIndex(info.tier), effects=[], ed=essenceDef(name);
 if(!ed)return [];
 for(const tp of ed.tier_progression||[]){
   const ti=tierIndex(tp.tier); if(ti>current)continue;
   const effectiveRank=ti<current?9:info.rank;
   for(const m of [...(tp.milestones||[]),...(tp.other_unlocks||[])]) if(m.rank<=effectiveRank) effects.push(...(m.effects||[]).map(x=>({...x,essence:name,tier:tp.tier,rank:m.rank,name:m.name})));
 }
 return effects;
}
function allEssenceProgressionEffects(){return state.essences.flatMap(reachedEssenceEffects)}
function essenceAttributeBonus(attrLong){
 return allEssenceProgressionEffects().filter(e=>e.type==='modify_attribute'&&e.target===attrLong).reduce((sum,e)=>sum+(Number(e.amount)||0),0);
}
function essenceStatBonus(type,target){
 return allEssenceProgressionEffects().filter(e=>e.type===type&&e.target===target).reduce((sum,e)=>sum+(Number(e.amount)||0),0);
}
function essenceResourceContribution(name,resource){
 const info=essenceInfo(name),current=tierIndex(info.tier),ed=essenceDef(name); if(!ed)return 0;
 let total=0;
 for(const tp of ed.tier_progression||[]){
   const ti=tierIndex(tp.tier); if(ti>current)continue;
   const effectiveRank=ti<current?9:info.rank;
   for(const r of tp.resource_rules||[]){
     if(r.resource!==resource)continue;
     if(r.mode==='per_rank')total+=(Number(r.amount_per_rank)||0)*effectiveRank;
     if(r.mode==='threshold')for(const th of r.thresholds||[])if(effectiveRank>=th.rank)total+=Number(th.amount)||0;
   }
 }
 return total;
}
function essenceResourceBonus(resource){
 let total=0;
 for(const name of state.essences){
   const info=essenceInfo(name),current=tierIndex(info.tier),ed=essenceDef(name); if(!ed)continue;
   for(const tp of ed.tier_progression||[]){
     const ti=tierIndex(tp.tier); if(ti>current)continue;
     const effectiveRank=ti<current?9:info.rank;
     for(const r of tp.resource_rules||[]){
       if(r.resource!==resource)continue;
       if(r.mode==='per_rank') total+=(Number(r.amount_per_rank)||0)*effectiveRank;
       if(r.mode==='threshold') for(const th of r.thresholds||[]) if(effectiveRank>=th.rank) total+=Number(th.amount)||0;
     }
   }
 }
 return total;
}
function pendingEssenceChoices(){
 const out=[];
 for(const name of state.essences){
   for(const e of reachedEssenceEffects(name)){
     if(e.type==='grant_training_choice'&&e.choice){
       const key=`${name}:${e.choice.key}`;
       if(!state.essenceChoices?.[key]) out.push({essence:name,key,effect:e});
     }
   }
 }
 return out;
}
function applyEssenceChoiceTraining(){
 for(const [key,val] of Object.entries(state.essenceChoices||{})){
   if(key.includes('blade_specialization')&&val){
     if(!state.training[val]||state.training[val].status==='Untrained')state.training[val]={status:'Trained',rating:1};
   }
 }
}
function essenceChoiceAttributeBonus(attrLong){
 let total=0;for(const [key,val] of Object.entries(state.essenceChoices||{}))if(key.includes('disciplined_intellect')&&val===attrLong)total++;return total;
}
function essenceChoiceInitiativeBonus(){
 return Object.entries(state.essenceChoices||{}).some(([k,v])=>k.includes('master_of_thought')&&v==='Initiative')?1:0;
}

function resourceMaxes(){
 return {
   hp:10+ANCESTRY.resources.hp+essenceResourceBonus('hp'),
   mana:ANCESTRY.resources.mana+essenceResourceBonus('mana'),
   stamina:ANCESTRY.resources.stamina+essenceResourceBonus('stamina'),
   surges:ANCESTRY.resources.surges+essenceResourceBonus('healing_surges')
 }
}
function durability(item){
 const d=def(item.definitionId); if(!d||!['armor','shield'].includes(d.kind))return {state:'n/a',hp:null,max:null,hardness:0,ac:false};
 const max=(d.maxHp||0)+(item.hpBonus||0), hard=(d.hardness||0)+(item.hardnessBonus||0), hp=Math.max(0,Math.min(max,item.currentHp??max));
 const destroyed=item.destroyed||hp<=0, broken=!destroyed&&hp*2<=max;
 return {state:destroyed?'destroyed':broken?'broken':'functional',hp,max,hardness:destroyed?0:hard,ac:!destroyed&&!broken};
}
function equipped(kind){return state.equipment.find(x=>x.equipped&&!x.destroyed&&def(x.definitionId)?.kind===kind)}


function conditionDef(id){return CONDITION_DEFINITIONS.find(c=>c.id===id)||null}
function activeConditionValue(id){
 const c=(state.combat.conditions||[]).find(x=>x.conditionId===id);
 return c?Math.max(1,Number(c.value)||1):0;
}
function effectiveConditions(){
 const found=new Map();
 const add=(id,value=null,derivedFrom=null)=>{
   if(!id||found.has(id))return;
   const def=conditionDef(id);if(!def)return;
   const direct=(state.combat.conditions||[]).find(c=>c.conditionId===id);
   const v=direct?(direct.value??(def.valueType==='required'?1:null)):(value??(def.valueType==='required'?1:null));
   found.set(id,{conditionId:id,value:v,def,direct:!!direct,derivedFrom});
   for(const d of def.derived||[])add(d.conditionId,d.value??null,id);
 };
 for(const c of state.combat.conditions||[])add(c.conditionId,c.value??null,null);
 const suppressed=new Set();
 for(const c of found.values())for(const id of c.def.overrides||[])suppressed.add(id);
 return [...found.values()].filter(c=>!suppressed.has(c.conditionId));
}
function conditionValue(id){const c=effectiveConditions().find(x=>x.conditionId===id);return c?Math.max(1,Number(c.value)||1):0}
function conditionGeneralCheckPenalty(){
 return -(conditionValue('frightened')+conditionValue('sickened'));
}
function conditionAttackModifier(attrKey){
 let n=conditionGeneralCheckPenalty()-2*(conditionValue('prone')?1:0);
 if(attrKey==='Dex')n-=conditionValue('clumsy');
 if(attrKey==='Str')n-=conditionValue('enfeebled');
 if(['Int','Wis','Cha'].includes(attrKey))n-=conditionValue('stupefied');
 if(attrKey==='Con')n-=conditionValue('drained');
 return n;
}
function conditionDamageModifier(attrKey){
 return attrKey==='Str'?-conditionValue('enfeebled'):0;
}
function conditionDefenseModifier(name){
 let n=conditionGeneralCheckPenalty();
 if(['AC','Reflex'].includes(name))n-=conditionValue('clumsy');
 if(['AC','Fortitude','Reflex','Will'].includes(name))n-=conditionValue('fatigued');
 if(name==='AC')n-=2*(conditionValue('off_guard')?1:0);
 if(name==='Will')n-=conditionValue('stupefied');
 if(name==='Fortitude')n-=conditionValue('drained');
 if(conditionValue('unconscious')){
   if(name==='AC'||name==='Reflex')n-=4;
 }
 return n;
}
function conditionInitiativeModifier(){
 return conditionGeneralCheckPenalty()-conditionValue('clumsy');
}
function conditionSkillModifier(name){
 const attr=SKILL_ABILITIES[name];let n=conditionGeneralCheckPenalty();
 if(conditionValue('fascinated'))n-=2;
 if(attr==='Dex')n-=conditionValue('clumsy');
 if(attr==='Str')n-=conditionValue('enfeebled');
 if(['Int','Wis','Cha'].includes(attr))n-=conditionValue('stupefied');
 if(attr==='Con')n-=conditionValue('drained');
 if(name==='Perception'&&conditionValue('unconscious'))n-=4;
 return n;
}
function conditionSummaryModifiers(c){
 const id=c.conditionId,v=Math.max(1,Number(c.value)||1);
 const map={
  clumsy:`–${v} DEX-based rolls/DCs`,
  enfeebled:`–${v} STR-based rolls/DCs`,
  frightened:`–${v} checks/DCs`,
  sickened:`–${v} checks/DCs`,
  stupefied:`–${v} INT/WIS/CHA rolls/DCs`,
  fatigued:`–${v} AC/Fort/Reflex/Will`,
  off_guard:'–2 AC',
  prone:'–2 attacks · Off-Guard',
  fascinated:'–2 Perception/skills',
  drained:`–${v} CON-based rolls/DCs`,
  unconscious:'–4 AC/Perception/Reflex · derived states'
 };
 return map[id]||'Tracked condition';
}
function renderConditionControls(){
 const sel=document.getElementById('conditionSelect'),val=document.getElementById('conditionValue');if(!sel||!val)return;
 const current=sel.value;
 sel.innerHTML=CONDITION_DEFINITIONS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
 if(current&&conditionDef(current))sel.value=current;
 const d=conditionDef(sel.value);val.disabled=d?.valueType==='none';val.classList.toggle('hidden-value',d?.valueType==='none');
}
function adjustCondition(index,delta){
 const c=state.combat.conditions[index],d=conditionDef(c?.conditionId);if(!c||d?.valueType==='none')return;
 c.value=Math.max(0,(Number(c.value)||1)+delta);
 if(c.value===0)state.combat.conditions.splice(index,1);
 save();render();
}

const SKILL_ABILITIES={
 Acrobatics:'Dex',Arcana:'Int',Athletics:'Str',Deception:'Cha',Diplomacy:'Cha',
 Dungeoneering:'Wis',Insight:'Wis',Intimidate:'Cha',Medicine:'Wis',Nature:'Wis',
 Perception:'Wis',Performance:'Cha',Religion:'Int',Stealth:'Dex',Survival:'Wis',Thievery:'Dex'
};
function activeManualModifier(scope){
 return (state.combat.modifiers||[]).filter(m=>m.scope===scope||m.scope==='all').reduce((sum,m)=>sum+(Number(m.value)||0),0);
}
function attackManualModifier(kind){
 return activeManualModifier('attacks')+activeManualModifier(kind==='power'?'power_attacks':'weapon_attacks');
}
function defenseManualModifier(name){return activeManualModifier('defenses')+activeManualModifier(name.toLowerCase())}
function skillManualModifier(name){return activeManualModifier('skills')+activeManualModifier(`skill:${name}`)}
function initiativeManualModifier(){return activeManualModifier('initiative')}
function skillValue(name){
 const key=SKILL_ABILITIES[name],attr=key?ability(key).bonus:0,r=rating(name),manual=skillManualModifier(name),condition=conditionSkillModifier(name);
 return {name,key,attr,r,manual,condition,total:attr+r+manual+condition};
}
function modifierBreakdown(parts){
 return parts.filter(x=>x.value!==0||x.keep).map(x=>`${x.label} ${signed(x.value)}`).join(' · ')||'No modifiers';
}
function replaceNumericReference(out,label,value,damageValue=value){
 const esc=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const arithmetic=(pattern,n)=>{
   out=out.replace(new RegExp(`\\+\\s*${pattern}`,'gi'),n>=0?`+ ${n}`:`- ${Math.abs(n)}`);
   out=out.replace(new RegExp(`-\\s*${pattern}`,'gi'),n>=0?`- ${n}`:`+ ${Math.abs(n)}`);
 };
 // Damage clauses can carry condition adjustments such as Enfeebled.
 const damagePattern=`${esc}(?=\\s+damage\\b)`;
 arithmetic(damagePattern,damageValue);
 out=out.replace(new RegExp(damagePattern,'gi'),String(damageValue));
 arithmetic(esc,value);
 out=out.replace(new RegExp(esc,'gi'),String(value));
 return out;
}
function replaceModifierReferences(text,id){
 if(!text)return text;
 const essence=sourceEssenceForPower(id),ab=sourceEssenceAbility(essence),essBase=ab?ability(ab).bonus:0,essDamage=essBase+conditionDamageModifier(ab);
 const map={Strength:'Str',Dexterity:'Dex',Constitution:'Con',Intelligence:'Int',Wisdom:'Wis',Charisma:'Cha'};
 let out=String(text);
 out=replaceNumericReference(out,'your Essence ability modifier',essBase,essDamage);
 out=replaceNumericReference(out,'Essence ability modifier',essBase,essDamage);
 for(const [long,key] of Object.entries(map)){
   const base=ability(key).bonus,damage=base+conditionDamageModifier(key);
   out=replaceNumericReference(out,`your ${long} modifier`,base,damage);
   out=replaceNumericReference(out,`${long} modifier`,base,damage);
 }
 return out;
}

function defenses(){
 const dex=ability('Dex').bonus,con=ability('Con').bonus,wis=ability('Wis').bonus;
 let equipmentAc=0;
 for(const kind of ['armor','shield']){
  const item=equipped(kind);if(!item)continue;const d=def(item.definitionId),du=durability(item);
  if(du.ac&&isTrained(d.trainingName))equipmentAc+=d.ac||0;
 }
 const essenceAC=essenceStatBonus('modify_defense','AC'),essFort=essenceStatBonus('modify_defense','Fortitude'),
       essRef=essenceStatBonus('modify_defense','Reflex'),essWill=essenceStatBonus('modify_defense','Will'),
       essInit=essenceStatBonus('modify_initiative','Initiative')+essenceChoiceInitiativeBonus();
 return {
  ac:10+dex+rating('AC')+equipmentAc+essenceAC+defenseManualModifier('AC')+conditionDefenseModifier('AC'),
  fortitude:con+rating('Fortitude')+essFort+defenseManualModifier('Fortitude')+conditionDefenseModifier('Fortitude'),
  reflex:dex+rating('Reflex')+essRef+defenseManualModifier('Reflex')+conditionDefenseModifier('Reflex'),
  will:wis+rating('Will')+essWill+defenseManualModifier('Will')+conditionDefenseModifier('Will'),
  initiative:dex+essInit+initiativeManualModifier()+conditionInitiativeModifier(),
  equipmentAc,
  breakdown:{
   ac:[['Base',10],['DEX',dex],['Rating',rating('AC')],['Gear',equipmentAc],['Essence',essenceAC],['Active',defenseManualModifier('AC')],['Conditions',conditionDefenseModifier('AC')]],
   fortitude:[['CON',con],['Rating',rating('Fortitude')],['Essence',essFort],['Active',defenseManualModifier('Fortitude')],['Conditions',conditionDefenseModifier('Fortitude')]],
   reflex:[['DEX',dex],['Rating',rating('Reflex')],['Essence',essRef],['Active',defenseManualModifier('Reflex')],['Conditions',conditionDefenseModifier('Reflex')]],
   will:[['WIS',wis],['Rating',rating('Will')],['Essence',essWill],['Active',defenseManualModifier('Will')],['Conditions',conditionDefenseModifier('Will')]],
   initiative:[['DEX',dex],['Essence',essInit],['Active',initiativeManualModifier()],['Conditions',conditionInitiativeModifier()]]
  }
 };
}
function powerCanAdvance(id){
 const cp=ownedPower(id), pd=pdef(id), essence=sourceEssenceForPower(id);
 if(!cp||cp.ancestry||!pd||!essence)return {ok:false,reason:'Not rankable'};
 if(state.xp<XP_PER_POWER_RANK)return {ok:false,reason:`Need ${XP_PER_POWER_RANK} XP`};
 const ei=essenceInfo(essence), pi=tierIndex(cp.tier), eiTier=tierIndex(ei.tier);
 if(pi>eiTier&&cp.rank===0)return {ok:false,reason:`Waiting for ${essence} Essence to reach ${cp.tier}`};
 if(pi===eiTier&&cp.rank<9)return {ok:true,next:`${cp.tier} ${cp.rank+1}`};
 if(pi===eiTier&&cp.rank===9&&pi<TIERS.length-1)return {ok:true,next:`${TIERS[pi+1]} 0`};
 return {ok:false,reason:'Maximum progression for current rules'};
}
function assignPowerToSlot(essence,slot,powerId,manualName){
 const role=POWER_SLOT_ROLES[slot];
 let pd=powerId?pdef(powerId):null;
 if(!pd && manualName){
   const id=`GM-${essence.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6)}-${slot}-${Date.now()}`;
   pd={id,name:manualName,essence,slot,category:role.category,description:'GM-assigned Power. Structured rules have not yet been entered.',cost:'—',cooldown:role.typical,traits:[],gmCustom:true};
   POWER_DB.push(pd); state.gmCustomPowers.push(pd); powerId=id;
 }
 const m=powerMeta(pd);
 if(!pd || m?.slot!==Number(slot) || (m.eligibleEssences.length&&!m.eligibleEssences.includes(essence))){
   toast('That Power is not valid for this Essence slot');return false;
 }
 if(assignedPowerForSlot(essence,Number(slot))){toast('That Essence slot already has an assigned Power');return false}
 const ownedId=ownedPowerKey(powerId,essence);
 state.powers[ownedId]={tier:'Iron',rank:0,ancestry:false,sourceEssence:essence,definitionId:basePowerId(powerId)};
 ensureEssence(essence); save();render();toast(`${pd.name} assigned to ${essence} ${role.name}`);
 return true;
}
function assignEssence(name){
 name=(name||'').trim();
 if(!name){toast('Choose an Essence');return}
 const ed=essenceDef(name);
 if(!ed){toast('This Essence does not yet have a structured master definition in Alpha v0.4');return}
 if(state.essences.includes(name)){toast(`${name} Essence is already assigned`);return}
 if(state.essences.length>=4){toast('A character can have no more than four Essences');return}
 state.essences.push(name);
 const candidates=MASTER_POWER_MODELS.filter(p=>p.slot?.index===1&&(p.eligible_essences||[]).includes(name)&&!assignedPowerForSlot(name,1));
 if(candidates.length){
   const pd=candidates[Math.floor(Math.random()*candidates.length)];
   const ownedId=ownedPowerKey(pd.id,name);
   state.powers[ownedId]={tier:'Iron',rank:0,ancestry:false,sourceEssence:name,definitionId:pd.id};
   save();render();toast(`${name} Essence assigned (${ed.associated_ability}). Core Power revealed: ${pd.name}`);
 }else{
   const manual=window.prompt(`No structured Core candidates are loaded for ${name}. Enter the exact Core Power assigned to this character:`);
   if(!manual||!manual.trim()){state.essences=state.essences.filter(x=>x!==name);toast('Essence assignment cancelled: a Core Power is required.');render();return}
   assignPowerToSlot(name,1,null,manual.trim());
 }
}
function randomizePower(essence,slot){
 const all=MASTER_POWER_MODELS.filter(p=>p.slot?.index===Number(slot)&&(p.eligible_essences||[]).includes(essence)&&!assignedPowerForSlot(essence,Number(slot)));
 if(!all.length){toast('No hidden structured candidates exist for this slot yet');return}
 const alreadyKnownDefs=new Set(Object.keys(state.powers).filter(id=>!state.powers[id].ancestry).map(basePowerId));
 const preferred=all.filter(p=>!alreadyKnownDefs.has(p.id));
 const pool=preferred.length?preferred:all;
 const pd=pool[Math.floor(Math.random()*pool.length)];
 assignPowerToSlot(essence,Number(slot),pd.id);
}
async function advancePower(id){
 if(CONNECTED_BACKEND.readOnly){toast('GM character view is read-only');return}
 const a=powerCanAdvance(id);if(!a.ok){toast(a.reason);return}
 const cp=state.powers[id],serverId=cp?.serverOwnedId;
 if(!serverId){toast('This Power is not connected to a backend ownership record');return}
 try{
   await backendRequest('rank',{body:{character_power_id:serverId}});
   await refreshFromBackend();toast(`${pdef(id)?.name||'Power'} advanced`);
 }catch(err){toast(err.message)}
}
function awardXp(n){n=Math.max(1,Number(n)||0);state.xp+=n;state.xpLedger.unshift({amount:n,type:'XP Award',note:'Manual alpha award'});save();render();toast(`${n} XP awarded`)}
function setTraining(name,status,r){
 const meta=Object.values(TRAINING).flat().find(x=>x[0]===name), supports=meta?.[2];
 state.training[name]={status,rating:status==='Untrained'||!supports?null:Math.max(1,Number(r)||1)};save();render();
}
function equipmentDetail(d){
 if(!d)return '';
 if(d.kind==='weapon')return `<div class="detail-grid">
  <div class="detail"><b>Groups</b>${(d.groups||[]).join(', ')||'—'}</div><div class="detail"><b>Category</b>${d.category}</div><div class="detail"><b>Damage</b>${d.damage}</div>
  <div class="detail"><b>Range</b>${d.range||'Melee'}</div><div class="detail"><b>Weight</b>${d.weight??'—'} lb.</div><div class="detail"><b>Properties</b>${(d.properties||[]).map(p=>p.id.replaceAll('-',' ')).join(', ')||'—'}</div></div>`;
 return `<div class="detail-grid"><div class="detail"><b>Training</b>${d.trainingName}</div><div class="detail"><b>Category</b>${d.category}</div><div class="detail"><b>AC</b>+${d.ac}</div>
 <div class="detail"><b>Check Penalty</b>${signed(d.checkPenalty)}</div><div class="detail"><b>Speed Penalty</b>${signed(d.speedPenalty)}</div><div class="detail"><b>Weight</b>${d.weight} lb.</div>
 <div class="detail"><b>Hardness</b>${d.hardness}</div><div class="detail"><b>Max HP</b>${d.maxHp}</div></div>`;
}
function addEquipment(id){
 const d=def(id); if(!d)return;
 const uid='eq-'+Date.now();state.equipment.push({uid,definitionId:id,currentHp:d.maxHp??null,focusGroup:d.kind==='weapon'?(d.groups?.[0]||null):null,equipped:false,destroyed:false});
 save();render();toast(`${d.name} added`);
}
function setFocus(uid,group){
 const item=state.equipment.find(x=>x.uid===uid);if(!item)return;
 if(item.focusGroup && item.focusGroup!==group){toast('Weapon focus is permanent once chosen');render();return}
 item.focusGroup=group;save();render();
}
function toggleEquip(uid){
 const item=state.equipment.find(x=>x.uid===uid),d=def(item.definitionId);if(!item||item.destroyed)return;
 if(!item.equipped){
  if(d.kind==='armor'||d.kind==='shield')state.equipment.forEach(x=>{if(def(x.definitionId)?.kind===d.kind)x.equipped=false});
  if(d.kind==='weapon'&&!item.focusGroup){toast('Choose a permanent weapon group focus first');return}
 }
 item.equipped=!item.equipped;save();render();
}
function repair(uid,amount=5){
 const item=state.equipment.find(x=>x.uid===uid),d=def(item?.definitionId);if(!item||item.destroyed||!d?.maxHp)return;
 item.currentHp=Math.min(d.maxHp+(item.hpBonus||0),(item.currentHp??d.maxHp)+amount);save();render();
}
function resolveDamage(){
 let dmg=Math.max(0,Number(document.getElementById('incomingDamage').value)||0),start=dmg,log=[];
 const bypass=(id)=>document.getElementById(id).checked;
 if(!bypass('bypassBarrier')){let a=Math.min(dmg,state.resources.barrier);state.resources.barrier-=a;dmg-=a;log.push(`Barrier absorbed ${a}`)}else log.push('Barrier bypassed');
 if(!bypass('bypassTemp')){let a=Math.min(dmg,state.resources.tempHp);state.resources.tempHp-=a;dmg-=a;log.push(`Temporary HP absorbed ${a}`)}else log.push('Temporary HP bypassed');
 for(const [kind,bp,ih] of [['shield','bypassShield','ignoreShieldHardness'],['armor','bypassArmor','ignoreArmorHardness']]){
  const item=equipped(kind);
  if(dmg<=0)break;
  if(bypass(bp)){log.push(`${kind} bypassed`);continue}
  if(!item){log.push(`No ${kind}`);continue}
  const d=def(item.definitionId),du=durability(item),hard=bypass(ih)?0:du.hardness;
  const before=dmg;dmg=Math.max(0,dmg-hard);log.push(`${d.name}: Hardness ${hard} reduced ${before} → ${dmg}`);
  if(dmg>0){
   item.currentHp=Math.max(0,(item.currentHp??du.max)-dmg);
   if(item.currentHp===0){item.destroyed=true;item.equipped=false;log.push(`${d.name} destroyed and permanently lost`)}
   else log.push(`${d.name} takes ${dmg} durability damage`);
  }
 }
 const hpDmg=Math.min(dmg,state.resources.hp);state.resources.hp=Math.max(0,state.resources.hp-dmg);log.push(`HP takes ${dmg}`);
 state.combat.lastDamage={start,hp:dmg,log};save();render();
}

function addActiveModifier(){
 const label=document.getElementById('modifierLabel')?.value.trim()||'Modifier',
       scope=document.getElementById('modifierScope')?.value||'all',
       duration=document.getElementById('modifierDuration')?.value||'manual',
       value=Number(document.getElementById('modifierValue')?.value)||0;
 if(!value){toast('Modifier value must be non-zero');return}
 state.combat.modifiers.push({label,scope,value,duration});save();render();
}
function removeActiveModifier(i){state.combat.modifiers.splice(i,1);save();render()}
function renderActiveModifiers(){
 const el=document.getElementById('activeModifiers');if(!el)return;
 el.innerHTML=(state.combat.modifiers||[]).length?state.combat.modifiers.map((m,i)=>`<div class="modifier-row"><b>${m.label}</b><span>${signed(m.value)} · ${m.scope.replaceAll('_',' ')} · ${(m.duration||'manual').replaceAll('_',' ')}</span><button data-remove-modifier="${i}">Remove</button></div>`).join(''):'<div class="empty">No active numeric modifiers.</div>';
}
function renderQuickSkills(){
 const el=document.getElementById('combatSkills');if(!el)return;
 const names=TRAINING.Skills.filter(x=>x[1]==='skill').map(x=>x[0]).sort((a,b)=>a.localeCompare(b));
 el.innerHTML=names.map(name=>{const s=skillValue(name);return `<div class="quick-skill"><span>${name}</span><strong>${signed(s.total)}</strong><details><summary>Math</summary><small>${s.key} ${signed(s.attr)} · Rating ${signed(s.r)} · Active ${signed(s.manual)}</small></details></div>`}).join('');
}
function nextRound(){
 state.combat.round++;
 state.combat.conditions=(state.combat.conditions||[]).map(c=>{
   const d=conditionDef(c.conditionId);
   if(d?.lifecycle?.type==='round_decay'){
     const value=Math.max(0,(Number(c.value)||1)-(Number(d.lifecycle.amount)||1));
     return {...c,value};
   }
   return c;
 }).filter(c=>c.value!==0);
 save();render();toast(`Round ${state.combat.round}`);
}
function addCondition(){
 const conditionId=document.getElementById('conditionSelect').value,d=conditionDef(conditionId);
 if(!d)return;
 const value=d.valueType==='none'?null:Math.max(1,Number(document.getElementById('conditionValue').value)||1);
 const existing=state.combat.conditions.find(c=>c.conditionId===conditionId);
 if(existing)existing.value=value;else state.combat.conditions.push({conditionId,value,source:null,notes:null});
 save();render();
}
function removeCondition(i){state.combat.conditions.splice(i,1);save();render()}
function essenceWeaponAttackBonus(item){
 const d=def(item.definitionId),groups=d?.groups||[]; let bonus=0;
 for(const e of allEssenceProgressionEffects()){
   if(e.type!=='modify_attack')continue;
   if(e.scope==='Blade weapons'&&groups.some(g=>g==='Light Blade'||g==='Heavy Blade')) bonus+=Number(e.amount)||0;
 }
 return bonus;
}
function weaponAttack(item){
 const d=def(item.definitionId), focus=item.focusGroup, r=focus?rating(focus):0, trained=focus?isTrained(focus):false;
 const thrown=(d.properties||[]).some(p=>['thrown','light-thrown','heavy-thrown'].includes(p.id));
 const attr=d.mode==='ranged'?'Dex':'Str';
 const b=ability(attr).bonus,essenceAttack=essenceWeaponAttackBonus(item),manual=attackManualModifier('weapon'),condition=conditionAttackModifier(attr),damageCondition=conditionDamageModifier(attr);
 const damageBonus=b+damageCondition;
 const dex=ability('Dex').bonus,thrownCondition=conditionAttackModifier('Dex'),thrownDamageCondition=conditionDamageModifier('Dex');
 return {normal:{attr,b,toHit:b+r+essenceAttack+manual+condition,damage:`${d.damage} ${signed(damageBonus)}`,r,trained,essenceAttack,manual,condition,damageCondition},
 thrown:thrown?{attr:'Dex',b:dex,toHit:dex+r+essenceAttack+manual+thrownCondition,damage:`${d.damage} ${signed(dex+thrownDamageCondition)}`,r,trained,essenceAttack,manual,condition:thrownCondition,damageCondition:thrownDamageCondition}:null};
}

function render(){
 applyEssenceChoiceTraining();
 const prog=characterProgress(), max=resourceMaxes(), ds=defenses();
 document.getElementById('characterName').textContent=state.profile.name;
 document.getElementById('profileLine').innerHTML=`<span>${state.profile.ancestry}</span><span>•</span><span>${prog.tier} · Rank <b>${prog.rank}</b></span><span>•</span><span>Rank Bonus <b>${signed(characterRankBonus(prog))}</b></span><span>•</span><span>${state.profile.dungeon}</span><span>•</span><span>${state.xp} XP</span>`;
 renderResources('resourceGrid',max,false); renderLifecycle(); renderAttributes(); renderDefenses(ds); renderLoadout();renderPowerLibrary();renderEssences();renderTraining();renderEquipment();renderLedger();renderCombat(max,ds);renderGM();
 const gm=!!state.ui.gmMode;
 document.getElementById('normalMode').classList.toggle('hidden',state.combat.active||gm);
 document.getElementById('combatMode').classList.toggle('hidden',!state.combat.active||gm);
 document.getElementById('gmMode').classList.toggle('hidden',!gm);
 document.getElementById('combatToggle').classList.toggle('hidden',gm);
 document.getElementById('combatToggle').textContent=state.combat.active?'Exit Combat Mode':'Enter Combat Mode';
 document.getElementById('gmToggle').textContent='GM Dashboard';
 applyAccessMode();applyRoleNavigation();
}

function renderLifecycle(){
 const rest=document.getElementById('restPanel'),review=document.getElementById('conditionReviewPanel');if(!rest||!review)return;
 const p=shortRestPreview();
 rest.innerHTML=`<div class="rest-grid">
  <div class="rest-card"><div class="eyebrow">SHORT REST</div><h3>Focused Recovery</h3>
   <div>Mana: <b>+${p.intGain}</b> from INT</div><div>Stamina: <b>+${p.conGain}</b> from CON</div>
   <div class="small">Plus 2 flexible recovery points. Allocate each point explicitly.</div>
   ${state.combat.shortRestRecoveryAvailable?(()=>{const d=state.combat.shortRestDraft||{mana:1,stamina:1},used=(Number(d.mana)||0)+(Number(d.stamina)||0),left=2-used;return `<div class="recovery-allocation">
     <div class="recovery-row"><b>Mana</b><div class="stepper"><button data-rest-alloc="mana|-1">−</button><strong>${d.mana||0}</strong><button data-rest-alloc="mana|1">+</button></div></div>
     <div class="recovery-row"><b>Stamina</b><div class="stepper"><button data-rest-alloc="stamina|-1">−</button><strong>${d.stamina||0}</strong><button data-rest-alloc="stamina|1">+</button></div></div>
     <div class="allocation-status ${left?'warn':'good'}">${used} / 2 allocated${left?` · ${left} unallocated`:''}</div>
     <div class="recovery-result"><span>Mana recovery <b>+${p.intGain+(d.mana||0)}</b></span><span>Stamina recovery <b>+${p.conGain+(d.stamina||0)}</b></span></div>
     <button data-short-rest="1" class="primary">Take Short Rest</button>
   </div>`})():`<div class="rest-spent">Recovery already focused. Another Short Rest grants no additional Mana or Stamina until a Long Rest.</div>`}
  </div>
  <div class="rest-card"><div class="eyebrow">LONG REST</div><h3>Full Recovery</h3>
   <div class="small">Restores Mana, Stamina, and Healing Surges; restores Daily Powers; processes rest-sensitive conditions; refreshes Short Rest recovery; and unlocks Power loadout changes.</div>
   <button data-long-rest="1">Take Long Rest</button>
  </div></div>`;
 review.classList.toggle('hidden',!state.combat.conditionReview);
 if(state.combat.conditionReview){
  review.innerHTML=`<div class="panel-head"><div><div class="eyebrow">COMBAT ENDED</div><h2>Review Active Conditions</h2></div></div>
  <div class="small">Conditions are never removed automatically just because combat ended.</div>
  <div class="condition-review-list">${(state.combat.conditions||[]).map((c,i)=>{const d=conditionDef(c.conditionId);return `<div class="condition"><b>${d?.name||c.conditionId}${d?.valueType!=='none'?` ${c.value||1}`:''}</b><button data-remove-condition="${i}">Clear</button></div>`}).join('')||'<div class="empty">No active conditions.</div>'}</div>
  <div class="actions"><button data-finish-condition-review="1" class="primary">Keep Remaining</button><button data-clear-all-conditions="1">Clear All</button></div>`;
 }
}
function renderResources(target,max,combat){
 const defs=[['hp','HP',max.hp],['mana','Mana',max.mana],['stamina','Stamina',max.stamina],['surges','Healing Surges',max.surges],['tempHp','Temporary HP',null],['barrier','Barrier',null],['xp','Available XP',null]];
 document.getElementById(target).innerHTML=defs.map(([k,label,m])=>{
  const val=k==='xp'?state.xp:state.resources[k], pct=m?Math.max(0,Math.min(100,val/m*100)):0;
  return `<div class="resource"><div class="eyebrow">${label}</div><div class="value">${val}${m!=null?` / ${m}`:''}</div>${m!=null?`<div class="bar"><span style="width:${pct}%"></span></div>`:''}
  <div class="controls">${k!=='xp'?`<button data-resource="${k}" data-delta="-1">−</button><button data-resource="${k}" data-delta="1">+</button>`:''}</div></div>`
 }).join('');
}
function renderAttributes(){
 document.getElementById('attributeGrid').innerHTML=['Str','Dex','Con','Int','Wis','Cha'].map(k=>{
   const a=ability(k);
   return `<div class="attribute"><div class="eyebrow">${k.toUpperCase()}</div><div class="score">${a.score}</div><div class="bonus">${signed(a.bonus)}</div><div class="small">${a.base} base ${signed(a.ancestry)} ancestry ${signed(a.essence)} Essence</div></div>`
 }).join('');
}
function renderDefenses(d){
 const rows=[['AC',d.ac,'ac'],['Fortitude',d.fortitude,'fortitude'],['Reflex',d.reflex,'reflex'],['Will',d.will,'will'],['Initiative',d.initiative,'initiative']];
 document.getElementById('defenseGrid').innerHTML=rows.map(([label,total,key])=>`<div class="defense quick-stat"><div class="eyebrow">${label}</div><div class="score">${total}</div><details><summary>Math</summary><div class="formula">${d.breakdown[key].map(([l,v])=>`${l} ${signed(v)}`).join(' · ')}</div></details></div>`).join('');
}
function renderLoadout(){
 const ownedIds=Object.keys(state.powers).filter(id=>!state.powers[id].ancestry&&pdef(id));
 const loadoutEl=document.getElementById('loadout');
 loadoutEl.innerHTML=LOADOUT_SLOTS.map(([label,cat])=>{
  const current=state.loadout[label]||null;
  const opts=ownedIds.filter(id=>powerMeta(pdef(id))?.category===cat)
    .sort((a,b)=>sourceEssenceForPower(a).localeCompare(sourceEssenceForPower(b))||pdef(a).name.localeCompare(pdef(b).name))
    .map(id=>`<option value="${id}" ${current===id?'selected':''}>${pdef(id).name} — ${sourceEssenceForPower(id)}</option>`).join('');
  const locked=!!current&&!state.combat.loadoutUnlocked;
  const emptyLabel=current?'— Empty —':'— Choose Power —';
  return `<div class="slot-row ${locked?'slot-locked':'slot-open'}"><div class="slot-label">${label}</div><select data-loadout="${label}" ${locked?'disabled':''}><option value="">${emptyLabel}</option>${opts}</select>${locked?'<span class="small">Locked until Long Rest</span>':(!current&&!state.combat.loadoutUnlocked?'<span class="small good">Empty slot may be filled</span>':'')}</div>`;
 }).join('');
 loadoutEl.insertAdjacentHTML('afterbegin',`<div class="loadout-status ${state.combat.loadoutUnlocked?'good':'muted'}">${
   state.combat.loadoutUnlocked
     ? 'Long Rest loadout window is open. You may fill empty slots or replace readied Powers. Lock the loadout when finished.'
     : 'Readied Powers are locked between Long Rests, but any empty loadout slot can be filled when you learn a new Power.'
 }${state.combat.loadoutUnlocked?' <button data-lock-loadout="1">Lock Loadout</button>':''}</div>`);
 const legacyAncestryPowers=POWER_DB.filter(p=>p.ancestry&&state.powers[p.id]);
 const definedAncestryPowers=(ANCESTRY.powers||[]).map((p,i)=>typeof p==='string'?{name:p,description:'',passive:false}:{...p,name:p.name||`Ancestry Power ${i+1}`});
 const ancestryPowers=[...definedAncestryPowers,...legacyAncestryPowers].filter((p,i,a)=>a.findIndex(x=>x.name===p.name)===i);
 document.getElementById('ancestryPowers').innerHTML=ancestryPowers.length
   ? ancestryPowers.map(p=>`<div class="power-card ancestry-power-card"><div class="power-title"><span>${p.name}</span><span class="tag">${p.passive?'Passive':(p.frequency||p.cooldown||'Ancestry')}</span></div>${p.description?`<div class="small">${p.description}</div>`:''}</div>`).join('')
   : `<div class="empty">No Ancestry Powers are currently defined for ${ANCESTRY.name}.</div>`;
}
function renderPowerLibrary(){
 const ids=Object.keys(state.powers).filter(id=>!state.powers[id].ancestry);
 const el=document.getElementById('powerLibrary');
 if(!ids.length){el.innerHTML='<div class="empty">No Essence Powers are known yet. Powers appear here only after the GM reveals them.</div>';return}
 const essenceOrder=[...state.essences,...new Set(ids.map(sourceEssenceForPower).filter(Boolean).filter(x=>!state.essences.includes(x)))];
 el.innerHTML=essenceOrder.map(essence=>{
   const group=ids.filter(id=>sourceEssenceForPower(id)===essence).sort((a,b)=>(powerMeta(pdef(a))?.slot||99)-(powerMeta(pdef(b))?.slot||99)||pdef(a).name.localeCompare(pdef(b).name));
   if(!group.length)return '';
   return `<details class="owned-essence-group" open>
    <summary class="owned-essence-head"><span><span class="collapse-chevron">▾</span><b>${essence} Essence</b></span><span>${group.length}/5 Powers</span></summary>
    <div class="owned-essence-body">${group.map(id=>{
     const a=powerCanAdvance(id),slot=powerMeta(pdef(id))?.slot;
     return `<div class="owned-power-row"><div class="owned-slot">SLOT ${slot}</div><div class="owned-power-card">${resolvedPowerCard(id)}<div class="actions power-rank-actions"><button class="primary" data-rank-power="${id}" ${a.ok?'':'disabled'}>Rank Up · ${XP_PER_POWER_RANK} XP</button><span class="small">${a.ok?`Next: ${a.next}`:a.reason}</span></div></div></div>`;
   }).join('')}</div></details>`;
 }).join('');
}
function assignedPowerForSlot(essence,slot){
 const ownedId=Object.keys(state.powers).find(id=>{
   const cp=state.powers[id],p=pdef(id),m=powerMeta(p);
   return !cp.ancestry && cp.sourceEssence===essence && m?.slot===slot;
 });
 if(!ownedId)return null;
 const definition=pdef(ownedId);
 return definition?{...definition,ownedId}:null;
}

function validateMasterPower(x){
 const slot=x?.role?.slot ?? x?.slot?.index ?? x?.slot;
 if(!x?.id||!x?.name||![1,2,3,4,5].includes(Number(slot)))throw new Error('Power requires id, name, and slot 1–5.');
 return x;
}
function validateMasterEssence(x){
 if(!x?.id||!x?.name||!x?.associated_ability)throw new Error('Essence requires id, name, and associated_ability.');
 if(!['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'].includes(x.associated_ability))throw new Error('Invalid associated_ability.');
 return x;
}
function importMasterData(kind){
 const el=document.getElementById(kind==='power'?'gmPowerJson':'gmEssenceJson');if(!el)return;
 try{
   const parsed=JSON.parse(el.value),items=Array.isArray(parsed)?parsed:[parsed];
   if(kind==='power'){
     for(const raw of items){const x=validateMasterPower(raw);if(MASTER_POWER_MODELS.some(p=>p.id===x.id))throw new Error(`Power id already exists: ${x.id}`);state.customMasterPowers.push(x);MASTER_POWER_MODELS.push(x)}
   }else{
     for(const raw of items){const x=validateMasterEssence(raw);if(MASTER_ESSENCE_MODELS.some(e=>e.id===x.id||e.name===x.name))throw new Error(`Essence already exists: ${x.name}`);state.customMasterEssences.push(x);MASTER_ESSENCE_MODELS.push(x)}
   }
   el.value='';save();render();toast(`${items.length} ${kind}${items.length===1?'':'s'} added to GM master data`);
 }catch(err){toast(`Import failed: ${err.message}`)}
}
function exportMasterData(){
 const payload={version:'0.5',essences:state.customMasterEssences||[],powers:state.customMasterPowers||[]};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='confluence-custom-master-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

const TEST_ESSENCE_SUITES={};
function loadFourEssenceTestSet(){toast('Developer test fixture unavailable in connected player mode')}
function renderGMDataStudio(){
 const el=document.getElementById('gmDataStudio');if(!el)return;
 const essenceCards=MASTER_ESSENCE_MODELS.map(e=>`<div class="library-card"><b>${e.name}</b><span>${e.associated_ability}</span><span>${(e.core_concept||[]).join(' · ')}</span></div>`).join('');
 const powerCards=MASTER_POWER_MODELS.slice().sort((a,b)=>(a.slot?.index||0)-(b.slot?.index||0)||a.name.localeCompare(b.name)).map(p=>`<div class="library-card"><b>${p.name}</b><span>Slot ${p.slot?.index} · ${p.classification?.frequency||'—'}</span><span>${(p.eligible_essences||[]).join(', ')}</span></div>`).join('');
 el.innerHTML=`<div class="gm-banner"><b>Content Library.</b> Create game content here; Character Assignment above only decides which existing content a character receives.</div>
 <div class="content-tabs">
  <div class="editor-card"><h3>Create Essence</h3>
   <label>Name<input id="newEssenceName" placeholder="Sound"></label>
   <label>Associated Ability<select id="newEssenceAbility">${['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'].map(x=>`<option>${x}</option>`).join('')}</select></label>
   <label>Core Concepts<input id="newEssenceConcept" placeholder="Resonance, vibration, harmonic force"></label>
   <div class="three-col"><label>Iron HP / Rank<input id="newEssenceHp" type="number" min="0" value="1"></label><label>Stamina Ranks<input id="newEssenceStamina" placeholder="1,5"></label><label>Mana Ranks<input id="newEssenceMana" placeholder="3"></label></div>
   <label>Healing Surge Ranks<input id="newEssenceSurges" placeholder="3,7"></label>
   <button class="primary" data-create-essence="1">Create Essence</button>
  </div>
  <div class="editor-card"><h3>Create Power</h3>
   <label>Name<input id="newPowerName" placeholder="New Power"></label>
   <div class="three-col"><label>Slot<select id="newPowerSlot">${[1,2,3,4,5].map(n=>`<option value="${n}">${n} — ${POWER_SLOT_ROLES[n].name}</option>`).join('')}</select></label><label>Frequency<select id="newPowerFrequency"><option value="at_will">At-Will</option><option value="resource">Resource</option><option value="daily">Daily</option><option value="passive">Passive</option></select></label><label>Action<input id="newPowerAction" value="Standard Action"></label></div>
   <label>Eligible Essences<input id="newPowerEssences" placeholder="Sound, Wind"></label>
   <label>Traits<input id="newPowerTraits" placeholder="Arcane, Implement"></label>
   <div class="three-col"><label>Range<input id="newPowerRange" placeholder="Ranged 10"></label><label>Defense<select id="newPowerDefense"><option value="">No attack</option><option>AC</option><option>Fortitude</option><option>Reflex</option><option>Will</option></select></label><label>Cost<input id="newPowerCost" placeholder="1 Mana"></label></div>
   <label>Hit / Effect<textarea id="newPowerHit" placeholder="What the Power does on a hit or when activated."></textarea></label>
   <label>Miss<textarea id="newPowerMiss" placeholder="Leave blank if not applicable."></textarea></label>
   <div class="three-col"><label>Rank 3 effect<textarea id="newPowerR3"></textarea></label><label>Rank 6 effect<textarea id="newPowerR6"></textarea></label><label>Rank 9 effect<textarea id="newPowerR9"></textarea></label></div>
   <button class="primary" data-create-power="1">Create Power</button>
  </div>
 </div>
 <div class="master-summary"><b>${MASTER_ESSENCE_MODELS.length} Essences · ${MASTER_POWER_MODELS.length} master Powers · 20 test Essence-slot assignments</b><button data-load-test-set="1">Load Four-Essence Test Set</button><button data-export-master="1">Export Added Master Data</button></div>
 <details class="advanced-json"><summary>Advanced JSON Import</summary><div class="two-col"><div><textarea id="gmEssenceJson" class="json-editor" placeholder="Shared Essence Model JSON"></textarea><button data-import-master="essence">Import Essence JSON</button></div><div><textarea id="gmPowerJson" class="json-editor" placeholder="Shared Power Model JSON"></textarea><button data-import-master="power">Import Power JSON</button></div></div></details>
 <h3>Essence Library</h3><div class="library-grid">${essenceCards}</div>
 <h3>Power Library</h3><div class="library-grid">${powerCards}</div>`;
}

function parseRanks(v){return String(v||'').split(',').map(x=>Number(x.trim())).filter(x=>Number.isInteger(x)&&x>=0&&x<=9)}
function createEssenceFromForm(){
 const name=document.getElementById('newEssenceName')?.value.trim();if(!name){toast('Essence name required');return}
 if(MASTER_ESSENCE_MODELS.some(e=>e.name.toLowerCase()===name.toLowerCase())){toast('Essence already exists');return}
 const ability=document.getElementById('newEssenceAbility').value,concepts=document.getElementById('newEssenceConcept').value.split(',').map(x=>x.trim()).filter(Boolean);
 const hp=Math.max(0,Number(document.getElementById('newEssenceHp').value)||0),st=parseRanks(document.getElementById('newEssenceStamina').value),ma=parseRanks(document.getElementById('newEssenceMana').value),su=parseRanks(document.getElementById('newEssenceSurges').value);
 const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const mk=(resource,ranks)=>({resource,mode:ranks.length?'threshold':'none',amount_per_rank:null,thresholds:ranks.map(rank=>({rank,amount:1,effect:null})),notes:null});
 const e={id,name,core_concept:concepts,description:'GM-created Essence.',associated_ability:ability,tier_progression:[
  {tier:'Iron',resource_rules:[{resource:'hp',mode:'per_rank',amount_per_rank:hp,thresholds:[],notes:null},mk('healing_surges',su),mk('stamina',st),mk('mana',ma)],milestones:[],other_unlocks:[],status:'draft'},
  ...['Bronze','Silver','Gold','Platinum'].map(tier=>({tier,resource_rules:[],milestones:[],other_unlocks:[],status:'placeholder'}))
 ],power_slots:[1,2,3,4,5].map(slot=>({slot,role:POWER_SLOT_ROLES[slot].key||['core','utility_passive','signature_strike','tactical_strike','apex'][slot-1]})),design_notes:[]};
 state.customMasterEssences.push(e);MASTER_ESSENCE_MODELS.push(e);save();render();toast(`${name} added to Content Library`);
}
function createPowerFromForm(){
 const name=document.getElementById('newPowerName')?.value.trim();if(!name){toast('Power name required');return}
 const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if(MASTER_POWER_MODELS.some(p=>p.id===id)){toast('Power already exists');return}
 const slot=Number(document.getElementById('newPowerSlot').value),freq=document.getElementById('newPowerFrequency').value,action=document.getElementById('newPowerAction').value.trim(),
 ess=document.getElementById('newPowerEssences').value.split(',').map(x=>x.trim()).filter(Boolean),traits=document.getElementById('newPowerTraits').value.split(',').map(x=>x.trim()).filter(Boolean),
 range=document.getElementById('newPowerRange').value.trim(),defense=document.getElementById('newPowerDefense').value.toLowerCase(),hit=document.getElementById('newPowerHit').value.trim(),miss=document.getElementById('newPowerMiss').value.trim(),
 costText=document.getElementById('newPowerCost').value.trim(),costs=[];
 for(const m of costText.matchAll(/(\d+)\s*(Mana|Stamina|Quintessence)/gi))costs.push({resource:m[2][0].toUpperCase()+m[2].slice(1).toLowerCase(),amount:Number(m[1]),consumed:true,notes:null});
 const expr=[3,6,9].map(r=>[r,document.getElementById(`newPowerR${r}`).value.trim()]).filter(x=>x[1]).map(([rank,text])=>({rank,name:`Rank ${rank} Effect`,status:'final',operations:[{operation:'add',path:'resolved_rank_effects',value:null,trigger:null,effect:{type:'text_rule',text,optional:false},notes:text}]}));
 const p={id,name,slot:{index:slot,role:['core','utility_passive','signature_strike','tactical_strike','apex'][slot-1]},eligible_essences:ess,classification:{frequency:freq,traits,dungeon_resonance:'Neutral'},activation:{mode:'active',action_type:action,trigger:null,requirements:[]},costs,
 targeting:{range:{type:'other',distance:null,size:null,within:null,origin:range},target:{selector:'As defined',minimum:null,maximum:null,relationship:null}},requirements:[],
 resolution:{attacks:defense?[{attack_type:'power_attack',defense,formula:'1d20 + power_rank + source_essence.associated_ability_modifier',roll_count:1,target_assignment:'As defined',notes:null}]:[],hit:hit?[{id:'hit',type:'text_rule',text:hit,optional:false}]:[],miss:miss?[{id:'miss',type:'text_rule',text:miss,optional:false}]:[],post_resolution:[]},
 effects:(!defense&&hit)?[{id:'effect',type:'text_rule',text:hit,optional:false}]:[],special_rules:[],tier_progression:[
  {tier:'Iron',baseline:{inherits_previous_tier:false,operations:[],status:'final'},rank_expressions:expr},
  ...['Bronze','Silver','Gold','Platinum'].map(tier=>({tier,baseline:{inherits_previous_tier:true,operations:[],status:'placeholder'},rank_expressions:[]}))
 ],design_notes:[]};
 state.customMasterPowers.push(p);MASTER_POWER_MODELS.push(p);save();render();toast(`${name} added to Content Library`);
}
function renderGM(){
 const overview=document.getElementById('gmOverview'),slots=document.getElementById('gmEssenceSlots'),power=document.getElementById('gmPowerAssignment');
 if(!overview||!slots||!power)return;
 overview.innerHTML=`<div class="gm-banner"><b>GM Assignment.</b> The GM controls only hidden Essence/Power assignment and XP awards. Training, equipment, XP spending, loadout, gear, and combat state belong to the player.</div>
 <div><b>${state.profile.name}</b> knows ${state.essences.length}/4 Essences and ${Object.keys(state.powers).filter(id=>!state.powers[id].ancestry).length}/20 Essence Powers. <b>${state.xp} XP available.</b></div>
 <div class="gm-xp-award"><input id="xpAward" type="number" min="1" value="20"><button id="awardXpBtn" class="primary">Grant XP</button></div>`;
 const assignable=MASTER_ESSENCE_MODELS.filter(e=>!state.essences.includes(e.name));
 slots.innerHTML=`<div class="gm-slot-grid">${[0,1,2,3].map(i=>{
   const name=state.essences[i];
   if(name){const ed=essenceDef(name);return `<div class="gm-slot"><div class="eyebrow">ESSENCE ${i+1}</div><h2>${name}</h2><div class="small">Associated Ability: <b>${ed?.associated_ability||'—'}</b></div><div class="small">${(ed?.core_concept||[]).join(' · ')}</div></div>`}
   return `<div class="gm-slot"><div class="eyebrow">ESSENCE ${i+1}</div>
    <select id="gmEssenceSelect-${i}"><option value="">Choose hidden Essence…</option>${assignable.map(e=>`<option value="${e.name}">${e.name}</option>`).join('')}</select>
    <div class="actions"><button class="primary" data-assign-essence="${i}">Assign Essence + Core</button></div></div>`;
 }).join('')}</div>`;
 if(!state.essences.length){power.innerHTML='<div class="empty">Assign an Essence first.</div>';return}
 power.innerHTML=state.essences.map(essence=>`<div class="essence-card gm-hidden-data"><div class="power-title"><span>${essence} Essence</span><span class="tag">${essenceDef(essence)?.associated_ability||'?'}</span></div>
 ${[1,2,3,4,5].map(slot=>{
   const role=POWER_SLOT_ROLES[slot],assigned=assignedPowerForSlot(essence,slot);
   if(assigned){const owned=state.powers[assigned.ownedId];return `<div class="gm-slot"><b>${role.name}</b> · <span class="good">${assigned.name}</span><div class="small">${owned.tier} ${owned.rank}</div></div>`;}
   const candidates=MASTER_POWER_MODELS.filter(p=>p.slot?.index===slot&&(p.eligible_essences||[]).includes(essence));
   return `<div class="gm-slot"><b>${role.name}</b><div class="small">${role.typical}</div>
    <div class="selector-row"><select data-gm-power-select="${essence}|${slot}"><option value="">${candidates.length?'Choose hidden structured candidate…':'No structured candidates loaded'}</option>${candidates.map(p=>{const owners=Object.keys(state.powers).filter(id=>!state.powers[id].ancestry&&basePowerId(id)===p.id).map(sourceEssenceForPower);return `<option value="${p.id}">${p.name}${owners.length?` (already known via ${owners.join(', ')})`:''}</option>`}).join('')}</select>
    ${candidates.length?`<button data-random-power="${essence}|${slot}">Randomize</button>`:''}</div>
    <div class="selector-row"><input data-manual-power="${essence}|${slot}" placeholder="GM-enter exact Power name"><button data-assign-manual-power="${essence}|${slot}">Assign Manual</button></div>
   </div>`;
 }).join('')}</div>`).join('');
}
function renderEssences(){
 const el=document.getElementById('essenceProgress');if(!state.essences.length){el.innerHTML='<div class="empty">No Essences assigned.</div>';return}
 el.innerHTML=allEssenceInfo().map(e=>{
   const ed=essenceDef(e.name);
   const resources=['hp','mana','stamina','healing_surges'].map(r=>`<span class="tag">${r.replaceAll('_',' ')}: ${signed(essenceResourceContribution(e.name,r))}</span>`).join('');
   return `<div class="essence-card"><div class="power-title"><span>${e.name} Essence</span><span class="rank-big">${e.tier} ${e.rank}</span></div>
    <div class="meta"><span class="tag">${ed?.associated_ability||'Unknown ability'}</span>${resources}</div>
    <div class="small">${(ed?.core_concept||[]).join(' · ')}</div>
    <div class="essence-slots">${e.slots.map(s=>`<div class="essence-slot"><div class="eyebrow">${POWER_SLOT_ROLES[s.slot]?.name||`POWER ${s.slot}`}</div><b>${s.cp&&s.pd?s.pd.name:'Undiscovered'}</b><div class="small">${s.cp?`${s.cp.tier} ${s.cp.rank}`:'Rank 0'}</div></div>`).join('')}</div>
   </div>`;
 }).join('');
 const pending=pendingEssenceChoices();
 if(pending.length)el.innerHTML+=`<div class="panel choice-panel"><div class="eyebrow">NEW ESSENCE CHOICE</div><div class="small">A new Essence benefit requires a permanent choice.</div>${pending.map(c=>`<div class="selector-row"><b>${c.essence}</b><select data-essence-choice="${c.key}"><option value="">Choose…</option>${c.effect.choice.options.map(x=>`<option>${x}</option>`).join('')}</select></div>`).join('')}</div>`;
}
function renderTraining(){
 document.getElementById('training').innerHTML=Object.entries(TRAINING).map(([group,rows])=>`<div class="training-group"><div class="subhead">${group}</div>${rows.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([name,type,supports])=>{
  const t=training(name),sv=type==='skill'?skillValue(name):null;
  if(!supports){
   return `<div class="training-row no-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b><select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select></div>`;
  }
  return `<div class="training-row has-rating ${t.status!=='Untrained'?'is-trained':''}"><b>${name}</b>${sv?`<span class="final-mod">${signed(sv.total)}</span>`:'<span></span>'}<select class="training-prof" data-training="${name}">${PROFICIENCIES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select><input class="training-rating" data-rating="${name}" type="number" min="1" value="${t.rating||1}" ${t.status==='Untrained'?'disabled':''}>${sv?`<details class="row-math"><summary>Math</summary><span>${sv.key} ${signed(sv.attr)} · Rating ${signed(sv.r)} · Active ${signed(sv.manual)}</span></details>`:''}</div>`;
 }).join('')}</div>`).join('');
}
function renderEquipment(){
 const el=document.getElementById('ownedEquipment');
 el.innerHTML=state.equipment.length?state.equipment.map(item=>{const d=def(item.definitionId),du=durability(item);if(!d)return'';const focus=d.kind==='weapon'?`<div class="selector-row"><label>Permanent Focus <select data-focus="${item.uid}" ${item.focusGroup?'disabled':''}>${(d.groups||[]).map(g=>`<option ${g===item.focusGroup?'selected':''}>${g}</option>`).join('')}</select></label><span class="small">${item.focusGroup?`Locked: ${item.focusGroup}`:'Choose once'}</span></div>`:'';const dur=d.kind!=='weapon'?`<div class="small">Durability: <b class="${du.state==='functional'?'good':du.state==='broken'?'warn':'bad'}">${du.state}</b> · ${du.hp}/${du.max} HP · Hardness ${du.hardness}</div><div class="durability ${du.state}"><span style="width:${du.max?du.hp/du.max*100:0}%"></span></div>`:'';return `<div class="equip-card ${item.equipped?'is-equipped':''} ${item.destroyed?'is-destroyed':''}"><div class="equip-title"><span>${d.name}</span><span>${item.destroyed?'<span class="bad">DESTROYED</span>':item.equipped?'<span class="equipped-badge">EQUIPPED</span>':''}</span></div>${equipmentDetail(d)}${focus}${dur}<div class="actions">${!item.destroyed?`<button data-equip="${item.uid}">${item.equipped?'Unequip':'Equip'}</button>`:''}${d.kind!=='weapon'&&!item.destroyed?`<button data-repair="${item.uid}" title="Restore 5 durability HP, up to the item maximum.">Repair 5 Durability</button>`:''}</div></div>`}).join(''):'<div class="empty">No equipment owned.</div>';
 const sel=document.getElementById('catalogSelect');sel.innerHTML=EQUIPMENT_DB.map(d=>`<option value="${d.id}">${d.name} · ${d.kind}</option>`).join('');renderCatalogDetail();
}
function renderCatalogDetail(){const id=document.getElementById('catalogSelect')?.value||EQUIPMENT_DB[0]?.id,d=def(id);document.getElementById('catalogDetail').innerHTML=d?`<div class="equip-card"><div class="equip-title">${d.name}</div>${equipmentDetail(d)}</div>`:''}
function renderLedger(){
 document.getElementById('ledgerBalance').textContent=`${state.xp} XP available`;
 document.getElementById('xpLedger').innerHTML=`<table><thead><tr><th>Type</th><th>Amount</th><th>Details</th></tr></thead><tbody>${state.xpLedger.map(x=>`<tr><td>${x.type}</td><td class="${x.amount>=0?'good':'bad'}">${signed(x.amount)}</td><td>${x.note||''}</td></tr>`).join('')}</tbody></table>`;
}
function renderCombat(max,ds){
 document.getElementById('roundNumber').textContent=state.combat.round;renderResources('combatResources',max,true);
 document.getElementById('combatDefenses').innerHTML=[['AC',ds.ac,'ac'],['Fortitude',ds.fortitude,'fortitude'],['Reflex',ds.reflex,'reflex'],['Will',ds.will,'will'],['Initiative',ds.initiative,'initiative']].map(([label,total,key])=>`<div class="defense quick-stat"><div class="eyebrow">${label}</div><div class="score">${total}</div><details><summary>Math</summary><div class="formula">${ds.breakdown[key].map(([l,v])=>`${l} ${signed(v)}`).join(' · ')}</div></details></div>`).join('');
 const readyIds=[...new Set(Object.values(state.loadout).filter(Boolean))];
 document.getElementById('combatPowers').innerHTML=readyIds.length?readyIds.map(compactCombatPowerCard).join(''):'<div class="empty">No Essence Powers are readied. Choose Powers in the Current Loadout.</div>';
 const weapons=state.equipment.filter(x=>x.equipped&&!x.destroyed&&def(x.definitionId)?.kind==='weapon');
 document.getElementById('combatWeapons').innerHTML=weapons.length?weapons.map(item=>{const d=def(item.definitionId),a=weaponAttack(item);return `<article class="weapon-quick-card"><div class="combat-card-head"><div><div class="eyebrow">${item.focusGroup||'No focus'}</div><h3>${d.name}</h3></div></div>
  <div class="weapon-roll-grid"><div class="weapon-stat-box"><span class="roll-label">TO HIT</span><strong>${signed(a.normal.toHit)}</strong><div>Roll 1d20 ${signed(a.normal.toHit)}</div></div><div class="weapon-stat-box"><span class="roll-label">DAMAGE</span><strong>${a.normal.damage}</strong><div>Roll ${a.normal.damage}</div></div></div>
  <details class="math-breakdown"><summary>Attack math</summary><div>Rank Bonus ${signed(a.normal.rankBonus||0)} · ${a.normal.attr} ${signed(a.normal.b)} · Weapon Rank ${a.normal.weaponRank||0} → ${signed(a.normal.trainingBonus||0)}${a.normal.potency?` · Potency ${signed(a.normal.potency)}`:''} · Essence ${signed(a.normal.essenceAttack)}${a.normal.roundBonus?` · Round ${signed(a.normal.roundBonus)}`:''} · Active ${signed(a.normal.manual)} · Conditions ${signed(a.normal.condition)}</div>${a.normal.damageCondition?`<div>Damage condition modifier ${signed(a.normal.damageCondition)}</div>`:''}</details>
  ${a.thrown?`<div class="thrown-line"><b>Thrown:</b> 1d20 ${signed(a.thrown.toHit)} · Damage ${a.thrown.damage}</div>`:''}</article>`}).join(''):'<div class="empty">Equip a weapon to see attack calculations.</div>';
 document.getElementById('combatEquipment').innerHTML=['shield','armor'].map(kind=>{const item=equipped(kind);if(!item)return `<div class="empty">No ${kind} equipped.</div>`;const d=def(item.definitionId),du=durability(item);return `<div class="equip-card"><div class="equip-title"><span>${d.name}</span><span class="${du.state==='functional'?'good':du.state==='broken'?'warn':'bad'}">${du.state}</span></div><div>${du.hp}/${du.max} HP · Hardness ${du.hardness} · AC ${du.ac&&isTrained(d.trainingName)?'active':'inactive'}</div></div>`}).join('');
 renderConditionControls();
 document.getElementById('conditions').innerHTML=state.combat.conditions.length?state.combat.conditions.map((c,i)=>{const d=conditionDef(c.conditionId);if(!d)return'';const value=d.valueType==='none'?'':` ${c.value||1}`,decay=d.lifecycle?.type==='round_decay'?` · next round → ${Math.max(0,(c.value||1)-(d.lifecycle.amount||1))}`:'';return `<article class="condition-card"><div class="condition-head"><div><b>${d.name}${value}</b><span class="condition-effect">${conditionSummaryModifiers(c)}</span></div><div class="condition-actions">${d.valueType!=='none'?`<button data-adjust-condition="${i}|-1">−</button><button data-adjust-condition="${i}|1">+</button>`:''}<button data-remove-condition="${i}">Remove</button></div></div><div class="small">${d.reminder}${decay}</div>${(d.derived||[]).length?`<div class="derived-line">Also causes: ${d.derived.map(x=>conditionDef(x.conditionId)?.name||x.conditionId).join(' · ')}</div>`:''}</article>`}).join(''):'<div class="empty">No active conditions.</div>';
 document.getElementById('damageResult').innerHTML=state.combat.lastDamage?`<div class="damage-result"><b>Last Damage: ${state.combat.lastDamage.start}</b>${state.combat.lastDamage.log.map(x=>`<div>${x}</div>`).join('')}</div>`:'';
 renderActiveModifiers();renderQuickSkills();
}


function endCombat(){
 state.combat.active=false;state.combat.round=1;
 state.combat.modifiers=(state.combat.modifiers||[]).filter(m=>!['combat','encounter'].includes(m.duration));
 state.combat.conditionReview=(state.combat.conditions||[]).length>0;
 save();render();toast('Combat ended');
}
function toggleCombatMode(){
 if(state.combat.active){endCombat();return}
 state.combat.active=true;state.combat.round=1;state.combat.conditionReview=false;state.ui.gmMode=false;save();render();
}
function shortRestPreview(){
 const max=resourceMaxes(),intGain=Math.max(0,ability('Int').bonus),conGain=Math.max(0,ability('Con').bonus);
 return {max,intGain,conGain,manaBase:Math.min(intGain,Math.max(0,max.mana-state.resources.mana)),staminaBase:Math.min(conGain,Math.max(0,max.stamina-state.resources.stamina))};
}
function setShortRestAllocation(kind,delta){
 const d=state.combat.shortRestDraft||{mana:1,stamina:1};
 const next=Math.max(0,Math.min(2,(Number(d[kind])||0)+delta));
 const other=kind==='mana'?'stamina':'mana';
 if(next+(Number(d[other])||0)>2)return;
 d[kind]=next;state.combat.shortRestDraft=d;save();render();
}
function takeShortRest(){
 if(!state.combat.shortRestRecoveryAvailable){toast('Short Rest recovery already used since the last Long Rest');return}
 const p=shortRestPreview(),d=state.combat.shortRestDraft||{mana:0,stamina:0};
 const manaFlex=Math.max(0,Math.min(2,Number(d.mana)||0)),staminaFlex=Math.max(0,Math.min(2,Number(d.stamina)||0));
 if(manaFlex+staminaFlex>2){toast('Flexible recovery cannot exceed 2 points');return}
 state.resources.mana=Math.min(p.max.mana,state.resources.mana+p.intGain+manaFlex);
 state.resources.stamina=Math.min(p.max.stamina,state.resources.stamina+p.conGain+staminaFlex);
 state.combat.shortRestRecoveryAvailable=false;
 save();render();toast(`Short Rest complete: Mana +${p.intGain+manaFlex}, Stamina +${p.conGain+staminaFlex}`);
}
function takeLongRest(){
 const max=resourceMaxes();
 state.resources.mana=max.mana;state.resources.stamina=max.stamina;state.resources.surges=max.surges;
 state.combat.dailyExpended={};state.combat.shortRestRecoveryAvailable=true;state.combat.loadoutUnlocked=true;state.combat.shortRestDraft={mana:1,stamina:1};
 state.combat.modifiers=(state.combat.modifiers||[]).filter(m=>!['until_rest','until_long_rest'].includes(m.duration));
 state.combat.conditions=(state.combat.conditions||[]).map(c=>{
   const d=conditionDef(c.conditionId);
   if(d?.lifecycle?.type==='rest_decay'){const value=Math.max(0,(Number(c.value)||1)-(Number(d.lifecycle.amount)||1));return {...c,value}}
   if(d?.lifecycle?.type==='rest')return null;
   return c;
 }).filter(c=>c&&c.value!==0);
 save();render();toast('Long Rest complete — Mana/Stamina restored, Dailies restored, loadout unlocked');
}
function clearAllConditions(){state.combat.conditions=[];state.combat.conditionReview=false;save();render()}
function finishConditionReview(){state.combat.conditionReview=false;save();render()}
function exportCharacter(){
 const payload={format:'confluence-character',version:'0.9',exportedAt:new Date().toISOString(),character:state};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=`${String(state.profile.name||'character').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.confluence.json`;a.click();URL.revokeObjectURL(a.href);
}
function importCharacterFile(file){toast('Import is disabled in connected mode. Character data is controlled by the backend.')}

function toggleGMMode(){location.href='/gm.html'}
document.getElementById('combatToggle')?.addEventListener('click',toggleCombatMode);
document.getElementById('gmToggle')?.addEventListener('click',toggleGMMode);
document.getElementById('combatToggleInline')?.addEventListener('click',endCombat);

document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='resetBtn'){refreshFromBackend('Reloaded from backend').catch(e=>toast(e.message))}
 else if(b.id==='addEquipmentBtn')addEquipment(document.getElementById('catalogSelect').value)
 else if(b.id==='resolveDamageBtn')resolveDamage()
 else if(b.id==='nextRoundBtn')nextRound()
 else if(b.dataset.restAlloc){const [kind,delta]=b.dataset.restAlloc.split('|');setShortRestAllocation(kind,Number(delta))}
 else if(b.dataset.shortRest)takeShortRest()
 else if(b.dataset.longRest)takeLongRest()
 else if(b.dataset.lockLoadout){state.combat.loadoutUnlocked=false;save();render()}
 else if(b.dataset.finishConditionReview)finishConditionReview()
 else if(b.dataset.clearAllConditions)clearAllConditions()
 else if(b.dataset.exportCharacter)exportCharacter()
 else if(b.dataset.importCharacter)document.getElementById('characterImportFile')?.click()
 else if(b.id==='addConditionBtn')addCondition()
 else if(b.dataset.importMaster)importMasterData(b.dataset.importMaster)
 else if(b.dataset.createEssence)createEssenceFromForm()
 else if(b.dataset.createPower)createPowerFromForm()
 else if(b.dataset.loadTestSet)loadFourEssenceTestSet()
 else if(b.dataset.restoreDailies)restoreDailyPowers()
 else if(b.dataset.markDaily)markDailyUsed(b.dataset.markDaily)
 else if(b.id==='addModifierBtn')addActiveModifier()
 else if(b.dataset.removeModifier!=null)removeActiveModifier(Number(b.dataset.removeModifier))
 else if(b.dataset.adjustCondition){const [i,d]=b.dataset.adjustCondition.split('|').map(Number);adjustCondition(i,d)}
 else if(b.dataset.exportMaster)exportMasterData()
 else if(b.dataset.assignEssence!=null){const i=b.dataset.assignEssence;const sel=document.getElementById(`gmEssenceSelect-${i}`);assignEssence(sel?.value)}
 else if(b.dataset.randomPower){const [ess,slot]=b.dataset.randomPower.split('|');randomizePower(ess,Number(slot))}
 else if(b.dataset.assignManualPower){const [ess,slot]=b.dataset.assignManualPower.split('|');const inp=document.querySelector(`[data-manual-power="${CSS.escape(b.dataset.assignManualPower)}"]`);assignPowerToSlot(ess,Number(slot),null,inp?.value?.trim())}
 else if(b.dataset.rankPower)advancePower(b.dataset.rankPower)
 else if(b.dataset.equip)toggleEquip(b.dataset.equip)
 else if(b.dataset.repair)repair(b.dataset.repair)
 else if(b.dataset.removeCondition!=null)removeCondition(Number(b.dataset.removeCondition))
 else if(b.dataset.resource){
  const k=b.dataset.resource,delta=Number(b.dataset.delta),max=resourceMaxes()[k];
  state.resources[k]=Math.max(0,state.resources[k]+delta);if(max!=null)state.resources[k]=Math.min(max,state.resources[k]);save();render();
 }
});
document.addEventListener('change',e=>{
 if(e.target.matches('.tab'))return;
 if(e.target.dataset.essenceChoice){
   state.essenceChoices[e.target.dataset.essenceChoice]=e.target.value;
   applyEssenceChoiceTraining();save();render();toast(`${e.target.value} selected as a permanent Essence benefit`);
 }
 if(e.target.dataset.gmPowerSelect){
   const [ess,slot]=e.target.dataset.gmPowerSelect.split('|');
   if(e.target.value)assignPowerToSlot(ess,Number(slot),e.target.value);
 }
 if(e.target.dataset.loadout!=null){
   const label=e.target.dataset.loadout,current=state.loadout[label]||null,next=e.target.value||null;
   if(current&&!state.combat.loadoutUnlocked){toast('Readied Powers can only be swapped after a Long Rest');render();return}
   state.loadout[label]=next;save();render();
   if(next&&!current&&!state.combat.loadoutUnlocked)toast('Power readied in empty slot');
 }
 if(e.target.dataset.training){const n=e.target.dataset.training, r=document.querySelector(`[data-rating="${CSS.escape(n)}"]`)?.value;setTraining(n,e.target.value,r)}
 if(e.target.dataset.rating){const n=e.target.dataset.rating;setTraining(n,training(n).status,e.target.value)}
 if(e.target.dataset.focus)setFocus(e.target.dataset.focus,e.target.value)
 if(e.target.id==='catalogSelect')renderCatalogDetail();
});
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
 btn.classList.add('active');document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
}));

document.getElementById('conditionSelect')?.addEventListener('change',renderConditionControls);
document.getElementById('characterImportFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importCharacterFile(f);e.target.value=''});
async function bootstrapConnectedCharacter(){
 const main=document.getElementById('characterMain');
 const errorPanel=document.getElementById('characterLoadError');
 const errorMessage=document.getElementById('characterLoadErrorMessage');
 const banner=document.getElementById('gmReadOnlyBanner');
 const title=document.getElementById('characterName');
 const saveState=document.getElementById('saveState');

 const hide=(el)=>{if(!el)return;el.classList.add('hidden');el.style.display='none'};
 const show=(el)=>{if(!el)return;el.classList.remove('hidden');el.style.display=''};
 const fail=(message)=>{
   CONNECTED_BACKEND.connected=false;CONNECTED_BACKEND.readOnly=false;CONNECTED_BACKEND.isOwner=false;CONNECTED_BACKEND.isGm=false;
   if(title)title.textContent='Character Unavailable';
   hide(banner);hide(main);show(errorPanel);
   if(errorMessage)errorMessage.textContent=message;
   if(saveState)saveState.textContent='Character failed to load';
   console.error('[Confluence Character Load]',message);
 };

 if(title)title.textContent='Loading Character…';
 hide(main);hide(errorPanel);hide(banner);

 if(!CONNECTED_BACKEND.characterId){
   fail('No Character was selected. Return to the Character Portal and choose a Character.');
   return;
 }
 try{
   await withTimeout(requireSession(),5000,'Authentication check');
   const data=await backendRequest('snapshot');
   if(!data?.id)throw new Error('Character not found. It may have been deleted.');

   CONNECTED_BACKEND.isOwner=!!data.viewer_is_owner;
   CONNECTED_BACKEND.isGm=!!data.viewer_is_gm;
   if(!CONNECTED_BACKEND.isOwner&&!CONNECTED_BACKEND.isGm)throw new Error('You do not have access to this Character.');
   CONNECTED_BACKEND.readOnly=!CONNECTED_BACKEND.isOwner;

   state=stateFromBackend(data);
   CONNECTED_BACKEND.connected=true;
   hide(errorPanel);show(main);
   render();
   if(CONNECTED_BACKEND.readOnly)show(banner);else hide(banner);
   if(saveState)saveState.textContent=CONNECTED_BACKEND.readOnly?'GM read-only view':'Connected · saved to backend';
 }catch(err){
   const raw=String(err?.message||err||'Unknown error');
   fail(/Character not found/i.test(raw)
     ? 'This Character no longer exists. Return to the Character Portal and choose one of your current Characters.'
     : `Character failed to load: ${raw}`);
 }
}
bootstrapConnectedCharacter();
