import { createClient } from './client'
import { UserProfile, CompleteUserProfile, SignUpData, SignInData, AuthUser } from './types'

const supabase = createClient()

export class SupabaseAuthService {
  // Sign up with role-based profile creation
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role
          }
        }
      })

      if (authError) {
        return { data: null, error: authError }
      }

      // The user profile will be automatically created by the database trigger
      return { data: authData, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // Sign in
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      return { data: authData, error }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  // Get current user with complete profile
  async getCurrentUser(): Promise<{ user: AuthUser | null, error: any }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        return { user: null, error: authError }
      }

      // Get user profile with role-specific data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          doctor_profile:doctor_profiles(*),
          patient_profile:patient_profiles(*),
          pharmacist_profile:pharmacist_profiles(*)
        `)
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        return { user: null, error: profileError }
      }

      const completeUser: AuthUser = {
        id: authUser.id,
        email: authUser.email!,
        role: profile.role,
        profile: profile as CompleteUserProfile
      }

      return { user: completeUser, error: null }
    } catch (error: any) {
      return { user: null, error: { message: error.message } }
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      return { data, error }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // Create role-specific profile
  async createRoleProfile(role: 'doctor' | 'patient' | 'pharmacist', profileData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
      }

      const tableName = `${role}_profiles`
      const { data, error } = await supabase
        .from(tableName)
        .insert({ id: user.id, ...profileData })
        .select()
        .single()

      return { data, error }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Get session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      return { data, error }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService()

// Server-side auth utilities (commented out for now to avoid build issues)
// export class ServerAuthService {
//   static async getCurrentUser() {
//     try {
//       const supabase = createServerClient()
//       const { data: { user }, error } = await supabase.auth.getUser()
//       return { user, error }
//     } catch (error: any) {
//       return { user: null, error: { message: error.message } }
//     }
//   }

//   static async getUserProfile(userId: string) {
//     try {
//       const supabase = createServerClient()
//       const { data, error } = await supabase
//         .from('user_profiles')
//         .select(`
//           *,
//           doctor_profile:doctor_profiles(*),
//           patient_profile:patient_profiles(*),
//           pharmacist_profile:pharmacist_profiles(*)
//         `)
//         .eq('id', userId)
//         .single()

//       return { data, error }
//     } catch (error: any) {
//       return { data: null, error: { message: error.message } }
//     }
//   }
// }
