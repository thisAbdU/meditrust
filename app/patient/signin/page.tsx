"use client"

import PatientSignIn from "@/components/auth/PatientSignIn"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        <PatientSignIn />
      </div>
    </div>
  )
}


