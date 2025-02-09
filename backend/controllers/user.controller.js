import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { isValidEmail } from '../utils/validators.js';

const RESTRICTED_ID = "67900438e10aba5af6cdca3d";

// GET /api/users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -reset_passwd -reset_passwd_exp -lastLogin -createdAt -updatedAt -refreshToken');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// GET /api/users/students
export const getStudents = async (req, res) => {
    try {
        const query = req.user?.isAdmin
            ? { role: "student" }
            : { role: "student", isActive: true };

        const projection = req.user?.isAdmin
            ? { password: 0, reset_passwd: 0, reset_passwd_exp: 0, lastLogin: 0, createdAt: 0, updatedAt: 0, refreshToken: 0 }
            : { name: 1 };

        const students = await User.find(query, projection).sort({ name: 1 });

        res.status(200).json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
};

// GET /api/users/tutors
export const getTutors = async (req, res) => {
    try {
        const tutors = await User.find(
            { role: "tutor" },
            {
                password: 0,
                reset_passwd: 0,
                reset_passwd_exp: 0,
                lastLogin: 0,
                createdAt: 0,
                updatedAt: 0,
                refreshToken: 0
            }
        ).sort({ name: 1 });

        res.status(200).json({ success: true, tutors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching tutors' });
    }
};

// POST /api/users
export const createUser = async (req, res) => {
    const { id, name, email, password, role, isAdmin } = req.body;

    if (!name || !password || !role || !id || String(id).length !== 8) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    if (email && !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
        const existingUser = isValidEmail(email) ? await User.findOne({ email }) : undefined;
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            id,
            name,
            email,
            password: hashedPassword,
            role,
            isAdmin: isAdmin || false
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/users/:id
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, isAdmin } = req.body;
    let { password } = req.body;

    if (id === RESTRICTED_ID) {
        return res.status(403).json({ success: false, message: "This user cannot be modified" });
    }

    if (email && !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (isAdmin !== undefined) updateFields.isAdmin = isAdmin;

    /*

    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        updateFields.password = await bcrypt.hash(password, 10);
    }

    */

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (id === RESTRICTED_ID) {
        return res.status(403).json({ success: false, message: "This user cannot be modified" });
    }

    try {
        const deletedUser = await User.findOneAndUpdate(
            { _id: id },
            { isActive: false },
            { new: true }
        );

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
