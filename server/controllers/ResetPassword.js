const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

exports.resetPasswordToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 3600000 }, { new: true });
        const url = `https://localhost:3000/reset-password/${token}`;

        await mailSender.sendMail(email, 'Reset Password', url);
        return res.status(200).json({ message: 'Reset password link sent to email' });
    }
    catch (error) {
        console.log(error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password, conformPassword, token } = req.body;

        if (password !== conformPassword) {
            return res.status(400).json({ message: 'Password and confirm password not match' });
        }

        const UserDetails = await User.findOne({ token: token });
        if (!UserDetails) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (UserDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Token expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await user.findOneAndUpdate({ token: token }, { password: hashedPassword }, { new: true });

        return res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.log(error);
    }
}