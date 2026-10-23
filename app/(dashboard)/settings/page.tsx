import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-6">
      <SettingsForm email={session.user.email} />
    </div>
  );
}
