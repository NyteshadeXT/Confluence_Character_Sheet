const {createClient}=supabase;
const confluenceSupabase=createClient(
  window.CONFLUENCE_SUPABASE.url,
  window.CONFLUENCE_SUPABASE.publishableKey,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);

// Compatibility helpers used by older pages (including System Data Studio).
// Route them through the selected provider rather than always checking Supabase.
async function requireSession(){
  if(window.confluenceAuth && typeof window.confluenceAuth.requireSession==='function'){
    return window.confluenceAuth.requireSession();
  }
  const {data:{session},error}=await confluenceSupabase.auth.getSession();
  if(error)throw error;
  if(!session){
    location.href='/login.html?next='+encodeURIComponent(location.pathname+location.search);
    throw new Error('Authentication required');
  }
  return session;
}
async function signOut(){
  if(window.confluenceAuth && typeof window.confluenceAuth.signOutAndRedirect==='function'){
    return window.confluenceAuth.signOutAndRedirect();
  }
  await confluenceSupabase.auth.signOut();
  location.href='/login.html';
}
