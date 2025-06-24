import React from 'react';
import { useAuth } from '../context/AuthContext';

function PatientDashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <h2 className="text-3xl font-bold mb-4">Patient Dashboard</h2>
            <p className="text-lg mb-6 text-gray-700">
                Welcome, <span className="font-semibold">{currentUser?.username}</span> (Role: <span className="italic">{currentUser?.role}</span>)
            </p>
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                <h5 className="text-xl font-semibold mb-2 text-gray-800">Your Medical Information</h5>
                <p className="text-gray-600">
                    Here you can view your appointments, prescriptions, and medical history.
                </p>
            </div>
        </div>
    );
}

export default PatientDashboard;