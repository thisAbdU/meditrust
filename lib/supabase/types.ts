// MediTrust Supabase Database Types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: 'doctor' | 'patient' | 'pharmacist'
  phone?: string
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: string
  license_number: string
  specialization?: string
  hospital_affiliation?: string
  years_of_experience?: number
  created_at: string
  updated_at: string
}

export interface PatientProfile {
  id: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_history?: string
  allergies?: string
  created_at: string
  updated_at: string
}

export interface PharmacistProfile {
  id: string
  license_number: string
  pharmacy_name: string
  pharmacy_address?: string
  pharmacy_phone?: string
  years_of_experience?: number
  created_at: string
  updated_at: string
}

export interface CompleteUserProfile extends UserProfile {
  doctor_profile?: DoctorProfile
  patient_profile?: PatientProfile
  pharmacist_profile?: PharmacistProfile
}

// Auth helper types
export interface SignUpData {
  email: string
  password: string
  full_name: string
  role: 'doctor' | 'patient' | 'pharmacist'
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  role: 'doctor' | 'patient' | 'pharmacist'
  profile: CompleteUserProfile
}
