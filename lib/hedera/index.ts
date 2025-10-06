// Hedera SDK exports and utilities
import { AccountId, PrivateKey } from '@hashgraph/sdk'
export { createHederaClient, getDefaultClient, createAccountClient } from './client'
export { HederaAccount } from './account'
export { PrescriptionContract, PrescriptionVerification } from './contracts'
export { PrescriptionUtils, type PrescriptionData, type BlockchainPrescriptionRecord, type QRCodeData } from './prescription-utils'

// Network types
export type { HederaNetwork } from './client'

// Utility functions
export const HederaUtils = {
  // Convert account ID string to AccountId object
  parseAccountId: (accountId: string) => {
    try {
      return AccountId.fromString(accountId)
    } catch (error) {
      throw new Error(`Invalid account ID format: ${accountId}`)
    }
  },

  // Convert private key string to PrivateKey object
  parsePrivateKey: (privateKey: string) => {
    try {
      return PrivateKey.fromString(privateKey)
    } catch (error) {
      throw new Error(`Invalid private key format`)
    }
  },

  // Validate Hedera account ID format
  isValidAccountId: (accountId: string) => {
    const regex = /^\d+\.\d+\.\d+$/
    return regex.test(accountId)
  },

  // Get network info
  getNetworkInfo: () => {
    return {
      network: process.env.HEDERA_NETWORK || 'testnet',
      operatorId: process.env.HEDERA_OPERATOR_ID || 'Not set',
      hasOperatorKey: !!process.env.HEDERA_OPERATOR_KEY
    }
  }
}
