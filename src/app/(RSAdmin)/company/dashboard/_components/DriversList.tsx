import React from "react";
import { Driver } from "../types";

interface DriversListProps {
  drivers: Driver[];
  loading: boolean;
  onUpdateStatus: (driverId: string, newStatus: string) => Promise<void>;
}

const DriversList: React.FC<DriversListProps> = ({ drivers, loading, onUpdateStatus }) => {
  const statusOptions = ["ACTIVE", "PENDING", "ONHOLD", "SUSPEND"];

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden w-full">
      <div className="bg-gray-100 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Drivers List</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-medium text-gray-700">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Email Address</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center px-6 py-4 text-gray-500">
                  Loading drivers...
                </td>
              </tr>
            ) : drivers.length > 0 ? (
              drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{driver.name || "N/A"}</td>
                  <td className="px-6 py-4">{driver.phoneNumber || "N/A"}</td>
                  <td className="px-6 py-4">{driver.email || "N/A"}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{driver.status || "N/A"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={driver.status}
                      onChange={(e) => onUpdateStatus(driver.id, e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-6 py-4 text-gray-500">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversList;
