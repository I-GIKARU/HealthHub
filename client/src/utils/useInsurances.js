import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/insurances';


const useInsurances = () => {
    const [insurances, setInsurances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsurances = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch insurances');
                }

                const data = await response.json();
                setInsurances(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load insurance providers');
            } finally {
                setLoading(false);
            }
        };

        fetchInsurances();
    }, []);

    const addInsurance = async (name) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                throw new Error('Failed to add insurance provider');
            }

            const data = await response.json();
            const newInsurance = data.insurance; // ✅ extract correctly
            setInsurances(prev => [...prev, newInsurance]);
            toast.success('Insurance provider added successfully');
            return newInsurance;
        } catch (err) {
            toast.error(err.message || 'Failed to add insurance provider');
            throw err;
        }
    };

    const updateInsurance = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update insurance provider');
            }

            const updatedInsurance = await response.json();
            setInsurances(prev =>
                prev.map(insurance =>
                    insurance.id === id ? updatedInsurance : insurance
                )
            );
            toast.success('Insurance provider updated successfully');
            return updatedInsurance;
        } catch (err) {
            toast.error(err.message || 'Failed to update insurance provider');
            throw err;
        }
    };

    const deleteInsurance = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete insurance provider');
            }

            setInsurances(prev => prev.filter(insurance => insurance.id !== id));
            toast.success('Insurance provider deleted successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to delete insurance provider');
            throw err;
        }
    };

    return {
        insurances,
        loading,
        error,
        addInsurance,
        updateInsurance,
        deleteInsurance,
    };
};

export default useInsurances;
