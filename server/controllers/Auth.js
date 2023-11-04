const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');


exports.sendOTP = async (req, res) => {

    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(400).json({ error: 'User already exists' });
        }

        var otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        console.log("OTP generated: ", otp);

        var result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
            result = await OTP.findOne({ otp: otp });
        }

        const newOTP = new OTP({
            email,
            otp
        });

        const otpBody = await OTP.create(newOTP);
        console.log(otpBody);

        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        if (!recentOtp) {
            return res.status(400).json({ error: 'OTP not Found' });
        }
        else if (recentOtp.otp !== otp) {
            return res.status(400).json({ error: 'OTP is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const profileDetails = {
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        };

        const user = await User.create({ firstName, lastName, email, password: hashedPassword, accountType, additionalDetails: profileDetails._id, image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`, });

        return res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ result: existingUser, token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { email, password, newPassword, confirmNewPassword } = req.body;

        if (!email || !password || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.updateOne({ email }, { password: hashedPassword });

        return res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};