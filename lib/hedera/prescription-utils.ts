import QRCode from 'qrcode'
import { PrescriptionVerification } from './contracts'

// Prescription data interface
export interface PrescriptionData {
  prescriptionId: string
  patientId: string
  doctorId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  doctorNotes: string
}

// Blockchain prescription record interface
export interface BlockchainPrescriptionRecord {
  success: boolean
  message: string
  prescriptionData: PrescriptionData
  transactionHash: string
  timestamp: string
  network: string
}

// QR code data interface
export interface QRCodeData {
  prescriptionId: string
  transactionHash: string
  verificationUrl: string
  timestamp: string
}

export class PrescriptionUtils {
  private prescriptionVerification: PrescriptionVerification

  constructor() {
    this.prescriptionVerification = new PrescriptionVerification()
  }

  // Generate unique prescription ID
  generatePrescriptionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `RX${timestamp}${random}`
  }

  // Create prescription hash for blockchain
  createPrescriptionHash(prescriptionData: PrescriptionData): string {
    const hashData = {
      patientId: prescriptionData.patientId,
      medicationName: prescriptionData.medicationName,
      dosage: prescriptionData.dosage,
      timestamp: Date.now()
    }
    
    // Simple hash function (in production, use crypto.createHash)
    const hashString = JSON.stringify(hashData)
    return btoa(hashString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
  }

  // Record prescription on Hedera blockchain
  async recordPrescriptionOnBlockchain(prescriptionData: PrescriptionData): Promise<BlockchainPrescriptionRecord> {
    try {
      const result = await this.prescriptionVerification.createPrescriptionRecord(prescriptionData)
      return result
    } catch (error) {
      throw new Error(`Failed to record prescription on blockchain: ${error}`)
    }
  }

  // Generate QR code with blockchain data
  async generateQRCode(transactionHash: string, prescriptionId: string): Promise<string> {
    try {
      const qrData: QRCodeData = {
        prescriptionId,
        transactionHash,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${prescriptionId}`,
        timestamp: new Date().toISOString()
      }

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return qrCodeDataUrl
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`)
    }
  }

  // Send prescription to patient via email/SMS (mock implementation)
  async sendPrescriptionToPatient(
    prescriptionData: PrescriptionData,
    qrCodeUrl: string,
    transactionHash: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Mock email/SMS sending
      console.log('Sending prescription to patient:', {
        email: prescriptionData.patientEmail,
        phone: prescriptionData.patientPhone,
        prescriptionId: prescriptionData.prescriptionId,
        transactionHash
      })

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        message: `Prescription sent to ${prescriptionData.patientEmail} and ${prescriptionData.patientPhone}`
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to send prescription: ${error}`
      }
    }
  }

  // Validate prescription data
  validatePrescriptionData(data: Partial<PrescriptionData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.patientName?.trim()) {
      errors.push('Patient name is required')
    }

    if (!data.patientId?.trim()) {
      errors.push('Patient ID is required')
    }

    if (!data.patientEmail?.trim()) {
      errors.push('Patient email is required')
    }

    if (!data.patientPhone?.trim()) {
      errors.push('Patient phone is required')
    }

    if (!data.medicationName?.trim()) {
      errors.push('Medication name is required')
    }

    if (!data.dosage?.trim()) {
      errors.push('Dosage is required')
    }

    if (!data.duration?.trim()) {
      errors.push('Duration is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

