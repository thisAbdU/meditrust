import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionVerification } from '@/lib/hedera'

export async function POST(request: NextRequest) {
  try {
    const { prescriptionId, pharmacyData } = await request.json()
    
    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    if (!pharmacyData?.pharmacyId || !pharmacyData?.pharmacyName) {
      return NextResponse.json(
        { error: 'Pharmacy data is required' },
        { status: 400 }
      )
    }

    console.log('💊 Dispensing prescription on Hedera blockchain...')
    console.log('Prescription ID:', prescriptionId)
    console.log('Pharmacy Data:', pharmacyData)

    const prescriptionVerification = new PrescriptionVerification()
    const result = await prescriptionVerification.markPrescriptionDispensed(prescriptionId, pharmacyData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    console.log('✅ Prescription dispensed successfully')
    console.log('Transaction ID:', result.transactionHash)

    return NextResponse.json({
      success: true,
      message: 'Prescription successfully dispensed',
      prescriptionId: result.prescriptionId,
      status: result.status,
      pharmacyData: result.pharmacyData,
      transactionHash: result.transactionHash,
      transactionId: result.transactionId,
      fileId: result.fileId,
      timestamp: result.timestamp,
      network: result.network
    })
  } catch (error: any) {
    console.error('❌ Failed to dispense prescription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to dispense prescription on blockchain' },
      { status: 500 }
    )
  }
}
