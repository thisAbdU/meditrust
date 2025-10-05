import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionVerification } from '@/lib/hedera'

export async function POST(request: NextRequest) {
  try {
    const prescriptionData = await request.json()
    
    if (!prescriptionData.prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    console.log('🔗 Recording prescription on Hedera blockchain...')
    console.log('Prescription ID:', prescriptionData.prescriptionId)

    const prescriptionVerification = new PrescriptionVerification()
    const result = await prescriptionVerification.createPrescriptionRecord(prescriptionData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    console.log('✅ Prescription recorded successfully')
    console.log('Transaction ID:', result.transactionHash)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Failed to record prescription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record prescription on blockchain' },
      { status: 500 }
    )
  }
}
