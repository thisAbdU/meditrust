import { AccountId, PrivateKey, AccountBalanceQuery, Hbar } from '@hashgraph/sdk'
import { getDefaultClient } from './client'

// Account management functions
export class HederaAccount {
  private client = getDefaultClient()
  
  constructor(
    public accountId: string,
    public privateKey?: string
  ) {}

  // Get account balance
  async getBalance(): Promise<Hbar> {
    try {
      const accountId = AccountId.fromString(this.accountId)
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(this.client)
      
      return balance.hbars
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`)
    }
  }

  // Get account info
  async getAccountInfo() {
    try {
      const accountId = AccountId.fromString(this.accountId)
      const balance = await this.getBalance()
      
      return {
        accountId: this.accountId,
        balance: balance.toString(),
        balanceTinybars: balance.toTinybars().toString(),
        network: process.env.HEDERA_NETWORK || 'testnet'
      }
    } catch (error) {
      throw new Error(`Failed to get account info: ${error}`)
    }
  }

  // Create new account (foundation for later)
  static async createAccount(initialBalance: number = 1000) {
    // This will be implemented when we have operator credentials
    throw new Error('Account creation requires operator credentials - to be implemented')
  }

  // Generate new key pair (foundation for later)
  static generateKeyPair() {
    const privateKey = PrivateKey.generateED25519()
    const publicKey = privateKey.publicKey
    
    return {
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
      accountId: 'Generated - needs to be created on network'
    }
  }
}
