import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DistrictsList from '@/components/districts/DistrictsList';

export default async function DistrictsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/apartments');
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="page-kicker">Catalog</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Districts</h1>
        </div>
      </div>
      <DistrictsList />
    </div>
  );
}
