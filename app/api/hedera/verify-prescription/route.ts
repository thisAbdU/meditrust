import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionVerification } from '@/lib/hedera'

export async function POST(request: NextRequest) {
  try {
    const { prescriptionId, transactionHash } = await request.json()
    
    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying prescription on Hedera blockchain...')
    console.log('Prescription ID:', prescriptionId)
    console.log('Transaction Hash:', transactionHash)

    const prescriptionVerification = new PrescriptionVerification()
    
    // Verify the prescription on blockchain
    let verificationResult
    if (transactionHash) {
      // Verify using transaction hash
      verificationResult = await prescriptionVerification.verifyTransaction(transactionHash)
    } else {
      // Verify using prescription ID (fallback)
      verificationResult = await prescriptionVerification.verifyPrescription(prescriptionId)
    }

    if (!verificationResult.success) {
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Prescription not found on blockchain',
        error: verificationResult.message
      })
    }

    console.log('✅ Prescription verified successfully')
    console.log('Verification result:', verificationResult)

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Prescription verified on blockchain',
      prescriptionData: verificationResult.prescriptionData,
      transactionDetails: verificationResult.transactionDetails,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Failed to verify prescription:', error)
    return NextResponse.json(
      { 
        success: false,
        verified: false,
        error: error.message || 'Failed to verify prescription on blockchain' 
      },
      { status: 500 }
    )
  }
}
