import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import getCurrentSemester from '../utils/getCurrentSemester.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const isAdmin = (req) => req.user && req.user.isAdmin;
const isTutor = (req) => req.user && req.user.role === 'tutor';

const assignmentsFolder = "assignments";
const submissionsFolder = "submissions";

/* AddAssignments Page (Tutors & Admins) (No students' grades) */

// GET /api/courses/assignments?manage=0 (No students' grades involved - AddAssignment page)
// GET /api/courses/assignments?manage=1 (Students' grades involved - ManageAssignments page)
export const getAssignments = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const manage = req.query.manage;

        if (manage !== '0' && manage !== '1') {
            return res.status(400).json({ success: false, message: "Missing or invalid parameters" });
        }

        const isTutorUser = isTutor(req);
        let courseQuery = {
            semester
        };

        if (isTutorUser) {
            courseQuery.tutorId = req.userId;
        }

        const courses = await Course.find(courseQuery)
            .select("_id courseName prac assignments")
            .lean();

        if (!courses || courses.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        if (manage === "1") {
            courseQuery.assignments = { $ne: [] };
            const users = await User.find({ role: "student", isActive: true }).select("name _id").lean();
            const userLookup = users.reduce((acc, user) => {
                acc[user._id.toString()] = user.name;
                return acc;
            }, {});

            courses.forEach(course => {
                course.assignments.forEach(assignment => {
                    assignment.students = assignment.students.map(student => ({
                        ...student,
                        name: userLookup[student.studId] || "Unknown",
                    }));
                });
            });
        }

        if (manage === "0") {
            courses.forEach(course => {
                course.assignments.forEach(assignment => {
                    delete assignment.students;
                });
            });
        }

        res.json({ success: true, data: courses });

    } catch (error) {
        res.status(500).json({ success: false, message: isAdmin(req) ? error.message : "Server error" });
    }
};

// POST /api/courses/:courseId/assignments (Handle pdf file upload)
export const createAssignment = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const { title, description } = req.body;
        let fileUrl = null;

        const startTime = req.body.startTime ? new Date(req.body.startTime) : null;
        const endTime = req.body.endTime ? new Date(req.body.endTime) : null;
        const maxGrade = req.body.maxGrade ? Number(req.body.maxGrade) : null;

        if ((startTime && isNaN(startTime)) || (!endTime)) {
            return res.status(400).json({ success: false, message: "Invalid start or end time" });
        }

        if (maxGrade !== null && isNaN(maxGrade)) {
            return res.status(400).json({ success: false, message: "Invalid max grade" });
        }

        const filter = { _id: req.params.courseId, isActive: true, semester };
        if (!isAdmin(req)) filter.tutorId = req.userId;

        const course = await Course.findOne(filter);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or access denied" });
        }

        let courseName = course.prac ? course.courseName + " عملي" : course.courseName;
        courseName = "تكليف " + courseName;

        if (req.file) {
            const cloudinaryResponse = await uploadToCloudinary(req.file.buffer, assignmentsFolder, courseName);
            fileUrl = cloudinaryResponse.secure_url;
        }

        const newAssignment = { title, description, file_url: fileUrl, maxGrade, startTime, endTime };
        course.assignments.push(newAssignment);
        await course.save();

        return res.json({ success: true, message: "Assignment added successfully", data: newAssignment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/courses/:courseId/assignments/:assignmentId (handle pdf update)
export const updateAssignment = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const { title, description } = req.body;
        let fileUrl = null;

        let startTime = req.body.startTime ? new Date(req.body.startTime) : null;
        const endTime = req.body.endTime ? new Date(req.body.endTime) : null;
        let maxGrade = req.body.maxGrade ? Number(req.body.maxGrade) : null;

        if (endTime && isNaN(endTime)) {
            return res.status(400).json({ success: false, message: "Invalid end time" });
        }

        if (startTime && isNaN(startTime)) {
          startTime = null;
        }

        if (maxGrade !== null && isNaN(maxGrade)) {
            maxGrade = null;
        }

        const filter = { _id: req.params.courseId, isActive: true, semester };
        if (!isAdmin(req)) filter.tutorId = req.userId;

        const course = await Course.findOne(filter);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or access denied" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        let courseName = course.prac ? course.courseName + " عملي" : course.courseName;
        courseName = "تكليف " + courseName;

        if (req.file) {
            const cloudinaryResponse = await uploadToCloudinary(req.file.buffer, assignmentsFolder, courseName);
            fileUrl = cloudinaryResponse.secure_url;
            assignment.file_url = fileUrl;
        }

        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (maxGrade !== null) assignment.maxGrade = maxGrade;
        if (startTime) assignment.startTime = startTime;
        if (endTime) assignment.endTime = endTime;

        if (req.body.deleteFile) assignment.file_url = null;

        await course.save();

        return res.json({ success: true, message: "Assignment updated successfully", data: assignment });
    } catch (error) {
        return res.status(500).json({ success: false, message: isAdmin(req) ? error.message : "Server error" });
    }
};

