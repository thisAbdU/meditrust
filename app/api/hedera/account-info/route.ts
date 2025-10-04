import { NextRequest, NextResponse } from 'next/server'
import { HederaAccount } from '@/lib/hedera'

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json()
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const account = new HederaAccount(accountId)
    const accountInfo = await account.getAccountInfo()

    return NextResponse.json(accountInfo)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get account info' },
      { status: 500 }
    )
  }
}
