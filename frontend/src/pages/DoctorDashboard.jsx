import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAppointments, updateAppointment } from '../redux/appointmentSlice';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaVideo, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    dispatch(fetchAppointments({}));
  }, [dispatch]);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await dispatch(updateAppointment({ id: appointmentId, data: { status } })).unwrap();
      toast.success(`Appointment ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const todayAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  );

  const filteredAppointments =
    selectedTab === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status === selectedTab);

  const stats = {
    total: appointments.length,
    today: todayAppointments.length,
    pending: appointments.filter((apt) => apt.status === 'pending').length,
    completed: appointments.filter((apt) => apt.status === 'completed').length
  };

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
          <h1 className="text-3xl font-bold text-gray-800">Dr. {user?.name}'s Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your appointments and patients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</h3>
              </div>
              <FaCalendarAlt className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Appointments</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.today}</h3>
              </div>
              <FaUsers className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</h3>
              </div>
              <FaMoneyBillWave className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.completed}</h3>
              </div>
              <FaCheck className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b">
            {['all', 'pending', 'confirmed', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-2 px-4 font-medium capitalize ${
                  selectedTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {appointment.patient?.photo ? (
                        <img
                          src={appointment.patient.photo}
                          alt={appointment.patient?.name}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {appointment.patient?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {appointment.patient?.name}
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                          {appointment.timeSlot?.startTime}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>

                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            <FaCheck />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            <FaTimes />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {appointment.consultationType === 'video' &&
                        appointment.status === 'confirmed' && (
                          <Link
                            to={`/video-consultation/${appointment.videoRoomId}`}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <FaVideo />
                            <span>Start Call</span>
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
              <p className="text-gray-600">No appointments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;