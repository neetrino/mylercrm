'use client';

import Link from 'next/link';
import type { Building, District } from '@prisma/client';
import { ApartmentCardItem } from './ApartmentCardItem';
import type { ApartmentListRow } from './apartmentListTypes';

type ApartmentsFloorViewProps = {
  apartments: ApartmentListRow[];
  buildings: (Building & { district: District })[];
  isAdmin: boolean;
  handleStatusChange: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  setPreviewModalUrl: (url: string | null) => void;
  currentUserId: string;
};

export function ApartmentsFloorView({
  apartments,
  buildings,
  isAdmin,
  handleStatusChange,
  getStatusColor,
  setPreviewModalUrl,
  currentUserId,
}: ApartmentsFloorViewProps) {
          type GroupKey = string;
          const byBuilding: Record<GroupKey, ApartmentListRow[]> = {};
          apartments.forEach((apt) => {
            const key = `${apt.building.id}-${apt.building.district.name}-${apt.building.name}`;
            if (!byBuilding[key]) byBuilding[key] = [];
            byBuilding[key].push(apt);
          });
          const buildingEntries = Object.entries(byBuilding);
          return (
            <div className="space-y-10">
              {buildingEntries.map(([key, buildingApts]) => {
                const byFloor: Record<number | string, ApartmentListRow[]> = {};
                buildingApts.forEach((apt) => {
                  const f = apt.floor ?? '—';
                  const k = typeof f === 'number' ? f : '—';
                  if (!byFloor[k]) byFloor[k] = [];
                  byFloor[k].push(apt);
                });
                const floorNumbers = Object.keys(byFloor)
                  .map((k) => (k === '—' ? -Infinity : Number(k)))
                  .filter((n) => Number.isFinite(n))
                  .sort((a, b) => a - b);
                const unknownFloor = byFloor['—'];
                const sortedFloors = floorNumbers.filter((n) => n !== -Infinity);
                if (unknownFloor?.length) sortedFloors.push(-Infinity);
                const firstApt = buildingApts[0];
                const buildingLabel = firstApt
                  ? `${firstApt.building.district.name} — ${firstApt.building.name}`
                  : key;
                return (
                  <div key={key} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
                      <h2 className="text-lg font-semibold text-gray-900">{buildingLabel}</h2>
                      {isAdmin && firstApt ? (
                        <Link
                          href={`/admin/buildings/${firstApt.building.id}`}
                          className="btn-secondary shrink-0 text-sm"
                        >
                          Open
                        </Link>
                      ) : null}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {sortedFloors.map((floorNum) => {
                        const floorApts = byFloor[floorNum === -Infinity ? '—' : floorNum] ?? [];
                        const floorLabel = floorNum === -Infinity ? '—' : `Floor ${floorNum}`;
                        const buildingMeta = buildings.find((b) => b.id === firstApt.building.id) as (Building & { district: District; floorPlans?: { floor: number; fileUrl: string; fileName: string | null }[] }) | undefined;
                        const buildingFloorPlan = floorNum !== -Infinity ? buildingMeta?.floorPlans?.find((fp) => fp.floor === floorNum) : undefined;
                        // Floor view: only building-level plans (Buildings → Number of floors), not apartment FLOORPLAN attachments
                        const floorPlanUrl = buildingFloorPlan?.fileUrl;
                        const isPdf = floorPlanUrl?.toLowerCase().endsWith('.pdf');
                        return (
                          <div key={floorLabel} className="p-6">
                            <h3 className="mb-3 text-base font-medium text-gray-800">{floorLabel}</h3>
                            {floorPlanUrl && (
                              <div className="mb-4 flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 p-2">
                                <p className="mb-2 w-full text-xs font-medium uppercase text-gray-500">Floor plan</p>
                                <a
                                  href={floorPlanUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block max-h-[70vh] max-w-[70vw] rounded-lg"
                                >
                                  {isPdf ? (
                                    <div className="flex h-40 items-center justify-center gap-2 text-gray-600">
                                      <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      <span className="text-sm">PDF — open</span>
                                    </div>
                                  ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={floorPlanUrl}
                                      alt="Floor plan"
                                      className="max-h-[70vh] max-w-full w-auto object-contain"
                                    />
                                  )}
                                </a>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {floorApts.map((apt) => (
                                <ApartmentCardItem
                                  key={apt.id}
                                  apt={apt}
                                  onStatusChange={handleStatusChange}
                                  getStatusColor={getStatusColor}
                                  onOpenPreview={setPreviewModalUrl}
                                  currentUserId={currentUserId}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
}
