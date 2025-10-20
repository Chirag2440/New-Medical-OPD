import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDoctors } from '../redux/doctorSlice';
import { FaSearch, FaStar, FaUserMd, FaVideo } from 'react-icons/fa';

const DoctorList = () => {
  const dispatch = useDispatch();
  const { doctors, loading } = useSelector((state) => state.doctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors({ specialization, search: searchTerm, sortBy }));
  }, [dispatch, specialization, searchTerm, sortBy]);

  const specializations = [
    'All',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'General Medicine'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Find a Doctor</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec === 'All' ? '' : spec}>
                  {spec}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sort By</option>
              <option value="rating">Rating</option>
              <option value="experience">Experience</option>
              <option value="fees">Fees (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {doctor.userId?.photo ? (
                      <img
                        src={doctor.userId.photo}
                        alt={doctor.userId?.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
                        <FaUserMd className="text-3xl text-white" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Dr. {doctor.userId?.name}
                      </h3>
                      <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Qualification:</span> {doctor.qualification}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Experience:</span> {doctor.experience} years
                    </p>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-gray-800 font-medium">
                        {doctor.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({doctor.totalRatings} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">₹{doctor.fees}</p>
                      <p className="text-xs text-gray-500">per consultation</p>
                    </div>
                    <Link
                      to={`/book-appointment/${doctor._id}`}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaVideo />
                      <span>Book Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="text-center py-12">
            <FaUserMd className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No doctors found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;