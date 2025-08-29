const profileModel = require('../model/profileModel');

// GET /profile/:userId
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await profileModel.getProfileById(userId,null);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getEmployeeProfile = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const profile = await profileModel.getProfileById(null,employeeId);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error('Error fetching employee profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /profile/edit/:profileId
exports.editProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { profile_image_url , userId } = req.body;
        console.log(typeof profileId , profile_image_url , userId);

        await profileModel.updateProfile(profileId,userId,null, {
            profile_image_url
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.editEmployeeProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { profile_image_url , employee_id } = req.body;
        console.log(typeof profileId , profile_image_url , employee_id);

        await profileModel.updateProfile(profileId,null,employee_id, {
            profile_image_url
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating employee profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
