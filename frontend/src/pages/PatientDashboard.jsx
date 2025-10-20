import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAppointments } from '../redux/appointmentSlice';
import { FaCalendarAlt, FaVideo, FaFileDownload, FaClock } from 'react-icons/fa';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAppointments({}));
  }, [dispatch]);

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointmentDate) >= new Date() && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.appointmentDate) < new Date() || apt.status === 'completed'
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your appointments and health records</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {appointments.length}
                </h3>
              </div>
              <FaCalendarAlt className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {upcomingAppointments.length}
                </h3>
              </div>
              <FaClock className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {pastAppointments.length}
                </h3>
              </div>
              <FaFileDownload className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
            <Link
              to="/doctors"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Book New
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {appointment.doctor?.userId?.photo ? (
                        <img
                          src={appointment.doctor.userId.photo}
                          alt={appointment.doctor.userId?.name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {appointment.doctor?.userId?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Dr. {appointment.doctor?.userId?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.specialization}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                          {appointment.timeSlot?.startTime}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                      {appointment.consultationType === 'video' &&
                        appointment.status === 'confirmed' && (
                          <Link
                            to={`/video-consultation/${appointment.videoRoomId}`}
                            className="mt-2 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            <FaVideo />
                            <span>Join Call</span>
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link
                to="/doctors"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Book an appointment
              </Link>
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Past Appointments</h2>

          {pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Dr. {appointment.doctor?.userId?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.doctor?.specialization}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                      {appointment.prescription && (
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold">
                          View Prescription
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No past appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;