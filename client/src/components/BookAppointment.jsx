import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useBookings from '../utils/useBookings';
import useClinicServices from '../utils/useClinicServices';
import { useAuth } from '../context/AuthContext'; // make sure this is correctly imported

const BookAppointment = () => {
    const { id: clinicId } = useParams();
    const { addBooking } = useBookings();
    const { clinicServices } = useClinicServices(clinicId);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        clinic_service_id: '',
        date: '',
        time: '',
        notes: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('You must be logged in as a patient to book.');
            return;
        }

        const appointmentDate = `${form.date} ${form.time}`;
        const bookingPayload = {
            clinic_service_id: parseInt(form.clinic_service_id),
            appointment_date: appointmentDate,
            notes: form.notes,
            patient_id: currentUser.id, // required by the API
        };

        try {
            await addBooking(bookingPayload);
            toast.success('Appointment booked successfully!');
            navigate(`/clinics/${clinicId}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select
                    name="clinic_service_id"
                    value={form.clinic_service_id}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select a Service</option>
                    {clinicServices.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                            {cs.service?.name} – ${cs.price} ({cs.service?.duration} min)
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                />
                <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                />
                <textarea
                    name="notes"
                    placeholder="Additional notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Book Appointment
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;
