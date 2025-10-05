import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionVerification } from '@/lib/hedera'

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const prescriptionVerification = new PrescriptionVerification()
    const result = await prescriptionVerification.verifyTransaction(transactionId)

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify transaction' },
      { status: 500 }
    )
  }
}
