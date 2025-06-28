// src/utils/useMyBookings.js
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/bookings`;

const useMyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch bookings');

                const data = await response.json();
                setBookings(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    return { bookings, loading, error };
};

export default useMyBookings;
