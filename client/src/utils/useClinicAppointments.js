import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/bookings';

const useClinicAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch appointments');
                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');
            const updated = await response.json();

            setAppointments(prev =>
                prev.map(appt => appt.id === id ? updated.booking : appt)
            );

            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return { appointments, loading, updateStatus };
};

export default useClinicAppointments;
