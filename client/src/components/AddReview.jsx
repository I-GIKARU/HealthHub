import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useReviews from "../utils/useReviews.js";
import useBookings from "../utils/useBookings.js"; // <-- if you have this

const AddReview = () => {
    const { id: clinicId } = useParams();
    const { addReview } = useReviews();
    const { bookings } = useBookings(); // Assuming you have access to bookings
    const navigate = useNavigate();

    const [form, setForm] = useState({
        bookingId: '',
        rating: 5,
        comment: '',
    });

    const eligibleBookings = bookings.filter(
        b => b.clinic.id === parseInt(clinicId) && !b.review
    );

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.comment.trim() || !form.bookingId) {
            toast.error('All fields are required.');
            return;
        }

        try {
            await addReview({
                rating: parseInt(form.rating),
                comment: form.comment.trim(),
                booking_id: parseInt(form.bookingId),
            });

            toast.success('Review submitted!');
            navigate(`/clinics/${clinicId}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select
                    name="bookingId"
                    value={form.bookingId}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Appointment</option>
                    {eligibleBookings.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.appointment_date} — {b.service?.name || 'Unknown Service'}
                        </option>
                    ))}
                </select>

                <select
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    {[5, 4, 3, 2, 1].map(val => (
                        <option key={val} value={val}>
                            {val} Star{val > 1 && 's'}
                        </option>
                    ))}
                </select>

                <textarea
                    name="comment"
                    placeholder="Your review"
                    value={form.comment}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default AddReview;
