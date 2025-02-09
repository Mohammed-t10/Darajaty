import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// User auth
export const authenticateUser = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }

    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Student auth
export const authenticateStudent = async (req, res, next) => {
  const student = await User.findOne({
    _id: req.userId,
    role: "student",
    isActive: true,
  });

  if (!student)
    return res
      .status(403)
      .json({ success: false, message: "Forbidden - student-only action" });
  req.user = student;
  next();
};

// Admin auth
export const authenticateAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
      isAdmin: true,
      isActive: true,
    });

    if (user) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Forbidden - admin-only action" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Tutor auth
export const authenticateTutor = async (req, res, next) => {
  const tutor = await User.findOne({
    _id: req.userId,
    role: "tutor",
    isActive: true,
  });

  if (!tutor)
    return res
      .status(403)
      .json({ success: false, message: "Forbidden - tutor-only action" });
  next();
};

// Restrict authenticated access
export const restrictAuthenticated = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded)
        return res
          .status(401)
          .json({
            success: false,
            message: "No token provided, please log in",
          });

      return res
        .status(200)
        .json({ success: true, message: "Already authenticated" });
    } catch (error) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid token, please log in again",
        });
    }
  }
  next();
};

export const authenticateAdminOrTutor = async (req, res, next) => {
  const user = await User.findOne({
    _id: req.userId,
    isActive: true,
  });

  if (user && (user.role === "tutor" || user.isAdmin)) {
    req.user = user;
    return next();
  }
  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden - tutor or admin action only",
    });
};
