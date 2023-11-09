const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const category = await Category.findOne({ name: name });
        if (category) {
            return res.status(400).json({ message: 'Tag already exists' });
        }

        const newCategory = await Category.create({
            name: name,
            description: description,
        });

        return res.status(200).json({ message: 'Tag created successfully', data: newCategory });
    }
    catch (error) {
        console.log(error);
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const category = await Category.find({}, { name: true, description: true });

        return res.status(200).json({ category });
    }
    catch (error) {
        console.log(error);
    }
};