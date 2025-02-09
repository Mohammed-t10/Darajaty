import { Course } from "../models/course.model.js";
import getCurrentSemester from '../utils/getCurrentSemester.js';

const isAdmin = (req) => req.user && req.user.isAdmin;
const isTutor = (req) => req.user && req.user.role === 'tutor';

// POST /api/courses/activities
export const createActivity = async (req, res) => {
  const { courseId } = req.params;
  const { name, description, maxGrade, semester } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const currentSemester = semester || getCurrentSemester();

    if (isAdmin(req)) {
      if (semester) query.semester = semester;
    } else if (isTutor(req)) {
      if (course.tutorId !== req.userId || getCurrentSemester() !== course.semester) {
        return res.status(403).json({ success: false, message: 'Not authorized to add activity for this course' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const newActivity = {
      name,
      description,
      maxGrade,
      studentGrades: [],
    };

    course.activities.push(newActivity);

    await course.save();

    const savedActivity = course.activities[course.activities.length - 1];

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity: savedActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user?.isAdmin ? error.message : 'Server error' });
  }
};

// PATCH /api/courses/:courseId/activities/:activityId
export const updateActivityGrades = async (req, res) => {
  const { courseId, activityId } = req.params;
  const semester = req.query.semester || getCurrentSemester();
  const { studentGrades } = req.body;

  try {
    const query = { _id: courseId, isActive: true, "activities._id": activityId };

    if (req.user?.isAdmin) {
      if (semester) query.semester = semester;
    } else if (req.user?.role === "tutor") {
      query.tutorId = req.userId;
      query.semester = getCurrentSemester();
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const course = await Course.findOneAndUpdate(
      query,
      {
        $set: {
          "activities.$.studentGrades": studentGrades,
        },
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course or activity not found" });
    }

    res.status(200).json({
      success: true,
      message: "Activity grades updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user?.isAdmin ? error.message : 'Server error' });
  }
};

// PUT /api/courses/:courseId/activities/:activityId
export const updateActivityDetails = async (req, res) => {
  const { courseId, activityId } = req.params;
  const { name, description, maxGrade } = req.body;
  const semester = req.query.semester || getCurrentSemester();

  try {
    const query = { _id: courseId, isActive: true, "activities._id": activityId };

    if (req.user?.isAdmin) {
      if (semester) query.semester = semester;
    } else if (req.user?.role === "tutor") {
      query.tutorId = req.userId;
      query.semester = getCurrentSemester();
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const course = await Course.findOneAndUpdate(
      query,
      {
        $set: {
          "activities.$.name": name,
          "activities.$.description": description,
          "activities.$.maxGrade": maxGrade,
        },
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course or activity not found" });
    }

    res.status(200).json({
      success: true,
      message: "Activity details updated successfully",
      course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user?.isAdmin ? error.message : 'Server error' });
  }
};

// DELETE /api/courses/:courseId/activities/:activityId
export const deleteActivity = async (req, res) => {
  const { courseId, activityId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const currentSemester = req.query.semester || getCurrentSemester();

    if (isAdmin(req)) {
    } else if (isTutor(req)) {
      if (course.tutorId !== req.userId || getCurrentSemester() !== course.semester) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete activity for this course' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const activityIndex = course.activities.findIndex(
      (activity) => activity._id.toString() === activityId
    );

    if (activityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    course.activities.splice(activityIndex, 1);

    await course.save();

    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user?.isAdmin ? error.message : 'Server error' });
  }
};
