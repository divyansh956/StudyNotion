const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("Successfully connected to MongoDB.");
        })
        .catch(err => {
            console.log('Could not connect to MongoDB.');
            console.log(err);
            process.exit();
        });
} 