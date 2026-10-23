import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Change your login and password. Login is your email.</p>
      </div>
      <SettingsForm email={session.user.email} />
    </div>
  );
}
