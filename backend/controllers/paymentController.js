const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

exports.createOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        patientId: req.user.id
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user.id,
      doctor: appointment.doctor,
      amount: amount,
      razorpayOrderId: order.id
    });

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpaySignature === expectedSign) {
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          razorpayPaymentId,
          razorpaySignature,
          status: 'success'
        },
        { new: true }
      );

      await Appointment.findByIdAndUpdate(payment.appointment, {
        payment: payment._id,
        status: 'confirmed'
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    } else {
      await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patient: req.user.id }
      : req.user.role === 'doctor'
      ? { doctor: req.user.id }
      : {};

    const payments = await Payment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'specialization')
      .populate('appointment')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100
    });

    payment.status = 'refunded';
    payment.refund = {
      amount: payment.amount,
      reason,
      status: 'completed',
      refundId: refund.id,
      refundedAt: new Date()
    };
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};