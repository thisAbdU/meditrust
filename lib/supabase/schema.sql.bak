-- MediTrust Database Schema
-- This schema defines the database structure for the MediTrust platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient', 'pharmacist')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor-specific information
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT UNIQUE NOT NULL,
  specialization TEXT,
  hospital_affiliation TEXT,
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient-specific information
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacist-specific information
CREATE TABLE IF NOT EXISTS pharmacist_profiles (
  id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT UNIQUE NOT NULL,
  pharmacy_name TEXT NOT NULL,
  pharmacy_address TEXT,
  pharmacy_phone TEXT,
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacist_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for doctor_profiles
CREATE POLICY "Doctors can view their own profile" ON doctor_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can insert their own profile" ON doctor_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for patient_profiles
CREATE POLICY "Patients can view their own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update their own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for pharmacist_profiles
CREATE POLICY "Pharmacists can view their own profile" ON pharmacist_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Pharmacists can update their own profile" ON pharmacist_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Pharmacists can insert their own profile" ON pharmacist_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_doctor_profiles
  BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_patient_profiles
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_pharmacist_profiles
  BEFORE UPDATE ON pharmacist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
