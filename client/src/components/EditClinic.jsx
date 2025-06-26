import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

import useInsurances from '../utils/useInsurances.js';
import useServices from '../utils/useServices.js';
import useClinicServices from '../utils/useClinicServices.js';

const EditClinic = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    clinics,
    clinicServices,
    loading,
    updateClinic,
    addClinicService,
    deleteClinicService
  } = useClinicServices(id);

  const { insurances } = useInsurances();
  const { services: allServices } = useServices();

  const [clinic, setClinic] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !clinics || !allServices) return;

    const foundClinic = clinics.find(c => c.id === parseInt(id));
    if (!foundClinic) {
      navigate('/manage-clinics');
      return;
    }

    setClinic({
      ...foundClinic,
      address: {
        street: foundClinic.street || '',
        city: foundClinic.city || '',
      },
      contact: {
        phone: foundClinic.contact || '',
        email: foundClinic.email || '',
      },
      insurance_accepted: Array.isArray(foundClinic.insurance_accepted)
          ? foundClinic.insurance_accepted.map(i => i.id || i)
          : [],
    });
  }, [id, clinics, allServices, navigate, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setClinic(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setClinic(prev => ({ ...prev, [name]: value }));
    }
  };

  const addInsurance = async () => {
    const parsedId = parseInt(selectedInsurance, 10);
    if (parsedId && !clinic.insurance_accepted.includes(parsedId)) {
      try {
        await fetch(`http://localhost:5000/api/clinics/${clinic.id}/insurances`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ insurance_id: parsedId }),
        });

        setClinic(prev => ({
          ...prev,
          insurance_accepted: [...prev.insurance_accepted, parsedId],
        }));

        setSelectedInsurance('');
        toast.success('Insurance added');
      } catch (err) {
        toast.error('Failed to add insurance');
      }
    }
  };

  const removeInsurance = async (insuranceId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/clinics/${clinic.id}/insurances`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ insurance_id: insuranceId }),
      });

      if (!res.ok) throw new Error('Failed to remove insurance');

      setClinic(prev => ({
        ...prev,
        insurance_accepted: prev.insurance_accepted.filter(id => id !== insuranceId),
      }));
      toast.success('Insurance removed');
    } catch (err) {
      toast.error(err.message || 'Error removing insurance');
    }
  };

  const addService = async () => {
    const serviceId = parseInt(selectedService);
    const price = parseFloat(selectedPrice);

    if (!serviceId || isNaN(price)) {
      toast.error('Please select a service and enter a valid price');
      return;
    }

    const alreadyAdded = clinicServices.find(cs => cs.service.id === serviceId);
    if (alreadyAdded) {
      toast.warn('Service already added');
      return;
    }

    try {
      await addClinicService(clinic.id, serviceId, price);
      toast.success('Service added');
      setSelectedService('');
      setSelectedPrice('');
    } catch (err) {
      toast.error('Failed to add service');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const flattened = {
      ...clinic,
      contact: clinic.contact.phone,
      email: clinic.contact.email,
      street: clinic.address.street,
      city: clinic.address.city,
    };

    delete flattened.address;
    delete flattened.insurance_accepted;

    try {
      await updateClinic(clinic.id, flattened);
      toast.success('Clinic updated successfully!');
      navigate('/manage-clinics');
    } catch (err) {
      toast.error(err.message || 'Failed to update clinic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clinic) {
    return <div className="text-center py-10">Loading clinic data...</div>;
  }

  return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Edit Clinic: {clinic.name}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Clinic Name*</label>
              <input
                  type="text"
                  name="name"
                  value={clinic.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Specialty*</label>
              <input
                  type="text"
                  name="specialty"
                  value={clinic.specialty}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description*</label>
            <textarea
                name="description"
                value={clinic.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Contact and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Info</h3>
              <label className="block text-gray-700 mb-1">Phone*</label>
              <input
                  type="tel"
                  name="contact.phone"
                  value={clinic.contact.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
              <label className="block text-gray-700 mt-4 mb-1">Email*</label>
              <input
                  type="email"
                  name="contact.email"
                  value={clinic.contact.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Address</h3>
              <label className="block text-gray-700 mb-1">Street*</label>
              <input
                  type="text"
                  name="address.street"
                  value={clinic.address.street}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
              <label className="block text-gray-700 mt-4 mb-1">City*</label>
              <input
                  type="text"
                  name="address.city"
                  value={clinic.address.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Insurance Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Insurance Accepted</h3>
            <div className="flex mb-2">
              <select
                  value={selectedInsurance}
                  onChange={(e) => setSelectedInsurance(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-l"
              >
                <option value="">Select insurance</option>
                {insurances.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <button
                  type="button"
                  onClick={addInsurance}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {clinic.insurance_accepted.map(id => {
                const insurance = insurances.find(i => i.id === id);
                return insurance ? (
                    <span key={id} className="bg-blue-100 px-3 py-1 rounded-full flex items-center text-blue-800">
                  {insurance.name}
                      <button onClick={() => removeInsurance(id)} className="ml-2">
                    <FaTimes />
                  </button>
                </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
              >
                <option value="">Select service</option>
                {allServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration} mins)
                    </option>
                ))}
              </select>
              <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-32 px-3 py-2 border rounded"
              />
              <button
                  type="button"
                  onClick={addService}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {clinicServices.map(cs => (
                  cs.service ? (
                      <span key={cs.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-gray-800">
                  {cs.service.name} – ${cs.price}
                        <button onClick={() => deleteClinicService(cs.id)} className="ml-2">
                    <FaTimes />
                  </button>
                </span>
                  ) : null
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6">
            <button
                type="button"
                onClick={() => navigate('/manage-clinics')}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
  );
};

export default EditClinic;
