import React, { useState, useEffect } from "react";
import { CompanyData } from "../types";

interface CompanyInfoProps {
  companyData: CompanyData | null;
  loading: boolean;
  onUpdate: (updatedData: Partial<CompanyData>) => Promise<void>;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ companyData, loading, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyData>>({});

  useEffect(() => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName,
        phone_number: companyData.phone_number,
        companyEmail: companyData.companyEmail,
        description: companyData.description,
      });
    }
  }, [companyData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-md font-medium bg-blue text-white hover:bg-blue-700 transition-colors duration-200"
          >
            Edit
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading company data...</p>
      ) : companyData ? (
        isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue text-white rounded-md hover:bg-green-700 transition duration-200"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-blue text-white rounded-md hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-gray-700 text-sm sm:text-base">
            <p><strong>Company Name:</strong> {companyData.companyName}</p>
            <p><strong>Phone Number:</strong> {companyData.phone_number}</p>
            <p><strong>Email:</strong> {companyData.companyEmail}</p>
            <p><strong>Description:</strong> {companyData.description || "N/A"}</p>
            <p><strong>Status:</strong> {companyData.status}</p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(companyData.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(companyData.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )
      ) : (
        <p className="text-gray-500">No company data available.</p>
      )}
    </div>
  );
};

export default CompanyInfo;
