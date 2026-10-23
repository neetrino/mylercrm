import { roleLabel } from './userDisplay';
import type { PublicUser } from './userTypes';

type UserRowProps = {
  user: PublicUser;
  isSelf: boolean;
  onEdit: (user: PublicUser) => void;
  onStatus: () => void;
};

const ACTION = 'text-[13px] text-gray-500 transition-colors hover:text-gray-950 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300';

export function UserRow({ user, isSelf, onEdit, onStatus }: UserRowProps) {
  const active = user.status === 'ACTIVE';
  const disableSelf = isSelf && active;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70">
      <td className="px-4 py-3.5">
        <span className="text-[14px] font-medium text-gray-950">{user.email}</span>
        {isSelf ? <span className="ml-2 text-[13px] font-normal text-gray-400">you</span> : null}
      </td>
      <td className="px-4 py-3.5 text-[14px] text-gray-600">{roleLabel(user.role)}</td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-2 text-[14px] text-gray-700">
          <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <button type="button" onClick={() => onEdit(user)} className={ACTION}>Edit</button>
        <span className="mx-2 text-gray-300">·</span>
        <button
          type="button"
          onClick={onStatus}
          disabled={disableSelf}
          title={disableSelf ? 'You cannot disable your own account' : undefined}
          className={ACTION}
        >
          {active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  );
}
