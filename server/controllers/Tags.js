const Tag = require('../models/Tags');

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const tag = await Tag.findOne({ name: name });
        if (tag) {
            return res.status(400).json({ message: 'Tag already exists' });
        }

        const newTag = await Tag.create({
            name: name,
            description: description,
        });

        return res.status(200).json({ message: 'Tag created successfully' });
    }
    catch (error) {
        console.log(error);
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find({}, { name: true, description: true });

        return res.status(200).json({ tags });
    }
    catch (error) {
        console.log(error);
    }
};