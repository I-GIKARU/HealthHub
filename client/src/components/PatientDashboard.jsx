import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import useMyBookings from '../utils/useMyBookings';
import useBookings from '../utils/useBookings'; // <-- For updateBooking

function PatientDashboard() {
    const { currentUser, logout } = useAuth();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { bookings, loading: bookingsLoading } = useMyBookings();
    const { updateBooking } = useBookings(); // <-- update status
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'patient') {
            navigate('/login');
            return;
        }

        const fetchPatientProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch patient profile');
                }

                const data = await response.json();
                setPatient(data.user);
            } catch (error) {
                console.error('Error fetching patient profile:', error);
                setError(error.message);
                toast.error('Failed to load patient profile');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientProfile();
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            await updateBooking(bookingId, { status: 'cancelled' });
            toast.success('Booking cancelled');
        } catch (err) {
            toast.error('Failed to cancel booking');
        }
    };

    if (!currentUser || currentUser.role !== 'patient') {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Patient Dashboard</h2>
            </div>

            <p className="text-lg mb-6 text-gray-700">
                Welcome, <span className="font-semibold">{currentUser?.username}</span>
            </p>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appointments Shortcut */}
                <div
                    className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate('/appointments')}
                >
                    <h5 className="text-xl font-semibold mb-2 text-gray-800">Your Appointments</h5>
                    <p className="text-gray-600">
                        View and manage your upcoming medical appointments.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h5 className="text-xl font-semibold text-blue-700">Patient Profile</h5>
                        <button
                            onClick={() => navigate('/edit-profile')}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                        >
                            Edit
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : patient ? (
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold text-gray-700">Name:</p>
                                <p className="text-gray-800">{patient.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Email:</p>
                                <p className="text-gray-800">{patient.email}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Contact:</p>
                                <p className="text-gray-800">{patient.contact}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Profile information not available.</p>
                    )}
                </div>
            </div>

            {/* Appointment History */}
            <div className="mt-12">
                <h3 className="text-2xl font-semibold text-blue-800 mb-4">Appointment History</h3>

                {bookingsLoading ? (
                    <p className="text-gray-500">Loading appointments...</p>
                ) : bookings.length === 0 ? (
                    <p className="text-gray-500">You haven’t booked any appointments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white p-4 border rounded-lg shadow-sm relative"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-lg font-semibold text-gray-800">
                                        {booking.clinic?.name || 'Clinic'}
                                    </h4>
                                    <span className={`text-sm font-medium capitalize ${
                                        booking.status === 'confirmed'
                                            ? 'text-green-600'
                                            : booking.status === 'cancelled'
                                                ? 'text-red-600'
                                                : 'text-yellow-600'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Service: {booking.service?.name || 'N/A'} – ${booking.clinic_service?.price || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Appointment: {format(new Date(booking.appointment_date), 'PPpp')}
                                </p>
                                {booking.notes && (
                                    <p className="text-sm text-gray-500 italic mt-1">
                                        “{booking.notes}”
                                    </p>
                                )}

                                {/* Cancel Button */}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="mt-3 inline-block bg-red-100 text-red-700 text-sm px-3 py-1 rounded hover:bg-red-200 transition"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientDashboard;
