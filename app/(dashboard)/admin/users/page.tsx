import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UsersList } from '@/components/users/UsersList';

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/apartments');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">Web and 3D use the same accounts. Disable turns off login.</p>
      </div>
      <UsersList currentUserId={session.user.id} />
    </div>
  );
}
