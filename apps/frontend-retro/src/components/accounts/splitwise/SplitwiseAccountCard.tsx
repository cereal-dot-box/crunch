import { Account, Transaction } from '../../../types';
import { Card } from '../../ui/Card';

interface SplitwiseAccountCardProps {
  account: Account;
  transactions?: Transaction[];
  onClick?: () => void;
}

export function SplitwiseAccountCard({ account, onClick }: SplitwiseAccountCardProps) {
  return (
    <Card className="cursor-pointer shadow-md hover:shadow-lg" onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg sm:text-xl font-medium text-black">
          {account.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></div>
        </div>
      </div>
      <p className="text-sm text-black mb-4">
        {account.bank?.toUpperCase()} • Expense Sharing
      </p>
      <div className="border-t border-black pt-4">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-black">Status</dt>
            <dd className="text-sm font-medium text-green-600">
              Connected
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-black">Type</dt>
            <dd className="text-sm font-medium text-black">
              Expense Tracking
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
