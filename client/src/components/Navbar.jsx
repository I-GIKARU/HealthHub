import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-white hover:text-gray-300">
                    Clinic System
                </Link>

                <div className="flex items-center space-x-6">
                    {currentUser && (
                        <Link to="/" className="hover:text-gray-300">
                            Dashboard
                        </Link>
                    )}

                    {currentUser?.role === 'admin' && (
                        <Link to="/admin" className="hover:text-gray-300">
                            Admin
                        </Link>
                    )}

                    {currentUser?.role === 'clinic' && (
                        <Link to="/clinic" className="hover:text-gray-300">
                            Clinic
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            <span className="text-sm">Welcome, {currentUser.username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm hover:text-gray-300"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm hover:text-gray-300"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;