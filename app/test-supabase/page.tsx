'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/lib/supabase/auth-utils'
import { AuthUser } from '@/lib/supabase/types'

export default function TestSupabase() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)

  useEffect(() => {
    // Test Supabase connection
    testConnection()
    
    // Get initial session
    authService.getCurrentUser().then(({ user, error }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (session?.user) {
        authService.getCurrentUser().then(({ user }) => setUser(user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const testConnection = async () => {
    try {
      const { testSupabaseConnection } = await import('@/lib/supabase/test-connection')
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({ success: false, error: 'Failed to test connection' })
    }
  }

  const handleSignOut = async () => {
    await authService.signOut()
  }

  const testUserCreation = async () => {
    setTestResults({ loading: true, message: 'Testing user creation...' })
    
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const { data, error } = await authService.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        full_name: 'Test User',
        role: 'patient'
      })

      if (error) {
        setTestResults({ success: false, error: error.message })
      } else {
        setTestResults({ 
          success: true, 
          message: 'Test user created successfully!',
          data: { email: testEmail }
        })
      }
    } catch (error: any) {
      setTestResults({ success: false, error: error.message })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Supabase Integration Test
        </h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Connection Test:</strong> {
              connectionStatus?.success ? '✅ Connected' : '❌ Failed'
            }</p>
            {connectionStatus?.error && (
              <p className="text-red-600"><strong>Error:</strong> {connectionStatus.error}</p>
            )}
          </div>
        </div>

        {/* Database Schema Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Schema Test</h2>
          <button
            onClick={testUserCreation}
            disabled={testResults?.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {testResults?.loading ? 'Testing...' : 'Test User Creation'}
          </button>
          
          {testResults && (
            <div className={`mt-4 p-4 rounded-md ${
              testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p><strong>Result:</strong> {testResults.message || testResults.error}</p>
              {testResults.data && (
                <p><strong>Test Email:</strong> {testResults.data.email}</p>
              )}
            </div>
          )}
        </div>

        {/* Current User */}
        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Role:</strong> {user.profile.role}</p>
              <p><strong>Full Name:</strong> {user.profile.full_name || 'Not set'}</p>
              <p><strong>Phone:</strong> {user.profile.phone || 'Not set'}</p>
              <p><strong>Created:</strong> {new Date(user.profile.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
            <p className="text-gray-600 mb-4">No user is currently signed in. Use the test user creation above to create a test account.</p>
          </div>
        )}
      </div>
    </div>
  )
}
