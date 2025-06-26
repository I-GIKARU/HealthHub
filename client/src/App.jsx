import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './Layout/Layout';
import PrivateRoute from './components/PrivateRoute';

// Auth pages
import Login from './components/Login';
import Register from './components/Register';

// Dashboards
import PatientDashboard from './components/PatientDashboard';
import AdminDashboard from './components/AdminDashboard';
import ClinicDashboard from './components/ClinicDashboard';

// Clinic pages
import Home from './pages/Home';
import ClinicList from './pages/ClinicList';
import AddClinic from './pages/AddClinic';
import ManageClinics from './pages/ManageClinics';
import ClinicDetail from './components/ClinicDetail';
import EditClinic from './components/EditClinic';
import NotFound from './pages/NotFound';
import AddInsuranceForm from './components/AddInsuranceForm.jsx';
import AddServiceForm from './components/AddServiceForm.jsx';
import ClinicProfileForm from "./components/ClinicProfileForm.jsx";
import BookAppointment from "./components/BookAppointment.jsx";
import AddReview from "./components/AddReview.jsx";
import ClinicAppointments from "./components/ClinicAppointments.jsx";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />

                <Routes>
                    <Route
                        path="/login"
                        element={
                            <Layout>
                                <Login />
                            </Layout>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <Layout>
                                <Register />
                            </Layout>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Home />
                            </Layout>
                        }
                    />
                    <Route
                        path="/clinics"
                        element={
                            <Layout>
                                <ClinicList />
                            </Layout>
                        }
                    />
                    <Route
                        path="/clinics/:id"
                        element={
                            <Layout>
                                <ClinicDetail />
                            </Layout>
                        }
                    />
                    <Route
                        path="/add-clinic"
                        element={
                            <Layout>
                                <AddClinic />
                            </Layout>
                        }
                    />
                    <Route
                        path="/manage-clinics"
                        element={
                            <Layout>
                                <ManageClinics />
                            </Layout>
                        }
                    />
                    <Route
                        path="/edit-clinic/:id"
                        element={
                            <Layout>
                                <EditClinic />
                            </Layout>
                        }
                    />
                    {/* Protected dashboard routes */}
                    <Route
                        path="/patient"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <PatientDashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute role="admin">
                                <Layout>
                                    <AdminDashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/clinic"
                        element={
                            <PrivateRoute role="clinic">
                                <Layout>
                                    <ClinicDashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/add-service"
                        element={
                            <Layout>
                                <AddServiceForm />
                            </Layout>
                        }
                    />
                    <Route
                        path="/add-insurance"
                        element={
                            <Layout>
                                <AddInsuranceForm />
                            </Layout>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Layout>
                                <NotFound />
                            </Layout>
                        }
                    />
                    <Route
                        path="/edit-clinic"
                        element={
                            <Layout>
                                <ClinicProfileForm />
                            </Layout>
                        }
                    />
                    <Route
                        path="/clinics/:id/book"
                        element={
                            <Layout>
                                <BookAppointment />
                            </Layout>
                        }
                    />
                    <Route
                        path="/clinics/:id/review"
                        element={
                            <Layout>
                                <AddReview />
                            </Layout>
                        }
                    />
                    <Route
                        path="/appointments"
                        element={
                            <Layout>
                                <ClinicAppointments />
                            </Layout>
                        }
                    />



                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
