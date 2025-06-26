import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useClinicServices from "../utils/useClinicServices.js";


const ManageClinics = () => {
  const { clinics, loading, error, deleteClinic } = useClinicServices();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinic?')) {
      setIsDeleting(id);
      try {
        await deleteClinic(id);
        toast.success('Clinic deleted successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to delete clinic');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading clinics...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 mb-4 md:mb-0">Manage Clinics</h1>
          <Link
              to="/add-clinic"
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <FaPlus className="mr-2" />
            Add New Clinic
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {clinics?.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{clinic.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{clinic.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">
                        {clinic.address?.city || clinic.city}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                          onClick={() => navigate(`/edit-clinic/${clinic.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit className="inline mr-1" />
                        Edit
                      </button>
                      <button
                          onClick={() => handleDelete(clinic.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting === clinic.id}
                      >
                        <FaTrash className="inline mr-1" />
                        {isDeleting === clinic.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {clinics?.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No clinics found. Add a new clinic to get started.
              </div>
          )}
        </div>
      </div>
  );
};

export default ManageClinics;