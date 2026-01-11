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
            <dt className="text-sm text-black">Incoming</dt>
            <dd className="text-sm font-medium text-emerald-600">
              ${incoming.toFixed(2)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-black">Outgoing</dt>
            <dd className="text-sm font-medium text-red-600">
              ${outgoing.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
