import { 
  ContractId, 
  ContractCreateFlow, 
  ContractExecuteTransaction, 
  ContractCallQuery,
  FileCreateTransaction,
  FileId,
  Hbar,
  TransactionRecordQuery
} from '@hashgraph/sdk'
import { getDefaultClient } from './client'

// Smart contract foundation for prescription verification
export class PrescriptionContract {
  private client: any
  
  constructor(public contractId?: string) {
    // Initialize client lazily to avoid SSR issues
    this.client = null
  }

  // Deploy prescription verification contract (foundation)
  async deployContract(bytecode: string, constructorParams?: any[]) {
    // This will be implemented when we have the actual smart contract
    throw new Error('Contract deployment requires smart contract bytecode - to be implemented')
  }

  // Execute contract function (foundation)
  async executeFunction(functionName: string, params?: any[]) {
    if (!this.contractId) {
      throw new Error('Contract ID not set')
    }

    try {
      const contractId = ContractId.fromString(this.contractId)
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunction(functionName, params || [])
        .setGas(100000)

      const response = await transaction.execute(this.client)
      return response
    } catch (error) {
      throw new Error(`Failed to execute contract function: ${error}`)
    }
  }

  // Query contract state (foundation)
  async queryContract(functionName: string, params?: any[]) {
    if (!this.contractId) {
      throw new Error('Contract ID not set')
    }

    try {
      const contractId = ContractId.fromString(this.contractId)
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setFunction(functionName, params || [])
        .setGas(100000)

      const response = await query.execute(this.client)
      return response
    } catch (error) {
      throw new Error(`Failed to query contract: ${error}`)
    }
  }
}

// Prescription verification functions (foundation)
export class PrescriptionVerification {
  private contract: PrescriptionContract

  constructor(contractId?: string) {
    this.contract = new PrescriptionContract(contractId)
  }

  // Verify prescription authenticity (foundation)
  async verifyPrescription(prescriptionId: string, doctorId: string, patientId: string) {
    // This will be implemented with actual smart contract
    return {
      isValid: false,
      message: 'Smart contract verification not yet implemented',
      prescriptionId,
      doctorId,
      patientId,
      timestamp: new Date().toISOString()
    }
  }

  // Create prescription record (REAL Hedera blockchain implementation)
  async createPrescriptionRecord(prescriptionData: {
    prescriptionId: string
    patientId: string
    doctorId: string
    patientName: string
    medicationName: string
    dosage: string
    duration: string
    instructions: string
    doctorNotes: string
  }) {
    try {
      console.log('🔗 Creating REAL Hedera transaction...')
      
      // Initialize client if not already done
      if (!this.client) {
        try {
          this.client = getDefaultClient()
          if (!this.client) {
            throw new Error('Failed to initialize Hedera client')
          }
          console.log('✅ Hedera client initialized')
          
          // Verify operator is set after initialization
          if (!this.client.operatorPublicKey) {
            console.error('❌ Operator not set after client initialization')
            console.error('Available environment variables:')
            console.error('HEDERA_OPERATOR_ID:', process.env.HEDERA_OPERATOR_ID)
            console.error('HEDERA_OPERATOR_KEY:', process.env.HEDERA_OPERATOR_KEY ? 'Set' : 'Not set')
            
            // Try to manually set operator if credentials are available
            if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
              console.log('🔄 Attempting to manually set operator...')
              const { AccountId, PrivateKey } = await import('@hashgraph/sdk')
              const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID)
              const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
              this.client.setOperator(operatorId, operatorKey)
              console.log('✅ Operator set manually')
            }
          }
        } catch (error) {
          console.error('Failed to initialize Hedera client:', error)
          throw new Error('Hedera client initialization failed')
        }
      }
      
      // Check if operator is set
      if (!this.client.operatorPublicKey) {
        console.error('❌ Hedera operator not configured')
        console.error('Client operatorPublicKey:', this.client.operatorPublicKey)
        console.error('Client operatorId:', this.client.operatorId)
        throw new Error('Hedera operator not configured. Please check your environment variables (HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY).')
      }
      
      console.log('✅ Client and operator verified')
      
      // Create a file transaction to store prescription data on Hedera
      const fileCreateTransaction = new FileCreateTransaction()
        .setKeys([this.client.operatorPublicKey])
        .setContents(JSON.stringify(prescriptionData))
        .setMaxTransactionFee(new Hbar(5))

      // Execute the transaction on Hedera blockchain
      console.log('📝 Executing transaction on Hedera blockchain...')
      const response = await fileCreateTransaction.execute(this.client)
      
      // Get the receipt to confirm the transaction
      console.log('⏳ Waiting for transaction confirmation...')
      const receipt = await response.getReceipt(this.client)
      
      if (!receipt.fileId) {
        throw new Error('Failed to create file on Hedera blockchain')
      }

      // Get the real transaction ID and hash
      const transactionId = response.transactionId.toString()
      const transactionHash = response.transactionId.toString()
      
      console.log('✅ Transaction successful!')
      console.log('📄 File ID:', receipt.fileId.toString())
      console.log('🔗 Transaction ID:', transactionId)
      
      return {
        success: true,
        message: 'Prescription successfully recorded on Hedera blockchain',
        prescriptionData,
        transactionHash,
        transactionId,
        fileId: receipt.fileId.toString(),
        timestamp: new Date().toISOString(),
        network: process.env.HEDERA_NETWORK || 'testnet'
      }
    } catch (error: any) {
      console.error('❌ Hedera transaction failed:', error)
      return {
        success: false,
        message: `Failed to record prescription on blockchain: ${error.message}`,
        prescriptionData,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }

  // Verify transaction exists on Hedera blockchain
  async verifyTransaction(transactionId: string) {
    try {
      console.log('🔍 Verifying transaction on Hedera blockchain...')
      
      // Initialize client if not already done
      if (!this.client) {
        try {
          this.client = getDefaultClient()
          if (!this.client) {
            throw new Error('Failed to initialize Hedera client')
          }
        } catch (error) {
          console.error('Failed to initialize Hedera client:', error)
          throw new Error('Hedera client initialization failed')
        }
      }
      
      const query = new TransactionRecordQuery()
        .setTransactionId(transactionId)
      
      const record = await query.execute(this.client)
      
      return {
        success: true,
        exists: true,
        transactionId: record.transactionId.toString(),
        status: record.status,
        timestamp: record.consensusTimestamp,
        message: 'Transaction verified on Hedera blockchain'
      }
    } catch (error: any) {
      return {
        success: false,
        exists: false,
        message: `Transaction not found: ${error.message}`,
        error: error.message
      }
    }
  }

  // Get prescription history (foundation)
  async getPrescriptionHistory(patientId: string) {
    // This will be implemented with actual smart contract
    return {
      prescriptions: [],
      message: 'Smart contract query not yet implemented',
      patientId,
      timestamp: new Date().toISOString()
    }
  }
}
