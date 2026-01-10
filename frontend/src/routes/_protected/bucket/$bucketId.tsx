import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getBudget, listTransactions } from '../../../server'
import { Button, Card, Input } from '../../../components/ui'
import { ColorPicker } from '../../../components/ColorPicker'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/bucket/$bucketId')({
  loader: async ({ params }) => {
    const [bucket, transactionsData] = await Promise.all([
      getBudget({ data: { bucketId: params.bucketId } }),
      listTransactions({ data: { limit: 100, offset: 0 } }),
    ])
    return { bucket, transactions: transactionsData.transactions }
  },
  component: BucketDetailPage,
  ssr: true,
})

function BucketDetailPage() {
  const { bucket, transactions } = Route.useLoaderData()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [color, setColor] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when bucket data loads
  if (bucket && !name && !monthlyLimit && !color) {
    setName(bucket.name)
    setMonthlyLimit(bucket.monthly_limit.toString())
    setColor(bucket.color)
  }

  const handleSave = () => {
    alert('Save functionality to be implemented')
  }

  const handleCancel = () => {
    if (bucket) {
      setName(bucket.name)
      setMonthlyLimit(bucket.monthly_limit.toString())
      setColor(bucket.color)
    }
    setIsEditing(false)
    setErrors({})
  }

  if (!bucket) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="text-red-600">Bucket not found</div>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{bucket.name}</h1>
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            {/* Recent Transactions */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.transaction_id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No transactions this month</p>
              )}
            </Card>

            {/* Edit Button */}
            <Button onClick={() => setIsEditing(true)} fullWidth>
              Edit Bucket
            </Button>
          </div>
        ) : (
          /* Edit Form */
          (<Card>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Bucket Settings</h3>
            <div className="space-y-6">
              <Input
                label="Bucket Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="e.g., Food, Entertainment"
              />

              <Input
                label="Monthly Limit"
                type="number"
                step="0.01"
                min="0"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                error={errors.monthlyLimit}
                placeholder="e.g., 500.00"
              />

              <ColorPicker label="Bucket Color" value={color} onChange={setColor} />

              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  fullWidth
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>)
        )}
      </div>
    </div>
  )
}
