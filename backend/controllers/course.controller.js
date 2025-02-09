import { Course } from "../models/course.model.js";
import { parseCoursesData } from '../utils/parseCourses.js';
import { isValidCourseData } from '../utils/validators.js';
import getCurrentSemester from '../utils/getCurrentSemester.js';

// Middleware for role checking
const isAdmin = (req) => req.user && req.user.isAdmin;
const isTutor = (req) => req.user && req.user.role === 'tutor';

// GET /api/courses/
export const getCourses = async (req, res) => {
  try {
    const semester = req.query.semester || getCurrentSemester();

    let courses;

    if (isAdmin(req)) {
      courses = await Course.find({
        semester,
        isActive: true,
      });
    } else if (isTutor(req)) {
      courses = await Course.find({
        tutorId: req.userId,
        semester: getCurrentSemester(),
        isActive: true,
      });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user?.isAdmin ? error.message : "Server error" });
  }
};

// POST /api/courses
export const createCourse = async (req, res) => {
    try {
        const { courseName, tutorId, semester, prac, maxMidterm, maxTermwork, maxFinal, studentsSubjectsGrades, activities } = req.body;

        const newCourse = new Course({
            courseName,
            tutorId,
            semester,
            prac: prac || false,
            maxMidterm,
            maxTermwork,
            maxFinal,
            studentsSubjectsGrades,
            activities
        });

        await newCourse.save();
        res.status(201).json({ success: true, message: 'Course created successfully', data: newCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/courses/:id
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const updateFields = {};
        for (const key in req.body) {
            if (req.body[key] !== undefined) {
                updateFields[key] = req.body[key];
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, message: 'Course updated successfully', data: updatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/courses/:id
export const updateCourseByTutor = async (req, res) => {
    const tutorId = req.userId;
    const { id } = req.params;
    const semester = getCurrentSemester();

    if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ success: false, message: "Missing required fields" });

    if (!isValidCourseData(req.body)) {
        return res.status(400).json({ success: false, message: "Invalid course data" });
    }

    try {
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: id, tutorId, semester, isActive: true },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "No course found or no changes were made" });
        }

        res.status(200).json({ success: true, message: "Course updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, message: 'Course deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/courses/student
export const getStudentData = async (req, res) => {
    const semester = req.query.semes;
    if (!semester || Number(semester) < 1 || Number(semester) > 15) {
        return res.status(400).json({ success: false, message: "Missing or invalid semester" });
    }

    try {
        const courses = await Course.find({
            semester: semester,
            isActive: true
        });

        const parsedCourses = parseCoursesData(req.userId, courses);
        res.status(200).json({ success: true, data: parsedCourses });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong, retry later." });
    }
};
