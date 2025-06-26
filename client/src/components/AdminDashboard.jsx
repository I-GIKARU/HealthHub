import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="max-w-7xl mx-auto mt-12 px-6">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Admin Dashboard</h2>
            <p className="text-lg text-gray-600 mb-10">
                Welcome, <span className="font-semibold text-blue-600">{currentUser?.username}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <DashboardCard title="User Management" description="Manage all system users" icon="👤" />
                <DashboardCard title="System Settings" description="Configure application preferences" icon="⚙️" />
                <DashboardCard title="Reports" description="Generate and view system reports" icon="📊" />
            </div>

            <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link to="/add-service" className="btn-blue">➕ Add Service</Link>
                    <Link to="/add-insurance" className="btn-green">🏥 Add Insurance</Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-10">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Clinics</h4>
                <p className="text-gray-600 mb-4">Manage or add clinics to the platform.</p>
                <div className="space-x-3">
                    <Link to="/add-clinic" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition">
                        ➕ Add Clinic
                    </Link>
                    <Link to="/manage-clinics" className="inline-block bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition">
                        🛠️ Manage Clinics
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-2xl font-semibold text-blue-700 mb-4">Admin Profile</h3>
                <p className="text-gray-800"><strong>Username:</strong> {currentUser?.username}</p>
            </div>
        </div>
    );
}

function DashboardCard({ title, description, icon }) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition">
            <div className="text-4xl mb-3">{icon}</div>
            <h5 className="text-xl font-semibold text-gray-800 mb-2">{title}</h5>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

export default AdminDashboard;
