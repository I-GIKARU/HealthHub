import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reviews`;

const useReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(API_URL, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }

                const data = await response.json();
                setReviews(data);
            } catch (err) {
                setError(err.message);
                toast.error('Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const fetchReviewsByClinic = async (clinicId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}?clinic_id=${clinicId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const addReview = async (newReview) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newReview),
            });

            if (!response.ok) {
                throw new Error('Failed to add review');
            }

            const data = await response.json();
            setReviews(prev => [...prev, data]);
            return data;
        } catch (err) {
            toast.error('Failed to add review');
            throw err;
        }
    };

    const updateReview = async (id, updatedReview) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedReview),
            });

            if (!response.ok) {
                throw new Error('Failed to update review');
            }

            const data = await response.json();
            setReviews(prev =>
                prev.map(review => review.id === id ? data : review)
            );
            return data;
        } catch (err) {
            toast.error('Failed to update review');
            throw err;
        }
    };

    const deleteReview = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete review');
            }

            setReviews(prev => prev.filter(review => review.id !== id));
        } catch (err) {
            toast.error('Failed to delete review');
            throw err;
        }
    };

    return {
        reviews,
        loading,
        error,
        fetchReviewsByClinic,
        addReview,
        updateReview,
        deleteReview,
    };
};

export default useReviews;
