import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            username,
            password,
            role,
        };

        if (role === 'patient') {
            if (!name || !email || !contact) {
                toast.error('Please fill in name, email, and contact for patients');
                return;
            }
            payload.name = name;
            payload.email = email;
            payload.contact = contact;

        } else if (role === 'clinic') {
            if (!name || !specialty || !email || !contact || !street || !city) {
                toast.error('Please fill in all required clinic fields');
                return;
            }
            payload.name = name;
            payload.specialty = specialty;
            payload.email = email;
            payload.contact = contact;
            payload.street = street;
            payload.city = city;
            if (description) payload.description = description;
        }

        const result = await register(payload);
        if (result.success) {
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="patient">Patient</option>
                            <option value="clinic">Clinic</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Patient Fields */}
                    {role === 'patient' && (
                        <>
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example@mail.com"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Contact</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+254 700 000000"
                                />
                            </div>
                        </>
                    )}

                    {/* Clinic Fields */}
                    {role === 'clinic' && (
                        <>
                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Clinic Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Clinic name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Specialty</label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Dental, General Practice"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example@clinic.com"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Contact</label>
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+254 700 000000"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Street</label>
                                <input
                                    type="text"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Street name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="City"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 font-medium mb-1">Description (optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description"
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
