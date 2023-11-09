const e = require('express');
const Course = require('../models/Course');
const Tag = require('../models/Category');
const User = require('../models/User');
const { uploadImage } = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;

        const thumbnail = req.files.thumbnail

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        if (!thumbnail) {
            return res.status(400).json({ message: 'Please upload thumbnail' });
        }

        const userId = req.user.id;
        const InstructorDetails = await User.findById(userId);
        // TODO check if userId and instrcutorId is same or different ?

        if (!InstructorDetails) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        const thumbnailImage = await uploadImagetoCloudinary(thumbnail, process.env.FOLDER_NAME, 300, 100);

        const newCourse = await Course.create({
            courseName: courseName,
            courseDescription: courseDescription,
            whatYouWillLearn: whatYouWillLearn,
            price: price,
            thumbnail: thumbnailImage,
            tag: tagDetails._id,
            instructor: InstructorDetails._id,
        });

        await User.findByIdAndUpdate({ id: InstructorDetails._id }, { $push: { course: newCourse._id } }, { new: true });

        // TODO add in tag also

        return res.status(200).json({ message: 'Course created successfully' });
    }
    catch (error) {
        console.log(error);
    }
}

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}, { courseName: true, courseDescription: true, whatYouWillLearn: true, price: true, thumbnail: true, tag: true, instructor: true });

        return res.status(200).json({ courses });
    }
    catch (error) {
        console.log(error);
    }
}
