const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    }],
});

modules.exports = mongoose.model('Tags', tagsSchema);