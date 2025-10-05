import { Client, AccountId, PrivateKey } from '@hashgraph/sdk'

// Hedera network configuration
export const HEDERA_NETWORKS = {
  testnet: 'https://testnet.hashio.io/api',
  mainnet: 'https://mainnet.hashio.io/api',
  previewnet: 'https://previewnet.hashio.io/api'
} as const

export type HederaNetwork = keyof typeof HEDERA_NETWORKS

// Create Hedera client
export function createHederaClient(network: HederaNetwork = 'testnet') {
  const client = Client.forNetwork(network)
  
  // Debug environment variables
  console.log('🔍 Checking Hedera environment variables:')
  console.log('HEDERA_OPERATOR_ID:', process.env.HEDERA_OPERATOR_ID ? 'Set' : 'Not set')
  console.log('HEDERA_OPERATOR_KEY:', process.env.HEDERA_OPERATOR_KEY ? 'Set' : 'Not set')
  console.log('HEDERA_NETWORK:', process.env.HEDERA_NETWORK || 'testnet')
  
  // Set operator if credentials are provided
  if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
    try {
      const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID)
      const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
      
      client.setOperator(operatorId, operatorKey)
      console.log('✅ Hedera operator set successfully')
    } catch (error) {
      console.error('❌ Failed to set Hedera operator:', error)
      throw new Error(`Failed to set Hedera operator: ${error}`)
    }
  } else {
    console.warn('⚠️ Hedera operator credentials not found in environment variables')
  }
  
  return client
}

// Get default client based on environment
export function getDefaultClient() {
  const network = (process.env.HEDERA_NETWORK as HederaNetwork) || 'testnet'
  return createHederaClient(network)
}

// Create client for specific account
export function createAccountClient(accountId: string, privateKey: string, network: HederaNetwork = 'testnet') {
  const client = createHederaClient(network)
  const account = AccountId.fromString(accountId)
  const key = PrivateKey.fromString(privateKey)
  
  client.setOperator(account, key)
  return client
}
