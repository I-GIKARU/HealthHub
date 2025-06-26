import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useClinicServices from '../utils/useClinicServices.js';

const AddClinic = () => {
  const { addClinic } = useClinicServices();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState({
    name: '',
    specialty: '',
    description: '',
    image_url: '',
    insurance_accepted: [],
    services: [],
    contact: {
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: ''
    }
  });


  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setClinic(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setClinic(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseClinic = {
        ...clinic,
        contact: clinic.contact.phone,
        email: clinic.contact.email,
        street: clinic.address.street,
        city: clinic.address.city
      };

      delete baseClinic.address;
      delete baseClinic.insurance_accepted;
      delete baseClinic.services;

      const newClinic = await addClinic(baseClinic);

      for (const insuranceId of clinic.insurance_accepted) {
        await fetch(`http://127.0.0.1:5000/api/clinics/${newClinic.id}/insurances`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ insurance_id: insuranceId })
        });
      }

      for (const service of clinic.services) {
        await fetch(`http://127.0.0.1:5000/api/clinics/${newClinic.id}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ service_id: service.id, price: service.price })
        });
      }

      toast.success('Clinic added successfully!');
      navigate('/manage-clinics');
    } catch (err) {
      toast.error(err.message || 'Failed to add clinic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Add New Clinic</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-gray-700 mb-2">Clinic Name*</label>
            <input type="text" name="name" value={clinic.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Specialty*</label>
            <input type="text" name="specialty" value={clinic.specialty} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description*</label>
            <textarea name="description" value={clinic.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" rows={3} required />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Image URL</label>
            <input type="url" name="image_url" value={clinic.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="https://example.com/image.jpg" />
          </div>

          {/* Contact & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Info</h3>
              <label className="block text-gray-700 mb-1">Phone*</label>
              <input type="tel" name="contact.phone" value={clinic.contact.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              <label className="block text-gray-700 mt-4 mb-1">Email*</label>
              <input type="email" name="contact.email" value={clinic.contact.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <label className="block text-gray-700 mb-1">Street*</label>
              <input type="text" name="address.street" value={clinic.address.street} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
              <label className="block text-gray-700 mt-4 mb-1">City*</label>
              <input type="text" name="address.city" value={clinic.address.city} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            </div>
          </div>
          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={() => navigate('/manage-clinics')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Clinic'}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddClinic;
