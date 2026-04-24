# MERN Medical OPD Application

A complete Medical OPD (Outpatient Department) management system built with MERN stack featuring video consultations, payment integration, and comprehensive admin controls.

Frontend URL -> [https://new-medical-opd-1.onrender.com](https://new-medical-opd-1.onrender.com)
Admin URL -> [https://new-medical-opd-2.onrender.com](https://new-medical-opd-2.onrender.com)

## 🚀 Features

### Patient Features
- ✅ User registration and authentication
- ✅ Browse and search doctors by specialization
- ✅ Book video/in-person appointments
- ✅ Online payment via Razorpay
- ✅ Video consultation using WebRTC
- ✅ View appointment history
- ✅ Profile management with photo upload

### Doctor Features
- ✅ Doctor registration with credentials
- ✅ View and manage appointments
- ✅ Accept/Reject appointment requests
- ✅ Video consultation with patients
- ✅ Add prescriptions
- ✅ Manage availability
- ✅ Dashboard with statistics

### Admin Features
- ✅ Complete dashboard with analytics
- ✅ Approve/Reject doctor registrations
- ✅ Manage patients and doctors (CRUD)
- ✅ Monitor all appointments
- ✅ Track payments and revenue
- ✅ User management system

## 📁 Project Structure

```
medical-opd/
├── backend/              # Express.js backend
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/            # React frontend (Patient/Doctor)
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # Redux store & slices
│   │   ├── services/    # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
└── admin/               # React admin panel
    ├── public/
    ├── src/
    │   ├── components/  # Admin components
    │   ├── pages/       # Admin pages
    │   ├── redux/       # Redux store
    │   ├── services/    # API services
    │   ├── App.js
    │   └── index.js
    ├── .env
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Socket.io** - Real-time communication

### Frontend
- **React** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Socket.io Client** - WebSocket client
- **Simple Peer** - WebRTC
- **React Toastify** - Notifications
- **React Icons** - Icons

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- Cloudinary account
- Razorpay account

## 🔧 Installation

### 1. Clone the repository
```bash
git clone 
cd medical-opd
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-opd
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

Run backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm start
```

### 4. Admin Panel Setup

```bash
cd ../admin
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3001
```

Run admin panel:
```bash
npm start
```

## 🔑 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| RAZORPAY_KEY_ID | Razorpay key ID |
| RAZORPAY_KEY_SECRET | Razorpay key secret |
| FRONTEND_URL | Frontend URL |
| ADMIN_URL | Admin panel URL |

### Frontend & Admin (.env)
| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |
| PORT | Development server port |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Doctors
- `GET /api/doctors` - Get all approved doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor profile
- `DELETE /api/doctors/:id` - Delete doctor

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `PUT /api/appointments/:id/prescription` - Add prescription

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund/:id` - Process refund

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/patients/:id` - Get patient by ID
- `PUT /api/admin/approve-doctor/:id` - Approve doctor
- `DELETE /api/admin/users/:id` - Delete user

## 🎯 Usage

### For Patients
1. Register as a patient
2. Browse available doctors
3. Book an appointment
4. Make payment via Razorpay
5. Join video consultation at scheduled time

### For Doctors
1. Register as a doctor (requires admin approval)
2. Wait for admin approval
3. Manage appointments from dashboard
4. Accept/Reject appointment requests
5. Conduct video consultations
6. Add prescriptions

### For Admin
1. Login with admin credentials
2. View dashboard statistics
3. Approve doctor registrations
4. Manage users (patients & doctors)
5. Monitor appointments and payments

## 🔐 Default Admin Credentials

Create admin user manually in MongoDB:
```javascript
{
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$12$hashedpassword", // Hash your password
  role: "admin",
  phone: "1234567890",
  isActive: true
}
```
