import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_URL = `${API_BASE_URL}/api/login`;
const REGISTER_URL = `${API_BASE_URL}/api/register`;
const LOGOUT_URL = `${API_BASE_URL}/api/logout`;
const CURRENT_USER_URL = `${API_BASE_URL}/api/me`;
const PROFILE_URL = `${API_BASE_URL}/api/profile`;

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(CURRENT_USER_URL, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }

                const result = await response.json();
                setCurrentUser(result.user || null);
            } catch (error) {
                console.error('Error fetching current user:', error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // This is crucial
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            // Verify the cookie was set by making a test request
            const testResponse = await fetch(CURRENT_USER_URL, {
                credentials: 'include',
            });

            if (!testResponse.ok) {
                throw new Error('Authentication verification failed');
            }

            setCurrentUser(data.user);
            toast.success('Login successful');
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed. Please try again.');
            return {
                success: false,
                message: error.message || 'Login failed. Please try again.',
            };
        }
    };
    const register = async (data) => {
        try {
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || resData.message || 'Registration failed');
            }

            // Auto-login after registration
            if (data.username && data.password) {
                const loginResult = await login(data.username, data.password);
                if (loginResult.success) {
                    toast.success('Registration and login successful');
                    return { success: true, user: loginResult.user };
                }
            }

            toast.success('Registration successful');
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
            return {
                success: false,
                message: error.message || 'Registration failed',
            };
        }
    };

    const logout = async () => {
        try {
            await fetch(LOGOUT_URL, {
                method: 'POST',
                credentials: 'include',
            });
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        } finally {
            setCurrentUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await fetch(PROFILE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const updatedUser = await response.json();
            setCurrentUser(prev => ({ ...prev, ...updatedUser.user }));
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
            return { success: false, message: error.message };
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}