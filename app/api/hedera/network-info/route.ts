import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const networkInfo = {
      network: process.env.HEDERA_NETWORK || 'testnet',
      operatorId: process.env.HEDERA_OPERATOR_ID || 'Not set',
      hasOperatorKey: !!process.env.HEDERA_OPERATOR_KEY,
      hasAccountId: !!process.env.HEDERA_ACCOUNT_ID,
      hasPrivateKey: !!process.env.HEDERA_PRIVATE_KEY
    }

    return NextResponse.json(networkInfo)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get network info' },
      { status: 500 }
    )
  }
}
