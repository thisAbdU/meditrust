import { NextRequest, NextResponse } from 'next/server'
import { PrescriptionVerification } from '@/lib/hedera'
import { NotificationService } from '@/lib/notifications/notification-service'

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

    // Send notifications to patient
    const notificationService = new NotificationService()
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${prescriptionData.prescriptionId}`
    
    // Generate QR code for notifications
    const { PrescriptionUtils } = await import('@/lib/hedera')
    const prescriptionUtils = new PrescriptionUtils()
    const qrCodeUrl = await prescriptionUtils.generateQRCode(
      result.transactionHash || '',
      prescriptionData.prescriptionId
    )

    const notificationData = {
      prescriptionId: prescriptionData.prescriptionId,
      patientName: prescriptionData.patientName,
      patientPhone: prescriptionData.patientPhone,
      patientEmail: prescriptionData.patientEmail,
      doctorName: 'Dr. Smith', // In real app, get from auth context
      medicationName: prescriptionData.medicationName,
      dosage: prescriptionData.dosage,
      duration: prescriptionData.duration,
      instructions: prescriptionData.instructions,
      qrCodeUrl: qrCodeUrl,
      transactionHash: result.transactionHash || '',
      verificationUrl
    }

    // Send notifications (SMS and Email)
    console.log('📬 Sending notifications to patient...')
    const notificationResults = await notificationService.sendPrescriptionNotifications(notificationData)
    
    console.log('📬 Notification results:', notificationResults)

    return NextResponse.json({
      ...result,
      notifications: notificationResults
    })
  } catch (error: any) {
    console.error('❌ Failed to record prescription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record prescription on blockchain' },
      { status: 500 }
    )
  }
}
