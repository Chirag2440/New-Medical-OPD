import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorManagement from './pages/DoctorManagement';
import PatientManagement from './pages/PatientManagement';
import AppointmentManagement from './pages/AppointmentManagement';
import PaymentManagement from './pages/PaymentManagement';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const PrivateRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <PrivateRoute>
              <DoctorManagement />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <PrivateRoute>
              <PatientManagement />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <PrivateRoute>
              <AppointmentManagement />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <PrivateRoute>
              <PaymentManagement />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;