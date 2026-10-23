import { UserPlus } from 'lucide-react';

type UsersToolbarProps = {
  onAdd: () => void;
};

export function UsersToolbar({ onAdd }: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-500">
          One account for the CRM and the 3D viewer. Disabling a user turns login off.
        </p>
      </div>
      <button type="button" onClick={onAdd} className="btn-primary inline-flex h-10 items-center gap-2 rounded-xl shadow-sm">
        <UserPlus className="h-4 w-4" />
        Add user
      </button>
    </div>
  );
}
