'use client';

import { useRef, useState } from 'react';
import type { BuildingWithDistrict, FloorPlan } from './buildingFormTypes';

type BuildingFloorPlansProps = {
  buildingId: number;
  floorsNum: number;
  floorPlans: FloorPlan[];
  onUpdated: (data: BuildingWithDistrict) => void;
};

export function BuildingFloorPlans({
  buildingId,
  floorsNum,
  floorPlans,
  onUpdated,
}: BuildingFloorPlansProps) {
  const [uploadingFloor, setUploadingFloor] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const handleFloorPlanUpload = async (floor: number, file: File) => {
    if (!buildingId) return;
    setUploadingFloor(floor);
    try {
      const form = new FormData();
      form.append('floor', String(floor));
      form.append('file', file);
      const res = await fetch(`/api/buildings/${buildingId}/floor-plans`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await fetch(`/api/buildings/${buildingId}`).then((r) => r.json());
      onUpdated(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingFloor(null);
    }
  };

  const handleRemoveFloorPlan = async (floor: number) => {
    if (!buildingId || !confirm('Remove this floor plan?')) return;
    try {
      const res = await fetch(`/api/buildings/${buildingId}/floor-plans/${floor}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      const data = await fetch(`/api/buildings/${buildingId}`).then((r) => r.json());
      onUpdated(data);
    } catch {
      alert('Failed to remove');
    }
  };
  const getPlanForFloor = (f: number) => floorPlans.find((p) => p.floor === f);

  return (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Floor plans (for Floor view)</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: floorsNum }, (_, i) => i + 1).map((f) => {
                  const plan = getPlanForFloor(f);
                  return (
                    <div
                      key={f}
                      className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <span className="mb-2 text-xs font-medium text-gray-600">Floor {f}</span>
                      {plan ? (
                        <div className="relative w-full">
                          <a
                            href={plan.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block aspect-[4/3] overflow-hidden rounded border border-gray-200 bg-white"
                          >
                            {plan.fileUrl.toLowerCase().match(/\.(pdf)$/) ? (
                              <div className="flex h-full items-center justify-center">
                                <span className="text-xs text-gray-500">PDF</span>
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={plan.fileUrl}
                                alt={`Floor ${f}`}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </a>
                          <div className="mt-1 flex justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveFloorPlan(f)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                            <label className="cursor-pointer text-xs text-blue-600 hover:underline">
                              Replace
                              <input
                                ref={(el) => { fileInputRefs.current[f] = el; }}
                                type="file"
                                accept="image/*,.pdf"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFloorPlanUpload(f, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 py-4 transition hover:border-blue-400 hover:bg-gray-100">
                          <input
                            ref={(el) => { fileInputRefs.current[f] = el; }}
                            type="file"
                            accept="image/*,.pdf"
                            className="sr-only"
                            disabled={uploadingFloor === f}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFloorPlanUpload(f, file);
                              e.target.value = '';
                            }}
                          />
                          {uploadingFloor === f ? (
                            <span className="text-xs text-gray-500">Uploading...</span>
                          ) : (
                            <span className="text-xs text-gray-500">Upload plan</span>
                          )}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
  );
}
