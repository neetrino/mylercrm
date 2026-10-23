'use client';

import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import { getStatusColor, type Apartment } from './apartmentCardModel';

type ApartmentCardChromeProps = {
  apartment: Apartment;
  editing: boolean;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
  handleCopyLandingLink: () => void;
  landingCopied: boolean;
  activeTab: 'overview' | 'links';
  setActiveTab: (tab: 'overview' | 'links') => void;
  setEditing: (value: boolean) => void;
  handleSave: () => void;
  handleStatusChange: (status: string) => void;
};

export function ApartmentCardChrome(props: ApartmentCardChromeProps) {
  const { apartment, editing, setFormData, handleCopyLandingLink, landingCopied, activeTab, setActiveTab, setEditing, handleSave, handleStatusChange } = props;
  return (
    <>
      <div className="mb-6">
        <Link
          href="/apartments"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to list
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Apartment {apartment.apartmentNo}
              {apartment.apartmentName?.trim() ? (
                <span className="font-semibold text-gray-600"> — {apartment.apartmentName.trim()}</span>
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {apartment.district_name} - {apartment.building_name}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopyLandingLink}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title="Copy landing link for buyer"
            >
              {landingCopied ? (
                <>Copied</>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172m4.828-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.172 1.172" />
                  </svg>
                  Landing link
                </>
              )}
            </button>
            <select
              value={apartment.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`select-chevron-card badge border-2 ${getStatusColor(apartment.status)} cursor-pointer text-lg font-bold appearance-none bg-right transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs and Edit Button */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Links & Files
          </button>
        </nav>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn-primary">
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(apartment);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
