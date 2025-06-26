import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/services';

const useServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load services');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const addService = async (newService) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newService),
            });

            if (!response.ok) {
                throw new Error('Failed to add service');
            }

            const data = await response.json();
            setServices(prev => [...prev, data]);
            toast.success('Service added successfully');
            return data;
        } catch (err) {
            toast.error('Failed to add service');
            throw err;
        }
    };

    const updateService = async (id, updatedService) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedService),
            });

            if (!response.ok) {
                throw new Error('Failed to update service');
            }

            const data = await response.json();
            setServices(prev =>
                prev.map(service => (service.id === id ? data : service))
            );
            return data;
        } catch (err) {
            toast.error('Failed to update service');
            throw err;
        }
    };

    const deleteService = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete service');
            }

            setServices(prev => prev.filter(service => service.id !== id));
        } catch (err) {
            toast.error('Failed to delete service');
            throw err;
        }
    };

    return {
        services,
        loading,
        error,
        addService,
        updateService,
        deleteService,
    };
};

export default useServices;
