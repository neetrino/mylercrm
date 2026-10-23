'use client';

import FileUpload from './FileUpload';
import { getEmbedPreviewUrl, safeHttpUrl } from '@/lib/getEmbedPreviewUrl';
import type { Dispatch, SetStateAction } from 'react';
import { normalizeAttachmentsForUpload, truncateUrl, type Apartment } from './apartmentCardModel';

type ApartmentLinksSectionProps = {
  apartment: Apartment;
  editing: boolean;
  formData: Partial<Apartment>;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
  apartmentId: number;
  refreshAfterUpload: () => Promise<void>;
  setPreviewUrl: (url: string | null) => void;
  setPreviewOriginalUrl: (url: string | null) => void;
};

export function ApartmentLinksSection(props: ApartmentLinksSectionProps) {
  const { apartment, editing, formData, setFormData, apartmentId, refreshAfterUpload, setPreviewUrl, setPreviewOriginalUrl } = props;
  return (
    <>
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Links</h2>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Matter Link</label>
                  <input
                    type="url"
                    value={formData.matterLink || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, matterLink: e.target.value || null })
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Exterior Link</label>
                  <input
                    type="url"
                    value={formData.exteriorLink || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, exteriorLink: e.target.value || null })
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Exterior Link 2</label>
                  <input
                    type="url"
                    value={formData.exteriorLink2 || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, exteriorLink2: e.target.value || null })
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'matter', label: 'Matter Link', url: apartment.matterLink },
                  { key: 'exterior', label: 'Exterior Link', url: apartment.exteriorLink },
                  { key: 'exterior2', label: 'Exterior Link 2', url: apartment.exteriorLink2 },
                ].map(({ key, label, url }) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                  >
                    {/* Single unified Preview zone: label + URL + Preview — one block, one action */}
                    <button
                      type="button"
                      onClick={() => {
                        const preview = url ? getEmbedPreviewUrl(url) : '';
                        const original = url ? safeHttpUrl(url) : '';
                        if (preview) {
                          setPreviewUrl(preview);
                          setPreviewOriginalUrl(original || null);
                        }
                      }}
                      disabled={!url}
                      className="flex min-h-[80px] flex-1 cursor-pointer items-center gap-4 rounded-xl rounded-r-none border-0 bg-gradient-to-r from-blue-50 to-blue-100/80 p-4 text-left transition hover:from-blue-100 hover:to-blue-100 disabled:cursor-default disabled:opacity-50 sm:min-h-0"
                      title={url ? 'Preview 3D' : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-medium uppercase tracking-wide text-blue-700/90">
                          {label}
                        </span>
                        {url ? (
                          <span className="mt-0.5 block text-sm font-medium text-gray-900 truncate">
                            {truncateUrl(url, 52)}
                          </span>
                        ) : (
                          <span className="mt-0.5 text-sm text-gray-500">—</span>
                        )}
                      </div>
                      {url && (
                        <span className="hidden shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white sm:inline-block">
                          Preview
                        </span>
                      )}
                    </button>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center justify-center gap-2 border-l border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Floorplan Distribution */}
            <div className="mt-8 rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-blue-50/70 p-5 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  Floor plan description
                </h3>
              </div>
              {editing ? (
                <>
                  <textarea
                    value={formData.floorplanDistribution || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        floorplanDistribution: e.target.value || null,
                      })
                    }
                    maxLength={500}
                    rows={5}
                    placeholder="e.g. living room 24 m², kitchen 12 m², 2 bedrooms..."
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-gray-900 shadow-inner placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                  <p className="mt-2 text-right text-sm font-medium text-blue-700/80">
                    {formData.floorplanDistribution?.length || 0} / 500
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-blue-100 bg-white/80 px-4 py-3">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {apartment.floorplanDistribution || (
                      <span className="text-gray-400">No description</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Files</h2>
            <FileUpload
              apartmentId={apartmentId}
              attachments={normalizeAttachmentsForUpload(apartment.attachments)}
              onUploadSuccess={refreshAfterUpload}
            />
          </div>
    </>
  );
}
