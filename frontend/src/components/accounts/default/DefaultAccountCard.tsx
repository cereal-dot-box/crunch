import { Account } from '../../../types';
import { Card } from '../../ui/Card';

interface DefaultAccountCardProps {
  account: Account;
  onClick?: () => void;
}

export function DefaultAccountCard({ account, onClick }: DefaultAccountCardProps) {
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
            <dt className="text-sm text-gray-500">Current Balance</dt>
            <dd className="text-sm font-medium text-gray-900">
              ${account.current_balance?.toFixed(2) || '0.00'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Available Balance</dt>
            <dd className="text-sm font-medium text-gray-900">
              ${account.available_balance?.toFixed(2) || '0.00'}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
