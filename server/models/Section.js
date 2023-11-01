const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
    },
    subSections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSection',
        required: true,
    }],
});

modules.exports = mongoose.model('Section', sectionSchema);