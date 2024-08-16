const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    console.log("newPassword");
    
    try {
        // Validate the new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match.' });
        }

        const user = await User.findById(req.user._id);

        user.password = await bcrypt.hash(newPassword, 8);
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    changePassword
};
