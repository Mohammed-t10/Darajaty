import express from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { authenticateUser, authenticateAdmin, authenticateTutor, authenticateAdminOrTutor } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/:courseId/activities', authenticateAdminOrTutor, activityController.createActivity);
router.put('/:courseId/activities/:activityId', authenticateAdminOrTutor, activityController.updateActivityDetails);
router.patch('/:courseId/activities/:activityId', authenticateAdminOrTutor, activityController.updateActivityGrades);
router.delete('/:courseId/activities/:activityId', authenticateAdminOrTutor, activityController.deleteActivity);

export default router;
