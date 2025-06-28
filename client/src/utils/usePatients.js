import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/patients`;

const usePatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch patients');
                }

                const data = await response.json();
                setPatients(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load patients');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const addPatient = async (newPatient) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newPatient),
            });

            if (!response.ok) {
                throw new Error('Failed to add patient');
            }

            const data = await response.json();
            setPatients(prev => [...prev, data]);
            return data;
        } catch (err) {
            toast.error('Failed to add patient');
            throw err;
        }
    };

    const updatePatient = async (id, updatedPatient) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedPatient),
            });

            if (!response.ok) {
                throw new Error('Failed to update patient');
            }

            const data = await response.json();
            setPatients(prev =>
                prev.map(patient => patient.id === id ? data : patient)
            );
            return data;
        } catch (err) {
            toast.error('Failed to update patient');
            throw err;
        }
    };

    const deletePatient = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete patient');
            }

            setPatients(prev => prev.filter(patient => patient.id !== id));
        } catch (err) {
            toast.error('Failed to delete patient');
            throw err;
        }
    };

    return {
        patients,
        loading,
        error,
        addPatient,
        updatePatient,
        deletePatient,
    };
};

export default usePatients;
