const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, sortBy } = req.query;
    
    let query = { isApproved: true };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query)
      .populate('userId', 'name email phone photo address');

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(doctor => 
        searchRegex.test(doctor.userId?.name) || 
        searchRegex.test(doctor.specialization)
      );
    }

    if (sortBy === 'rating') {
      doctors.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      doctors.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'fees') {
      doctors.sort((a, b) => a.fees - b.fees);
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone photo address');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const updates = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'doctors');
      await User.findByIdAndUpdate(req.user.id, { photo: result.secure_url });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone photo');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await User.findByIdAndDelete(doctor.userId);
    await doctor.remove();

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    
    const doctor = await Doctor.findOne({ userId: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};