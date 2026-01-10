import { Account } from '../../../types';
import { Card } from '../../ui/Card';

interface RbcChequingAccountCardProps {
  account: Account;
  transactions?: any[];
  onClick?: () => void;
}

export function RbcChequingAccountCard({ account, transactions, onClick }: RbcChequingAccountCardProps) {
  // Calculate monthly summary (incoming, outgoing, saved)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }) || [];

  const incoming = currentMonthTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const outgoing = Math.abs(currentMonthTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]" onClick={onClick}>
      <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
        {account.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {account.bank?.toUpperCase()} • {account.type} •••• {account.mask}
      </p>
      <div className="border-t border-gray-200 pt-4">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Incoming</dt>
            <dd className="text-sm font-medium text-green-600">
              ${incoming.toFixed(2)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Outgoing</dt>
            <dd className="text-sm font-medium text-red-600">
              ${outgoing.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
