const {createClient}=supabase;
const confluenceSupabase=createClient(
  window.CONFLUENCE_SUPABASE.url,
  window.CONFLUENCE_SUPABASE.publishableKey,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);
async function requireSession(){
  const {data:{session},error}=await confluenceSupabase.auth.getSession();
  if(error)throw error;
  if(!session){
    location.href='/login.html?next='+encodeURIComponent(location.pathname+location.search);
    throw new Error('Authentication required');
  }
  return session;
}
async function signOut(){
  await confluenceSupabase.auth.signOut();
  location.href='/login.html';
}
