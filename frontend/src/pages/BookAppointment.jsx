import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createAppointment } from '../redux/appointmentSlice';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaClock, FaVideo, FaHospital, FaNotesMedical } from 'react-icons/fa';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: { startTime: '', endTime: '' },
    symptoms: '',
    consultationType: 'video'
  });

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      setDoctor(response.data.doctor);
    } catch (error) {
      toast.error('Failed to fetch doctor details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTimeSlotChange = (slot) => {
    setFormData({
      ...formData,
      timeSlot: slot
    });
  };

  const handlePayment = async () => {
    if (!formData.appointmentDate || !formData.timeSlot.startTime || !formData.symptoms) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create appointment first
      const appointmentResponse = await dispatch(createAppointment({
        doctorId: doctor._id,
        ...formData
      })).unwrap();

      const appointmentId = appointmentResponse.appointment._id;
      
      // Create Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        appointmentId,
        amount: doctor.fees
      });

      const { order, key, paymentId } = orderResponse.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: 'MediCare',
          description: 'Appointment Booking',
          order_id: order.id,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await api.post('/payments/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: paymentId
              });

              if (verifyResponse.data.success) {
                toast.success('Appointment booked successfully!');
                navigate('/patient/dashboard');
              }
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function() {
              toast.info('Payment cancelled');
              setLoading(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(false);
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  const availableSlots = [
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '09:30', endTime: '10:00' },
    { startTime: '10:00', endTime: '10:30' },
    { startTime: '10:30', endTime: '11:00' },
    { startTime: '11:00', endTime: '11:30' },
    { startTime: '14:00', endTime: '14:30' },
    { startTime: '14:30', endTime: '15:00' },
    { startTime: '15:00', endTime: '15:30' },
    { startTime: '15:30', endTime: '16:00' },
    { startTime: '16:00', endTime: '16:30' }
  ];

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Doctor Info Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center space-x-4">
              {doctor.userId?.photo ? (
                <img
                  src={doctor.userId.photo}
                  alt={doctor.userId.name}
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
                  {doctor.userId?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">Dr. {doctor.userId?.name}</h1>
                <p className="text-blue-100 text-lg">{doctor.specialization}</p>
                <p className="text-blue-100">{doctor.qualification}</p>
                <p className="text-blue-100">{doctor.experience} years experience</p>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold">
                ₹{doctor.fees} / consultation
              </span>
              <span className="bg-blue-500 px-4 py-2 rounded-full">
                ⭐ {doctor.rating.toFixed(1)} ({doctor.totalRatings} reviews)
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>

            <div className="space-y-6">
              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, consultationType: 'video' })}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                      formData.consultationType === 'video'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FaVideo />
                    <span className="font-medium">Video Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, consultationType: 'in-person' })}
                    className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                      formData.consultationType === 'in-person'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FaHospital />
                    <span className="font-medium">In-Person</span>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendar className="inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaClock className="inline mr-2" />
                  Select Time Slot
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTimeSlotChange(slot)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                        formData.timeSlot.startTime === slot.startTime
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaNotesMedical className="inline mr-2" />
                  Describe Your Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please describe your symptoms in detail..."
                  required
                ></textarea>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">Dr. {doctor.userId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-medium">{doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Type:</span>
                    <span className="font-medium capitalize">{formData.consultationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formData.appointmentDate || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formData.timeSlot.startTime || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-300">
                    <span className="text-gray-800 font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">₹{doctor.fees}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;