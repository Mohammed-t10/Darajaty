import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { generateTokensAndSetCookies } from "../utils/generateTokensAndSetCookies.js";
import { isValidEmail } from '../utils/validators.js';
import generateRandomPassword from '../utils/generateRandomPassword.js';


// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id || !password || String(id).length < 8 || String(password).length < 6) {
            return res.status(400).json({ success: false, message: 'Missing or invalid credentials' });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const resetPasswordValid = user.reset_passwd && user.reset_passwd_exp > Date.now();

            if (resetPasswordValid) {
                const isResetMatch = await bcrypt.compare(password, user.reset_passwd);
                if (!isResetMatch) {
                    return res.status(401).json({ success: false, message: 'Invalid credentials' });
                } else {
                    user.password = user.reset_passwd;
                }
            } else {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }

        const refreshToken = generateTokensAndSetCookies(res, user._id);

        user.refreshToken = refreshToken;

        user.lastLogin = new Date();
        user.reset_passwd = undefined;
        user.reset_passwd_exp = undefined;
        await user.save();

        const userObj = {
            id: user.id,
            name: user.name,
            isAdmin: user.isAdmin,
            role: user.role,
            email: user.email
        };
        return res.status(200).json({ success: true, message: 'Logged in successfully', user: userObj });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
    res.clearCookie('theme');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/checkAuth
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        const userObj = {
            id: user.id,
            name: user.name,
            isAdmin: user.isAdmin,
            role: user.role,
            email: user.email
        };
        res.status(200).json({ success: true, user: userObj });
    } catch (error) {
        res.status(400).json({ success: false, message: "An error has occured" });
    }
};

// POST /api/auth/resetPassword
export const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!newPassword || String(newPassword).length < 6 || !oldPassword || String(oldPassword).length < 6) {
            return res.status(400).json({ success: false, message: 'Misisng or invalid password' });
        }

        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: true, message: 'Server error' });
    }
};

// PUT /api/auth/updateEmail
export const updateEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Missing or invalid email' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.userId, { email }, { new: true });
        res.status(200).json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// POST /api/auth/sendNewPassword
export const sendNewPassword = async (req, res) => {
    try {
        const { id, email } = req.body;

        if (!email || !isValidEmail(email) || !id || String(id).length < 8) {
            return res.status(400).json({ success: false, message: 'Missing or invalid fields' });
        }

        const tempPassword = generateRandomPassword(8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = await User.findOneAndUpdate(
            { id, email },
            {
                reset_passwd: hashedPassword,
                reset_passwd_exp: new Date(Date.now() + 60 * 60 * 1000)
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not associated with provided account' });
        }

        // It’ll throw an error here (sendToEmail is not defined)
        sendToEmail(email, tempPassword);
        res.status(200).json({ success: true, message: 'New password sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/refresh-token
export const issueAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ success: false, message: 'Refresh token not provided' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json({ success: true, message: 'Access token refreshed' });
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};
