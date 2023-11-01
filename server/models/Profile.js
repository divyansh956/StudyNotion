const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    about:
    {
        type: String,
        trim: true,
    },
    contactNumber:
    {
        type: Number,
        trim: true,
    },
});

modules.exports = mongoose.model('Profile', profileSchema);