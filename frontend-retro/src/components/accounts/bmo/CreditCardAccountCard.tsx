import { Account, Transaction } from '../../../types';
import { Card } from '../../ui/Card';

interface CreditCardAccountCardProps {
  account: Account;
  transactions?: Transaction[];
  onClick?: () => void;
}

export function CreditCardAccountCard({ account, transactions, onClick }: CreditCardAccountCardProps) {
  // Calculate total spent from transactions (sum of negative amounts)
  const totalSpent = transactions?.reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0) || 0;

  return (
    <Card className="cursor-pointer shadow-md hover:shadow-lg" onClick={onClick}>
      <h3 className="text-lg sm:text-xl font-medium text-black mb-2">
        {account.name}
      </h3>
      <p className="text-sm text-black mb-4">
        {account.bank?.toUpperCase()} • {account.type} •••• {account.mask}
      </p>
      <div className="border-t border-black pt-4">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-black">Total Spent</dt>
            <dd className="text-sm font-medium text-red-600">
              ${totalSpent.toFixed(2)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-black">Available Balance</dt>
            <dd className="text-sm font-medium text-black">
              ${account.available_balance?.toFixed(2) || '0.00'}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
