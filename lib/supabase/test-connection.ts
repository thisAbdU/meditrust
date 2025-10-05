import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    // Test auth connection
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Supabase auth test failed:', authError)
      return { success: false, error: authError.message }
    }
    
    console.log('✅ Supabase connection successful')
    console.log('📊 Current session:', session ? 'User logged in' : 'No user session')
    
    return { 
      success: true, 
      message: 'Supabase connection successful',
      session: session ? { user: session.user.email, id: session.user.id } : null
    }
  } catch (error: any) {
    console.error('❌ Supabase connection test failed:', error)
    return { success: false, error: error.message }
  }
}
