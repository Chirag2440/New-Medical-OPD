import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserMd, FaUsers, FaCalendarAlt, FaMoneyBillWave, FaUserShield } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/doctors', icon: FaUserMd, label: 'Doctors' },
    { path: '/patients', icon: FaUsers, label: 'Patients' },
    { path: '/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/payments', icon: FaMoneyBillWave, label: 'Payments' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <FaUserShield className="text-3xl text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">MediCare</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;