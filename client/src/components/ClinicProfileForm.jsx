import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ClinicProfileForm() {
    const [clinic, setClinic] = useState({
        name: '',
        specialty: '',
        description: '',
        image_url: '',
        contact: {
            phone: '',
            email: ''
        },
        address: {
            street: '',
            city: ''
        }
    });
    const [isNew, setIsNew] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClinic = async () => {
            try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profile`, {
                    credentials: 'include',
                });
                const data = await response.json();

                if (response.ok && data.user?.role === 'clinic' && data.user?.name) {
                    setClinic({
                        name: data.user.name || '',
                        specialty: data.user.specialty || '',
                        description: data.user.description || '',
                        image_url: data.user.image_url || '',
                        contact: {
                            phone: data.user.contact || '',
                            email: data.user.email || '',
                        },
                        address: {
                            street: data.user.street || '',
                            city: data.user.city || '',
                        }
                    });
                    setIsNew(false);
                }
            } catch {
                console.warn('No existing clinic profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchClinic();
    }, []);

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
            setClinic(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: clinic.name,
            specialty: clinic.specialty,
            description: clinic.description,
            image_url: clinic.image_url,
            contact: clinic.contact.phone,
            email: clinic.contact.email,
            street: clinic.address.street,
            city: clinic.address.city
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${isNew ? 'clinics' : 'profile'}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save clinic profile');

            toast.success(`Clinic profile ${isNew ? 'created' : 'updated'}!`);
            navigate('/clinic');
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
                {isNew ? 'Create Clinic Profile' : 'Edit Clinic Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 mb-1">Clinic Name*</label>
                    <input name="name" value={clinic.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Specialty*</label>
                    <input name="specialty" value={clinic.specialty} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Description*</label>
                    <textarea name="description" value={clinic.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded" required />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Image URL</label>
                    <input name="image_url" value={clinic.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Email*</label>
                        <input name="contact.email" type="email" value={clinic.contact.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Phone*</label>
                        <input name="contact.phone" value={clinic.contact.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Street*</label>
                        <input name="address.street" value={clinic.address.street} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">City*</label>
                        <input name="address.city" value={clinic.address.city} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate('/clinic')} className="bg-gray-200 px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : (isNew ? 'Create' : 'Update')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ClinicProfileForm;
