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
  
  // Set operator if credentials are provided
  if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID)
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
    
    client.setOperator(operatorId, operatorKey)
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
