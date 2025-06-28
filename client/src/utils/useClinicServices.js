import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const useClinicServices = (clinicId = null) => {
    const [clinics, setClinics] = useState([]);
    const [clinicServices, setClinicServices] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState({
        clinics: true,
        services: true,
        clinicServices: true
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics`, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch clinics');

                const data = await response.json();
                setClinics(data);
                setLoading(prev => ({ ...prev, clinics: false }));
            } catch (err) {
                setError(err);
                toast.error(err.message || 'Failed to load clinics');
                setLoading(prev => ({ ...prev, clinics: false }));
            }
        };

        const fetchServices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services`, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch services');

                const data = await response.json();
                setServices(data);
                setLoading(prev => ({ ...prev, services: false }));
            } catch (err) {
                setError(err);
                toast.error(err.message || 'Failed to load services');
                setLoading(prev => ({ ...prev, services: false }));
            }
        };

        fetchClinics();
        fetchServices();

        if (clinicId) {
            fetchClinicServices(clinicId);
        } else {
            setLoading(prev => ({ ...prev, clinicServices: false }));
        }
    }, [clinicId]);

    const fetchClinicServices = async (clinicId) => {
        try {
            setLoading(prev => ({ ...prev, clinicServices: true }));
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics/${clinicId}/services`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to fetch clinic services');

            const data = await response.json();
            setClinicServices(data);
            setLoading(prev => ({ ...prev, clinicServices: false }));
        } catch (err) {
            setError(err);
            toast.error(err.message || 'Failed to load clinic services');
            setLoading(prev => ({ ...prev, clinicServices: false }));
        }
    };

    const addClinic = async (clinicData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(clinicData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add clinic');
            }

            const newClinic = await response.json();
            setClinics(prev => [...prev, newClinic.clinic]);
            toast.success('Clinic added successfully');
            return newClinic;
        } catch (err) {
            toast.error(err.message || 'Failed to add clinic');
            throw err;
        }
    };

    const updateClinic = async (clinicId, updatedData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics/${clinicId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update clinic');
            }

            const updatedClinic = await response.json();
            setClinics(prev =>
                prev.map(c => c.id === clinicId ? updatedClinic.clinic : c)
            );
            toast.success('Clinic updated successfully');
            return updatedClinic;
        } catch (err) {
            toast.error(err.message || 'Failed to update clinic');
            throw err;
        }
    };

    const deleteClinic = async (clinicId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics/${clinicId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete clinic');
            }

            setClinics(prev => prev.filter(c => c.id !== clinicId));
            toast.success('Clinic deleted successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to delete clinic');
            throw err;
        }
    };

    const addClinicService = async (clinicId, serviceId, price) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinics/${clinicId}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // 👈 Required for cookie auth
                body: JSON.stringify({
                    service_id: serviceId,
                    price: price
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add service to clinic');
            }

            const newService = await response.json();
            setClinicServices(prev => [...prev, newService.clinic_service]);
            toast.success('Service added to clinic successfully');
            return newService;
        } catch (err) {
            toast.error(err.message || 'Failed to add service to clinic');
            throw err;
        }
    };

    const updateClinicService = async (clinicServiceId, updatedData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinic-services/${clinicServiceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update clinic service');
            }

            const updatedService = await response.json();
            setClinicServices(prev =>
                prev.map(cs => cs.id === clinicServiceId ? updatedService.clinic_service : cs)
            );
            toast.success('Clinic service updated successfully');
            return updatedService;
        } catch (err) {
            toast.error(err.message || 'Failed to update clinic service');
            throw err;
        }
    };

    const deleteClinicService = async (clinicServiceId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clinic-services/${clinicServiceId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove service from clinic');
            }

            setClinicServices(prev => prev.filter(cs => cs.id !== clinicServiceId));
            toast.success('Service removed from clinic successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to remove service from clinic');
            throw err;
        }
    };

    return {
        clinics,
        services,
        clinicServices,
        loading: loading.clinics || loading.services || loading.clinicServices,
        error,
        addClinic,
        updateClinic,
        deleteClinic,
        addClinicService,
        updateClinicService,
        deleteClinicService,
        refetchClinicServices: () => clinicId && fetchClinicServices(clinicId),
    };
};

export default useClinicServices;