// DELETE /api/courses/:courseId/assignments/assignmentId
export const deleteAssignment = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const filter = { _id: req.params.courseId, isActive: true, semester };
        if (!isAdmin(req)) filter.tutorId = req.userId;

        const course = await Course.findOne(filter);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or access denied" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        assignment.deleteOne();

        await course.save();

        return res.json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


/* ManageAssignments Page (Tutors & Admins) (Students' grades) */

// GET endpoint is already defined up there (?manage=1)

// PATCH /api/courses/:courseId/assignments/:assignmentId/students/:studId
export const updateStudentAssignmentGrade = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const grade = req.body.newGrade;

        const filter = { _id: req.params.courseId, isActive: true, semester };
        if (!isAdmin(req)) filter.tutorId = req.userId;

        const course = await Course.findOne(filter);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or access denied" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const student = assignment.students.find(s => s.studId === req.params.studId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student assignment not found" });
        }

        if (Number(grade) > Number(assignment.maxGrade)) {
        return res.status(400).json({ success: false, message: "Students's grade cannot be greater than assignment grade" });
        }

        student.grade = grade;

        await course.save();

        return res.json({ success: true, message: "Grade updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: isAdmin(req) ? error.message : "Server error" });
    }
};


/* StudentAssignments Page (Students only) (getStudentAssignmentsPro script) */

// GET /api/courses/assignments/student
export const getStudentAssignmentsGrades = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        const userId = req.userId;

        const courses = await Course.find({ semester, assignments: { $ne: [] } })
            .select("_id courseName prac assignments")
            .lean();

        if (!courses || courses.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        courses.forEach(course => {
            course.assignments.forEach(assignment => {
                if (assignment.students && assignment.students.length > 0) {
                    assignment.students = assignment.students.filter(student => student.studId === userId);
                }
            });
        });

        res.json({ success: true, data: courses });

    } catch (error) {
        res.status(500).json({ success: false, message: isAdmin(req) ? error.message : "Server error" });
    }
};

// POST /api/courses/:courseId/assignments/assignmentId/student (Student)
export const handleAssignmentFileUpload = async (req, res) => {
    try {
        const semester = getCurrentSemester();
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const course = await Course.findOne({ _id: req.params.courseId, isActive: true, semester });
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        if (new Date() > new Date(assignment.endTime)) {
            return res.status(400).json({ success: false, message: "Submission deadline has passed" });
        }

        const existingSubmission = assignment.students.find(s => s.studId === req.userId);
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: "You have already submitted a solution" });
        }

        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer, submissionsFolder, req.user.name);
        const fileUrl = cloudinaryResponse.secure_url;

        assignment.students.push({
            studId: req.userId,
            file_url: fileUrl,
            grade: null,
            lastModified: new Date()
        });

        await course.save();

        return res.json({ success: true, message: "File uploaded successfully", fileUrl });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// PATCH /api/courses/:courseId/assignments/:assignmentId/student (Student)
export const handleAssignmentFileUpdate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        const course = await Course.findOne({
            _id: req.params.courseId,
            semester: getCurrentSemester(),
            isActive: true
        });

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const student = assignment.students.find(s => s.studId === req.userId);
        if (!student) {
            return res.status(400).json({ success: false, message: "No existing submission found" });
        }

        if (!student.file_url) {
            return res.status(400).json({ success: false, message: "No file to update" });
        }

        if (student.grade !== null) {
            return res.status(400).json({ success: false, message: "Cannot update file after grading" });
        }

        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer, submissionsFolder, req.user.name);
        const fileUrl = cloudinaryResponse.secure_url;
        student.file_url = fileUrl;

        student.lastModified = new Date();

        await course.save();

        return res.json({ success: true, message: "File updated successfully", fileUrl });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE /api/courses/:courseId/assignments/:assignmentId/student (Student)
export const handleAssignmentFileDelete = async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.courseId,
            semester: getCurrentSemester(),
            isActive: true
        });

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const assignment = course.assignments.id(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        if (new Date() > new Date(assignment.endTime)) {
            return res.status(400).json({ success: false, message: "Cannot delete file after the deadline" });
        }

        const student = assignment.students.find(s => s.studId === req.userId);
        if (!student) {
            return res.status(400).json({ success: false, message: "No submission found" });
        }

        if (student.grade !== null) {
            return res.status(400).json({ success: false, message: "Cannot delete file after grading" });
        }

        if (!student.file_url) {
            return res.status(400).json({ success: false, message: "No file to delete" });
        }

        assignment.students.pull({ studId: req.userId });

        await course.save();

        return res.json({ success: true, message: "Student submission deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
