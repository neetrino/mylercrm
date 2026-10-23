'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { District } from '@prisma/client';
import { BuildingFloorPlans } from './BuildingFloorPlans';
import type { BuildingWithDistrict } from './buildingFormTypes';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useCloseOnEscape } from '@/components/ui/useCloseOnEscape';

type BuildingFormProps = {
  building: BuildingWithDistrict | null;
  districts: District[];
  onClose?: () => void;
  onSuccess?: () => void;
  standalone?: boolean;
};

export default function BuildingForm({
  building,
  districts,
  onClose,
  onSuccess,
  standalone = false,
}: BuildingFormProps) {
  const router = useRouter();
  const handleSuccess = () => {
    if (standalone) router.push('/admin/buildings');
    else onSuccess?.();
  };
  const handleClose = () => {
    if (standalone) router.push('/admin/buildings');
    else onClose?.();
  };
  const [districtId, setDistrictId] = useState<number>(districts[0]?.id || 0);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [floorsCount, setFloorsCount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullBuilding, setFullBuilding] = useState<BuildingWithDistrict | null>(null);
  useEffect(() => {
    if (building) {
      setDistrictId(building.districtId);
      setName(building.name);
      setSlug(building.slug);
      setFloorsCount(building.floorsCount ?? '');
      setFullBuilding(building);
      if (building.id) {
        fetch(`/api/buildings/${building.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data) {
              setFullBuilding(data);
              if (data.floorsCount != null) setFloorsCount(data.floorsCount);
            }
          })
          .catch(() => {});
      }
    } else if (districts.length > 0) {
      setDistrictId(districts[0].id);
      setFloorsCount('');
      setFullBuilding(null);
    }
  }, [building, districts]);
  useCloseOnEscape(handleClose, !standalone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = building ? `/api/buildings/${building.id}` : '/api/buildings';
      const method = building ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { districtId, name, slug };
      if (building) {
        body.floorsCount = floorsCount === '' ? null : Number(floorsCount);
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      const updated = await response.json();
      if (building && updated.floorPlans) setFullBuilding(updated);
      handleSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const floorPlans = fullBuilding?.floorPlans ?? [];
  const floorsNum = floorsCount === '' ? 0 : Math.max(0, Number(floorsCount));
  const handleNameChange = (value: string) => {
    setName(value);
    if (!building) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setSlug(autoSlug);
    }
  };

  const formContent = (
    <div className={standalone ? 'card w-full max-w-5xl p-6 sm:p-8' : 'card w-full max-w-md p-6'}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {building ? 'Edit Building' : 'Create Building'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {building ? 'Update building information' : 'Add a new building'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              District *
            </label>
            <DropdownSelect
              value={String(districtId || '')}
              onChange={(next) => setDistrictId(Number(next))}
              options={districts.map((district) => ({ value: String(district.id), label: district.name }))}
              placeholder="District"
              ariaLabel="District"
              disabled={!!building}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="input-field"
              placeholder="Building 1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9\-]+"
              className="input-field"
              placeholder="tower-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {building && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Number of floors
              </label>
              <input
                type="number"
                min={0}
                value={floorsCount}
                onChange={(e) =>
                  setFloorsCount(e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0)
                }
                className="input-field"
                placeholder="e.g. 8"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for Floor plan view: attach one plan image per floor below.
              </p>
            </div>
          )}

          {building && floorsNum > 0 && (
            <BuildingFloorPlans
              buildingId={building.id}
              floorsNum={floorsNum}
              floorPlans={floorPlans}
              onUpdated={setFullBuilding}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            {standalone ? (
              <Link href="/admin/buildings" className="btn-secondary">
                Cancel
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : building ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
  );

  if (standalone) {
    return (
      <div>
        <Link
          href="/admin/buildings"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Buildings
        </Link>
        {formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="flex min-h-full items-center justify-center">
        {formContent}
      </div>
    </div>
  );
}

