// frontend/src/components/AppointmentCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaVideo, 
  FaHospital, 
  FaUserMd, 
  FaUser,
  FaFileDownload,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { useSelector } from 'react-redux';

const AppointmentCard = ({ appointment, onCancel, showActions = true }) => {
  const { user } = useSelector((state) => state.auth);
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <FaCheckCircle className="text-lg" />;
      case 'cancelled':
        return <FaTimes className="text-lg" />;
      default:
        return <FaClock className="text-lg" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };

  const isPastAppointment = new Date(appointment.appointmentDate) < new Date();
  const canJoinCall = appointment.status === 'confirmed' && 
                      appointment.consultationType === 'video' && 
                      !isPastAppointment;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {isPatient ? (
              // Show doctor info for patients
              <>
                {appointment.doctor?.userId?.photo ? (
                  <img
                    src={appointment.doctor.userId.photo}
                    alt={appointment.doctor.userId?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow">
                    <FaUserMd className="text-white text-xl" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Dr. {appointment.doctor?.userId?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.doctor?.specialization}
                  </p>
                </div>
              </>
            ) : (
              // Show patient info for doctors
              <>
                {appointment.patient?.photo ? (
                  <img
                    src={appointment.patient.photo}
                    alt={appointment.patient?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow">
                    <FaUser className="text-white text-xl" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {appointment.patient?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.patient?.email}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="text-xs font-semibold uppercase">
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-700">
            <FaCalendarAlt className="text-blue-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-sm">{formatDate(appointment.appointmentDate)}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <FaClock className="text-green-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-medium text-sm">
                {formatTime(appointment.timeSlot?.startTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Type */}
        <div className="flex items-center text-gray-700">
          {appointment.consultationType === 'video' ? (
            <FaVideo className="text-purple-500 mr-2" />
          ) : (
            <FaHospital className="text-orange-500 mr-2" />
          )}
          <div>
            <p className="text-xs text-gray-500">Consultation Type</p>
            <p className="font-medium text-sm capitalize">{appointment.consultationType}</p>
          </div>
        </div>

        {/* Symptoms (for doctors) */}
        {isDoctor && appointment.symptoms && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Symptoms</p>
            <p className="text-sm text-gray-700">{appointment.symptoms}</p>
          </div>
        )}

        {/* Prescription (if available) */}
        {appointment.prescription && appointment.prescription.medicines && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-green-800">Prescription Available</p>
              <FaFileDownload className="text-green-600" />
            </div>
            <p className="text-xs text-gray-600">
              {appointment.prescription.medicines.length} medicine(s) prescribed
            </p>
          </div>
        )}

        {/* Cancel Reason (if cancelled) */}
        {appointment.status === 'cancelled' && appointment.cancelReason && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-800 font-semibold mb-1">Cancellation Reason</p>
            <p className="text-sm text-gray-700">{appointment.cancelReason}</p>
          </div>
        )}

        {/* Payment Info */}
        {appointment.payment && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <span className="text-xs text-gray-600">Payment Status</span>
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {appointment.payment.status}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {showActions && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-3">
            {canJoinCall && (
              <Link
                to={`/video-consultation/${appointment.videoRoomId}`}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
              >
                <FaVideo />
                <span>Join Call</span>
              </Link>
            )}

            {appointment.status === 'pending' && onCancel && (
              <button
                onClick={() => onCancel(appointment._id)}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
            )}

            {appointment.prescription && isPatient && (
              <button
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FaFileDownload />
                <span>Download Prescription</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;