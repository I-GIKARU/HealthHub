import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ClinicDashboard() {
    const { currentUser, logout } = useAuth();
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not logged in or not a clinic user
        if (!currentUser || currentUser.role !== 'clinic') {
            navigate('/login');
            return;
        }

        const fetchClinicProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/profile', {
                    method: 'GET',
                    credentials: 'include', // Required for cookies
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Handle unauthorized or other errors
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch clinic profile');
                }

                const data = await response.json();
                setClinic(data.user);
            } catch (error) {
                console.error('Error loading clinic profile:', error);
                setError(error.message);
                toast.error(error.message || 'Failed to load clinic profile');

                // If authentication failed, force logout
                if (error.message.includes('Session expired') ||
                    error.message.includes('authentication')) {
                    await logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClinicProfile();
    }, [currentUser, navigate, logout]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    // Show loading state or redirect
    if (!currentUser || currentUser.role !== 'clinic') {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-10 px-4">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold text-blue-800">Clinic Dashboard</h2>
            </div>

            {/* Welcome Message */}
            <div className="bg-blue-50 rounded-lg p-4 mb-10">
                <p className="text-lg text-gray-700">
                    Welcome back, <span className="font-semibold">{currentUser.username}</span></p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p>{error}</p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                <div
                    className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer hover:bg-blue-50"
                    onClick={() => navigate('/appointments')}
                >
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Appointments</h3>
                    <p className="text-gray-600">manage appointments</p>
                </div>
            </div>

            {/* Clinic Profile Section */}
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-blue-700">Clinic Profile</h3>
                    <button
                        onClick={() => navigate('/edit-clinic')}
                        className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Profile
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : clinic ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {clinic.name}</p>
                                    <p><span className="font-medium">Specialty:</span> {clinic.specialty}</p>
                                    <p><span className="font-medium">Description:</span> {clinic.description || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Email:</span> {clinic.email}</p>
                                    <p><span className="font-medium">Phone:</span> {clinic.contact}</p>
                                    <p><span className="font-medium">Address:</span> {clinic.street}, {clinic.city}</p>
                                </div>
                            </div>
                        </div>

                        {clinic.image_url && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-700 mb-3">Clinic Image</h4>
                                <img
                                    src={clinic.image_url}
                                    alt="Clinic"
                                    className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-lg mb-4 text-gray-700 mt-4">No clinic profile found.</p>
                        <button
                            onClick={() => navigate('/edit-clinic')}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Create Clinic Profile
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">New appointment scheduled</p>
                            <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">Patient check-up completed</p>
                            <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClinicDashboard;