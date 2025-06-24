import React from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
            <p className="text-lg mb-6 text-gray-700">
                Welcome, <span className="font-semibold">{currentUser?.username}</span> (Role: <span className="italic">{currentUser?.role}</span>)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                    <h5 className="text-xl font-semibold mb-4 text-gray-800">User Management</h5>
                    <p className="text-gray-600">Manage all system users</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                    <h5 className="text-xl font-semibold mb-4 text-gray-800">System Settings</h5>
                    <p className="text-gray-600">Configure application settings</p>
                </div>
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                    <h5 className="text-xl font-semibold mb-4 text-gray-800">Reports</h5>
                    <p className="text-gray-600">Generate system reports</p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;