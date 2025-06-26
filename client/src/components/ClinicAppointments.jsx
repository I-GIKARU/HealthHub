import React from 'react';
import useClinicAppointments from '../utils/useClinicAppointments';
import { format } from 'date-fns';

function ClinicAppointments() {
    const { appointments, loading, updateStatus } = useClinicAppointments();

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Appointments</h2>

            {loading ? (
                <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <div className="space-y-4">
                    {appointments.map(appt => (
                        <div key={appt.id} className="bg-white border rounded p-4 shadow-sm">
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {appt.patient?.name} — {appt.service?.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        {format(new Date(appt.appointment_date), 'PPpp')}
                                    </p>
                                    <p className="text-sm text-gray-500">Status: {appt.status}</p>
                                </div>
                                <div className="flex gap-2">
                                    {appt.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(appt.id, 'confirmed')}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        >
                                            Confirm
                                        </button>
                                    )}
                                    {appt.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateStatus(appt.id, 'completed')}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClinicAppointments;
