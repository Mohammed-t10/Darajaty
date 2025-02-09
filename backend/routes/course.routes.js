import express from 'express';
import * as courseController from '../controllers/course.controller.js';
import { authenticateAdmin, authenticateUser, authenticateTutor, authenticateAdminOrTutor } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/student', courseController.getStudentData);
router.get('/', authenticateAdminOrTutor, courseController.getCourses);
router.post('/', authenticateAdmin, courseController.createCourse);
router.put('/:id', authenticateAdmin, courseController.updateCourse);

// PATCH /api/courses/:id to modify a course by tutor
router.patch('/:id', authenticateTutor, courseController.updateCourseByTutor);
router.delete('/:id', authenticateAdmin, courseController.deleteCourse);

export default router;
