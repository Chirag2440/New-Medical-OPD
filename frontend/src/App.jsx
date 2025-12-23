import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMe } from './redux/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorList from './pages/DoctorList';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import VideoConsultation from './pages/VideoConsultation';
import ChatPage from './pages/ChatPage';
import AIChatbot from './components/chatBot/AIChatbot';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<DoctorList />} />
            
            {/* Doctor Routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <PrivateRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/book-appointment/:doctorId" 
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <BookAppointment />
                </PrivateRoute>
              } 
            />
            
            {/* Common Private Routes */}
            <Route 
              path="/video-consultation/:roomId" 
              element={
                <PrivateRoute>
                  <VideoConsultation />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Chat Route - Protected */}
            <Route 
              path="/chats" 
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              } 
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
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
        <AIChatbot />
      </div>
    </Router>
  );
}

export default App;