import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({
        success: false,
        error: sessionError.message
      })
    }
    
    // Test database connection
    const { data, error } = await supabase
      .from('_connection_test')
      .select('*')
      .limit(1)
    
    // PGRST116 means table doesn't exist, which is expected
    const dbConnected = !error || error.code === 'PGRST116'
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection test completed',
      connection: {
        auth: !sessionError,
        database: dbConnected,
        session: session ? { user: session.user.email, id: session.user.id } : null
      },
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
