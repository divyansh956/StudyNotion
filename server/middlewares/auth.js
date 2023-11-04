const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        // console.log(req.headers);
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // console.log(token);
        const isCustomAuth = token.length < 500;
        let decodedData;
        if (token && isCustomAuth) {
            decodedData = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decodedData);
            req.userId = decodedData.id;
        }
        else {
            decodedData = jwt.decode(token);
            // console.log(decodedData);
            req.userId = decodedData.sub;
        }
        next();
    }
    catch (error) {
        console.log(error);
    }
};

exports.isStudent = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role === 'Student') {
            next();
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        console.log(error);
    }
};

exports.isInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role === 'Instructor') {
            next();
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        console.log(error);
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role === 'Admin') {
            next();
        }
        else {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    catch (error) {
        console.log(error);
    }
};