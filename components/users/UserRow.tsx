import { Pencil, UserX, UserCheck } from 'lucide-react';
import { roleLabel, userInitials } from './userDisplay';
import type { PublicUser } from './userTypes';

type UserRowProps = {
  user: PublicUser;
  isSelf: boolean;
  onEdit: (user: PublicUser) => void;
  onStatus: () => void;
};

function UserRowActions({ user, disableSelf, onEdit, onStatus }: Omit<UserRowProps, 'isSelf'> & { disableSelf: boolean }) {
  const active = user.status === 'ACTIVE';
  const admin = user.role === 'ADMIN';
  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${admin ? 'border-indigo-100 bg-indigo-50 text-indigo-700' : 'border-sky-100 bg-sky-50 text-sky-700'}`}>
        {roleLabel(user.role)}
      </span>
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${active ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {active ? 'Active' : 'Disabled'}
      </span>
      <button type="button" onClick={() => onEdit(user)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={onStatus}
        disabled={disableSelf}
        title={disableSelf ? 'You cannot disable your own account' : undefined}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-40 ${
          active
            ? 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }`}
      >
        {active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
        {active ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}

export function UserRow({ user, isSelf, onEdit, onStatus }: UserRowProps) {
  const admin = user.role === 'ADMIN';
  return (
    <li className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${admin ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
          {userInitials(user.email)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {user.email}
            {isSelf ? <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">You</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{admin ? 'Full access' : 'Sales access'}</p>
        </div>
      </div>
      <UserRowActions user={user} disableSelf={isSelf && user.status === 'ACTIVE'} onEdit={onEdit} onStatus={onStatus} />
    </li>
  );
}
