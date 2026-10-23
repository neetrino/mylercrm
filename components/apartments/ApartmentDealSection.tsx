'use client';

import FileUpload from './FileUpload';
import type { Dispatch, SetStateAction } from 'react';
import { getSalesTypeLabel, getSalesTypeValue, normalizeAttachmentsForUpload, type Apartment } from './apartmentCardModel';

type ApartmentDealSectionProps = {
  apartment: Apartment;
  editing: boolean;
  formData: Partial<Apartment>;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
  apartmentId: number;
  refreshAfterUpload: () => Promise<void>;
};

export function ApartmentDealSection(props: ApartmentDealSectionProps) {
  const { apartment, editing, formData, setFormData, apartmentId, refreshAfterUpload } = props;
  return (
    <>
          {/* Deal Information Section */}
          <div className="card p-6">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Deal Information</h2>

            {editing ? (
              <div className="space-y-6">
                {/* Top row: Deal Date, Ownership Name | Email, Phone | Passport/Tax No */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Deal Date</label>
                    <input
                      type="date"
                      value={
                        formData.dealDate
                          ? new Date(formData.dealDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, dealDate: e.target.value || null })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Ownership Name</label>
                    <input
                      type="text"
                      value={formData.ownershipName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ownershipName: e.target.value || null })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value || null })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Phone</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value || null })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Passport/Tax No</label>
                    <input
                      type="text"
                      value={formData.passportTaxNo || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, passportTaxNo: e.target.value || null })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Middle: full-width fields */}
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Deal Description (max 500)</label>
                    <textarea
                      value={formData.dealDescription || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dealDescription: e.target.value || null })
                      }
                      maxLength={500}
                      rows={3}
                      className="input-field"
                      placeholder="Brief description of the deal"
                    />
                    <p className="mt-1 text-xs text-gray-500">{formData.dealDescription?.length || 0}/500</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Buyer Address</label>
                    <input
                      type="text"
                      value={formData.buyerAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, buyerAddress: e.target.value || null })
                      }
                      className="input-field"
                      placeholder="Address of the buyer"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Other Buyers</label>
                    <input
                      type="text"
                      value={formData.otherBuyers || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, otherBuyers: e.target.value || null })
                      }
                      className="input-field"
                      placeholder="Names of co-buyers"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Payment Schedule</label>
                    <textarea
                      value={formData.paymentSchedule || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentSchedule: e.target.value || null })
                      }
                      rows={2}
                      className="input-field"
                      placeholder="Payment dates and amounts"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">Notes (max 2000)</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value || null })
                    }
                    maxLength={2000}
                    rows={3}
                    className="input-field"
                    placeholder="Internal notes for this apartment"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.notes?.length || 0}/2000</p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Agreement (Media Attachment)</label>
                  <FileUpload
                    apartmentId={apartmentId}
                    attachments={normalizeAttachmentsForUpload(apartment.attachments)}
                    onUploadSuccess={refreshAfterUpload}
                    fileTypeOnly="AGREEMENT"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top row: two columns like the reference */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div className="space-y-5">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Deal Date</label>
                      <p className="text-base font-medium text-gray-900">
                        {apartment.dealDate
                          ? new Date(apartment.dealDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '–'}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Email</label>
                      <p className="text-base font-medium text-gray-900">
                        {apartment.email ? (
                          <a href={`mailto:${apartment.email}`} className="text-blue-600 hover:underline">
                            {apartment.email}
                          </a>
                        ) : (
                          '–'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Passport/Tax No</label>
                      <p className="text-base font-medium text-gray-900">{apartment.passportTaxNo || '–'}</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Ownership Name</label>
                      <p className="text-base font-medium text-gray-900">{apartment.ownershipName || '–'}</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Phone</label>
                      <p className="text-base font-medium text-gray-900">
                        {apartment.phone ? (
                          <a href={`tel:${apartment.phone}`} className="text-blue-600 hover:underline">
                            {apartment.phone}
                          </a>
                        ) : (
                          '–'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle: single column for description and new fields */}
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Deal Description</label>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">{apartment.dealDescription || '–'}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Buyer Address</label>
                    <p className="text-base text-gray-900">{apartment.buyerAddress || '–'}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Other Buyers</label>
                    <p className="text-base text-gray-900">{apartment.otherBuyers || '–'}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Payment Schedule</label>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">{apartment.paymentSchedule || '–'}</p>
                  </div>
                </div>

                {apartment.notes && (
                  <div className="border-t border-gray-100 pt-6">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Notes</label>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">{apartment.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Agreement (Media Attachment)</label>
                  <FileUpload
                    apartmentId={apartmentId}
                    attachments={normalizeAttachmentsForUpload(apartment.attachments)}
                    onUploadSuccess={refreshAfterUpload}
                    fileTypeOnly="AGREEMENT"
                  />
                </div>
              </div>
            )}
          </div>
    </>
  );
}
