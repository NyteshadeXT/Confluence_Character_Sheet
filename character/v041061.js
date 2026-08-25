
/* v0.4.10.6.1 — Incremental Training Single-Application Fix */
document.addEventListener('change',e=>{
 const sel=e.target.closest?.('.training-choice-panel [data-essence-choice]');
 if(!sel||!sel.value)return;
 sel.disabled=true;
},true);
