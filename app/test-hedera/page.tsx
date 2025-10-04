'use client'

import { useState, useEffect } from 'react'
import { HederaAccount, HederaUtils } from '@/lib/hedera'

export default function TestHedera() {
  const [accountId, setAccountId] = useState('')
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    // Get network info on component mount
    fetch('/api/hedera/network-info')
      .then(res => res.json())
      .then(data => setNetworkInfo(data))
      .catch(err => console.error('Failed to get network info:', err))
  }, [])

  const handleGetAccountInfo = async () => {
    if (!accountId.trim()) {
      setError('Please enter an account ID')
      return
    }

    if (!HederaUtils.isValidAccountId(accountId)) {
      setError('Invalid account ID format. Use format: 0.0.123456')
      return
    }

    setLoading(true)
    setError('')
    setAccountInfo(null)

    try {
      const response = await fetch('/api/hedera/account-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get account info')
      }

      const info = await response.json()
      setAccountInfo(info)
    } catch (err: any) {
      setError(err.message || 'Failed to get account information')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateKeyPair = () => {
    const keyPair = HederaAccount.generateKeyPair()
    setAccountInfo({
      ...accountInfo,
      generatedKeyPair: keyPair
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Hedera Connection Test
        </h1>
        
        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Network Configuration</h2>
          <div className="space-y-2">
            <p><strong>Network:</strong> {networkInfo?.network || 'Not set'}</p>
            <p><strong>Operator ID:</strong> {networkInfo?.operatorId || 'Not set'}</p>
            <p><strong>Operator Key:</strong> {networkInfo?.hasOperatorKey ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                Hedera Account ID (format: 0.0.123456)
              </label>
              <div className="flex space-x-2">
                <input
                  id="accountId"
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="0.0.123456"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleGetAccountInfo}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Info'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {accountInfo && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-800 mb-2">Account Details</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Account ID:</strong> {accountInfo.accountId}</p>
                  <p><strong>Balance:</strong> {accountInfo.balance}</p>
                  <p><strong>Balance (Tinybars):</strong> {accountInfo.balanceTinybars}</p>
                  <p><strong>Network:</strong> {accountInfo.network}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Generation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Pair Generation</h2>
          <p className="text-gray-600 mb-4">
            Generate a new key pair for testing (foundation for account creation)
          </p>
          
          <button
            onClick={handleGenerateKeyPair}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Generate Key Pair
          </button>

          {accountInfo?.generatedKeyPair && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Generated Key Pair</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Private Key:</strong>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {accountInfo.generatedKeyPair.privateKey}
                  </div>
                </div>
                <div>
                  <strong>Public Key:</strong>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {accountInfo.generatedKeyPair.publicKey}
                  </div>
                </div>
                <p><strong>Note:</strong> {accountInfo.generatedKeyPair.accountId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Foundation Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Foundation Status</h2>
          <div className="space-y-2">
            <p className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Hedera SDK installed and configured
            </p>
            <p className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Client configuration ready
            </p>
            <p className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Account management foundation
            </p>
            <p className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Smart contract foundation
            </p>
            <p className="flex items-center">
              <span className="text-yellow-500 mr-2">⚠️</span>
              Operator credentials needed for full functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
