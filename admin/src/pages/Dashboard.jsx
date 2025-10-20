import React, { useEffect, useState } from 'react';
import { FaUserMd, FaUsers, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/StatsCard';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setRecentAppointments(response.data.recentAppointments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const appointmentData = [
    { month: 'Jan', appointments: 65 },
    { month: 'Feb', appointments: 78 },
    { month: 'Mar', appointments: 90 },
    { month: 'Apr', appointments: 81 },
    { month: 'May', appointments: 95 },
    { month: 'Jun', appointments: 112 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 61000 },
    { month: 'Apr', revenue: 58000 },
    { month: 'May', revenue: 67000 },
    { month: 'Jun', revenue: 75000 }
  ];

  const specializationData = [
    { name: 'Cardiology', value: 35 },
    { name: 'Dermatology', value: 25 },
    { name: 'Pediatrics', value: 20 },
    { name: 'Orthopedics', value: 15 },
    { name: 'Others', value: 5 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={FaUserMd}
          color="bg-blue-500"
          change={12}
        />
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={FaUsers}
          color="bg-green-500"
          change={8}
        />
        <StatsCard
          title="Appointments"
          value={stats.totalAppointments}
          icon={FaCalendarAlt}
          color="bg-yellow-500"
          change={-3}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-purple-500"
          change={15}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specialization Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Specializations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={specializationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {specializationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.slice(0, 5).map((appointment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{appointment.patient?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{appointment.doctor?.userId?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;