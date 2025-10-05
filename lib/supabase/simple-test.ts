// Simple Supabase connection test
import { createClient } from './client'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    const supabase = createClient()
    
    // Test basic connection by trying to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
      return { success: false, error: sessionError.message }
    }
    
    console.log('✅ Supabase client created successfully')
    console.log('📊 Current session:', session ? 'User logged in' : 'No user session')
    
    // Test database connection by trying to query a non-existent table
    // This will fail but should show we can connect to the database
    const { data, error } = await supabase
      .from('_connection_test')
      .select('*')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      // This is expected - table doesn't exist, but connection works
      console.log('✅ Database connection successful (table not found is expected)')
      return { 
        success: true, 
        message: 'Supabase connection successful',
        session: session ? { user: session.user.email, id: session.user.id } : null
      }
    } else if (error) {
      console.error('❌ Database error:', error.message)
      return { success: false, error: error.message }
    }
    
    return { 
      success: true, 
      message: 'Supabase connection successful',
      session: session ? { user: session.user.email, id: session.user.id } : null
    }
  } catch (error: any) {
    console.error('❌ Connection test failed:', error)
    return { success: false, error: error.message }
  }
}
