// controllers/common/addFirstAdminUser.js

const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../../models/User'); // Import the User model

// Add First Admin User
const addFirstAdminUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the database is empty (i.e., no users exist)
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
        return res.status(400).json({
            success: false,
            message: 'Admin user already exists. Cannot add a new first admin.',
        });
    }

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.',
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const adminUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
    });

    res.status(201).json({
        success: true,
        message: 'First admin user created successfully.',
        user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
        },
    });
});

module.exports = {
    addFirstAdminUser,
};
