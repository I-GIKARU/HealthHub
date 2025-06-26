import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/bookings';

const useBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

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

    const addBooking = async (newBooking) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newBooking),
            });

            if (!response.ok) {
                throw new Error('Failed to add booking');
            }

            const data = await response.json();
            setBookings(prev => [...prev, data]);
            return data;
        } catch (err) {
            toast.error('Failed to add booking');
            throw err;
        }
    };

    const updateBooking = async (id, updatedBooking) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedBooking),
            });

            if (!response.ok) {
                throw new Error('Failed to update booking');
            }

            const data = await response.json();
            setBookings(prev =>
                prev.map(booking => booking.id === id ? data : booking)
            );
            return data;
        } catch (err) {
            toast.error('Failed to update booking');
            throw err;
        }
    };

    const deleteBooking = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            setBookings(prev => prev.filter(booking => booking.id !== id));
        } catch (err) {
            toast.error('Failed to delete booking');
            throw err;
        }
    };

    return {
        bookings,
        loading,
        error,
        addBooking,
        updateBooking,
        deleteBooking,
    };
};

export default useBookings;
