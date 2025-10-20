import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaVideo, FaCalendarCheck, FaShieldAlt, FaClock, FaHeart } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: FaUserMd,
      title: 'Expert Doctors',
      description: 'Connect with qualified and experienced doctors from various specializations'
    },
    {
      icon: FaVideo,
      title: 'Video Consultation',
      description: 'Get medical advice from the comfort of your home with secure video calls'
    },
    {
      icon: FaCalendarCheck,
      title: 'Easy Booking',
      description: 'Book appointments instantly with your preferred doctors at your convenience'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and completely confidential'
    },
    {
      icon: FaClock,
      title: '24/7 Availability',
      description: 'Access healthcare services anytime, anywhere, any day of the week'
    },
    {
      icon: FaHeart,
      title: 'Quality Care',
      description: 'Receive top-notch medical care from certified healthcare professionals'
    }
  ];

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'General Medicine',
    'Gynecology'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Your Health, Our Priority
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Connect with certified doctors online. Get instant medical consultations, 
                prescriptions, and healthcare advice anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/doctors"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-center"
                >
                  Find Doctors
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop"
                alt="Doctor"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose MediCare?
            </h2>
            <p className="text-xl text-gray-600">
              Experience healthcare like never before with our innovative platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="text-3xl text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Specializations
            </h2>
            <p className="text-xl text-gray-600">
              Find expert doctors across multiple specializations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specializations.map((spec, index) => (
              <Link
                key={index}
                to={`/doctors?specialization=${spec}`}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl text-center hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <FaUserMd className="text-4xl text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800">{spec}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Create Account
              </h3>
              <p className="text-gray-600">
                Sign up and complete your profile in minutes
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Book Appointment
              </h3>
              <p className="text-gray-600">
                Choose your doctor and book a convenient time slot
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Get Consultation
              </h3>
              <p className="text-gray-600">
                Connect via video call and receive expert medical advice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Healthcare Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied patients who trust MediCare for their health needs
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">500+</h3>
              <p className="text-gray-600">Expert Doctors</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">10k+</h3>
              <p className="text-gray-600">Happy Patients</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">50k+</h3>
              <p className="text-gray-600">Consultations</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">4.8/5</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;