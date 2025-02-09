import express from 'express';
import * as assignmentController from '../controllers/assignment.controller.js';
import upload from "../config/multer.js";
import { authenticateUser, authenticateAdminOrTutor, authenticateStudent } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

/* Admin & Tutor routes */
router.get('/assignments', authenticateAdminOrTutor, assignmentController.getAssignments);
router.post('/:courseId/assignments', authenticateAdminOrTutor, upload, assignmentController.createAssignment);
router.patch('/:courseId/assignments/:assignmentId', authenticateAdminOrTutor, upload, assignmentController.updateAssignment);
router.delete('/:courseId/assignments/:assignmentId', authenticateAdminOrTutor, assignmentController.deleteAssignment);
router.patch('/:courseId/assignments/:assignmentId/students/:studId', authenticateAdminOrTutor, assignmentController.updateStudentAssignmentGrade);

/* Student routes */
router.get('/assignments/student', assignmentController.getStudentAssignmentsGrades);
router.post('/:courseId/assignments/:assignmentId/student', authenticateStudent, upload, assignmentController.handleAssignmentFileUpload);
router.patch('/:courseId/assignments/:assignmentId/student', authenticateStudent, upload, assignmentController.handleAssignmentFileUpdate);
router.delete('/:courseId/assignments/:assignmentId/student', authenticateStudent, assignmentController.handleAssignmentFileDelete);

export default router
