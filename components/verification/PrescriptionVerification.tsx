'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCodeIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface VerificationResult {
  isValid: boolean
  prescriptionId: string
  patientName: string
  medicationName: string
  dosage: string
  doctorName: string
  issueDate: string
  status: string
  error?: string
}

export default function PrescriptionVerification() {
  const [verificationMode, setVerificationMode] = useState<'qr' | 'manual' | 'upload'>('qr')
  const [manualId, setManualId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock QR scanner simulation
  const [isScanning, setIsScanning] = useState(false)

  const handleQRScan = () => {
    setIsScanning(true)
    setError('')
    setResult(null)
    
    // Simulate QR scanning process
    setTimeout(() => {
      setIsScanning(false)
      // Mock QR code data - in real app, this would come from camera
      const mockQRData = 'https://meditrust.verify/rx/RX1703123456ABC'
      verifyPrescription(mockQRData)
    }, 2000)
  }

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualId.trim()) {
      setError('Please enter a prescription ID')
      return
    }
    
    setError('')
    setResult(null)
    await verifyPrescription(manualId.trim())
  }

  const verifyPrescription = async (prescriptionId: string) => {
    setIsVerifying(true)
    setError('')
    setResult(null)

    try {
      // Simulate blockchain verification (3 seconds max as per requirements)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)) // 1-3 seconds
      
      // Mock verification logic
      const mockPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      const prescription = mockPrescriptions.find((p: any) => 
        p.id === prescriptionId || p.qrCode === prescriptionId
      )

      if (prescription) {
        // Valid prescription found
        setResult({
          isValid: true,
          prescriptionId: prescription.id,
          patientName: prescription.patientName,
          medicationName: prescription.medicationName,
          dosage: prescription.dosage,
          doctorName: 'Dr. John Smith', // Mock doctor name
          issueDate: new Date(prescription.timestamp).toLocaleDateString(),
          status: 'verified'
        })

        // Store verification in history
        const verificationHistory = JSON.parse(localStorage.getItem('verificationHistory') || '[]')
        verificationHistory.unshift({
          id: Date.now().toString(),
          prescriptionId: prescription.id,
          patientName: prescription.patientName,
          medicationName: prescription.medicationName,
          verifiedAt: new Date().toISOString(),
          isValid: true
        })
        localStorage.setItem('verificationHistory', JSON.stringify(verificationHistory.slice(0, 50))) // Keep last 50

      } else {
        // Invalid prescription
        setResult({
          isValid: false,
          prescriptionId: prescriptionId,
          patientName: '',
          medicationName: '',
          dosage: '',
          doctorName: '',
          issueDate: '',
          status: 'not_found',
          error: 'Prescription not found in blockchain records'
        })

        // Store failed verification
        const verificationHistory = JSON.parse(localStorage.getItem('verificationHistory') || '[]')
        verificationHistory.unshift({
          id: Date.now().toString(),
          prescriptionId: prescriptionId,
          patientName: '',
          medicationName: '',
          verifiedAt: new Date().toISOString(),
          isValid: false,
          error: 'Prescription not found'
        })
        localStorage.setItem('verificationHistory', JSON.stringify(verificationHistory.slice(0, 50)))
      }

    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setUploadedImage(imageData)
      setError('')
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const processUploadedImage = async () => {
    if (!uploadedImage) return

    setIsProcessingImage(true)
    setError('')
    setResult(null)

    try {
      // Simulate image processing and QR code extraction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock QR code extraction from image
      // In a real app, this would use a QR code library to extract the code from the image
      const mockExtractedQR = 'https://meditrust.verify/rx/RX1703123456ABC'
      
      await verifyPrescription(mockExtractedQR)
    } catch (error) {
      setError('Failed to process image. Please try again.')
    } finally {
      setIsProcessingImage(false)
    }
  }

  const resetVerification = () => {
    setResult(null)
    setError('')
    setManualId('')
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F7F5F3] px-6 py-4 border-b border-[#E0DEDB]">
          <h2 className="text-xl font-bold text-[#37322F]">Prescription Verification</h2>
          <p className="text-[#605A57] text-sm mt-1">Scan QR code, upload image, or enter prescription ID to verify authenticity</p>
        </div>

        <div className="p-6">
          {/* Mode Selection */}
          <div className="flex space-x-1 bg-[#F7F5F3] p-1 rounded-lg mb-6">
            <button
              onClick={() => {
                setVerificationMode('qr')
                resetVerification()
              }}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                verificationMode === 'qr'
                  ? 'bg-white text-[#37322F] shadow-sm'
                  : 'text-[#605A57] hover:text-[#37322F]'
              }`}
            >
              <QrCodeIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">QR Scan</span>
            </button>
            <button
              onClick={() => {
                setVerificationMode('upload')
                resetVerification()
              }}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                verificationMode === 'upload'
                  ? 'bg-white text-[#37322F] shadow-sm'
                  : 'text-[#605A57] hover:text-[#37322F]'
              }`}
            >
              <PhotoIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Upload Image</span>
            </button>
            <button
              onClick={() => {
                setVerificationMode('manual')
                resetVerification()
              }}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                verificationMode === 'manual'
                  ? 'bg-white text-[#37322F] shadow-sm'
                  : 'text-[#605A57] hover:text-[#37322F]'
              }`}
            >
              <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Manual Entry</span>
            </button>
          </div>

          {/* QR Code Scanner */}
          {verificationMode === 'qr' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-64 h-64 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto mb-2"></div>
                      <p className="text-sm text-[#605A57]">Scanning QR Code...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-[#605A57]">QR Code Scanner</p>
                      <p className="text-xs text-[#605A57] mt-1">Click to start scanning</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleQRScan}
                  disabled={isScanning || isVerifying}
                  className="px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? 'Scanning...' : 'Start QR Scan'}
                </button>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {verificationMode === 'upload' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-[#37322F] mb-2">
                  Upload QR Code Image
                </label>
                <div className="border-2 border-dashed border-[#E0DEDB] rounded-lg p-6 text-center hover:border-[#37322F] transition-colors">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded QR Code" 
                        className="max-w-full max-h-64 mx-auto rounded-lg border border-[#E0DEDB]"
                      />
                      <p className="text-sm text-[#605A57]">Image uploaded successfully</p>
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={processUploadedImage}
                          disabled={isProcessingImage}
                          className="px-4 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessingImage ? 'Processing...' : 'Extract & Verify QR Code'}
                        </button>
                        <button
                          onClick={() => {
                            setUploadedImage(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="px-4 py-2 border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3]"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <PhotoIcon className="w-12 h-12 text-[#605A57] mx-auto mb-4" />
                      <p className="text-sm text-[#37322F] font-medium mb-2">Upload QR Code Image</p>
                      <p className="text-xs text-[#605A57] mb-4">PNG, JPG, or JPEG up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522]"
                      >
                        Choose Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {verificationMode === 'manual' && (
            <form onSubmit={handleManualVerification} className="space-y-4">
              <div>
                <label htmlFor="prescriptionId" className="block text-sm font-medium text-[#37322F] mb-2">
                  Prescription ID
                </label>
                <input
                  id="prescriptionId"
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter prescription ID (e.g., RX1703123456ABC)"
                  className="w-full px-3 py-2 border border-[#E0DEDB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-[#37322F]"
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !manualId.trim()}
                className="w-full px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify Prescription'}
              </button>
            </form>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Verification Result */}
          {result && (
            <div className="mt-6">
              {result.isValid ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">✅ Verified</h3>
                      <p className="text-sm text-green-600">Prescription is authentic and valid</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Prescription ID</p>
                      <p className="text-sm text-green-600 font-mono">{result.prescriptionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Patient Name</p>
                      <p className="text-sm text-green-600">{result.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Medication</p>
                      <p className="text-sm text-green-600">{result.medicationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Dosage</p>
                      <p className="text-sm text-green-600">{result.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Doctor</p>
                      <p className="text-sm text-green-600">{result.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Issue Date</p>
                      <p className="text-sm text-green-600">{result.issueDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <XCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">❌ Not Verified</h3>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-700 font-medium mb-2">Prescription ID</p>
                    <p className="text-sm text-red-600 font-mono">{result.prescriptionId}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-center">
                <button
                  onClick={resetVerification}
                  className="px-4 py-2 border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors"
                >
                  Verify Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
