"use client"

import PatientSignIn from "@/components/auth/PatientSignIn"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#37322F]">Patient Sign In</h1>
          <p className="text-[#605A57] mt-2">Access your secure account</p>
        </div>
        <PatientSignIn />
      </div>
    </div>
  )
}


