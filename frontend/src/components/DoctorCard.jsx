// frontend/src/components/DoctorCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaStar, FaVideo, FaHospital, FaGraduationCap, FaBriefcase } from 'react-icons/fa';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Doctor Header */}
      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
        <div className="flex items-center space-x-4">
          {doctor.userId?.photo ? (
            <img
              src={doctor.userId.photo}
              alt={doctor.userId?.name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <FaUserMd className="text-4xl text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              Dr. {doctor.userId?.name}
            </h3>
            <p className="text-blue-100 text-sm font-medium">
              {doctor.specialization}
            </p>
            {doctor.isApproved && (
              <span className="inline-block mt-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Details */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          {/* Qualification */}
          <div className="flex items-center text-gray-700">
            <FaGraduationCap className="text-blue-500 mr-3 text-lg" />
            <div>
              <p className="text-xs text-gray-500">Qualification</p>
              <p className="font-medium text-sm">{doctor.qualification}</p>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center text-gray-700">
            <FaBriefcase className="text-green-500 mr-3 text-lg" />
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="font-medium text-sm">{doctor.experience} years</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-lg" />
              <span className="text-gray-800 font-bold text-lg">
                {doctor.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500 text-sm ml-2">
              ({doctor.totalRatings} {doctor.totalRatings === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Languages (if available) */}
          {doctor.languages && doctor.languages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Languages</p>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.slice(0, 3).map((lang, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {doctor.bio && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-2">
              {doctor.bio}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="text-2xl font-bold text-blue-600">₹{doctor.fees}</p>
          </div>
          
          <Link
            to={`/book-appointment/${doctor._id}`}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
          >
            <FaVideo className="text-lg" />
            <span>Book Now</span>
          </Link>
        </div>

        {/* Consultation Types */}
        <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-600 text-sm">
            <FaVideo className="mr-1 text-blue-500" />
            <span>Video Call</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaHospital className="mr-1 text-green-500" />
            <span>In-Person</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;