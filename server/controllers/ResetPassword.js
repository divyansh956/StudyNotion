const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Generate a password reset token and send an email with the reset link
exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });

		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us. Enter a Valid Email.`,
			});
		}

		// Generate a random token for password reset
		const token = crypto.randomBytes(20).toString("hex");

		// Update user details with the reset token and expiration time
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000, // Token expiration time: 1 hour
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

		const url = `http://localhost:3000/update-password/${token}`;

		// Send an email with the password reset link
		await mailSender(
			email,
			"Password Reset",
			`Your link for email verification is ${url}. Please click this URL to reset your password.`
		);

		res.json({
			success: true,
			message: "Email Sent Successfully. Please Check Your Email to Continue Further.",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: "Some Error in Sending the Reset Message.",
		});
	}
};

// Reset the user password using the provided token
exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Do Not Match.",
			});
		}

		// Find user details by the reset token
		const userDetails = await User.findOne({ token: token });

		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid.",
			});
		}

		// Check if the token is expired
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: "Token is Expired. Please Regenerate Your Token.",
			});
		}

		// Encrypt the new password and update user details
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);

		res.json({
			success: true,
			message: "Password Reset Successful.",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: "Some Error in Updating the Password.",
		});
	}
};