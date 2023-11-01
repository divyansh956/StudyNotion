const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    },
});

async function generateOTP(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Mail", otp);
        console.log("Email Sent Successfully", mailResponse);
    }
    catch (err) {
        console.log("Error in sending mail", err);
        throw err;
    }
}

OTPSchema.pre('save', async function (next) {
    try {
        await generateOTP(this.email, this.otp);
        next();
    }
    catch (err) {
        console.log("Error in pre save", err);
        next(err);
    }
});

modules.exports = mongoose.model('OTP', OTPSchema);