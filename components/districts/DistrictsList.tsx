'use client';

import { useState, useEffect } from 'react';
import type { District } from '@prisma/client';
import DistrictForm from './DistrictForm';

export default function DistrictsList() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(
    null
  );

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/districts');
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      setDistricts(data);
    } catch (err) {
      setError('Failed to load districts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDistrict(null);
    setShowForm(true);
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this district?')) {
      return;
    }

    try {
      const response = await fetch(`/api/districts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }

      fetchDistricts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDistrict(null);
    fetchDistricts();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleCreate}
          className="btn-primary"
        >
          + Create District
        </button>
      </div>

      {showForm && (
        <DistrictForm
          district={editingDistrict}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Slug
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {districts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No districts. Create the first district.
                </td>
              </tr>
            ) : (
              districts.map((district) => (
                <tr key={district.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {district.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {district.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {district.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(district)}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(district.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
