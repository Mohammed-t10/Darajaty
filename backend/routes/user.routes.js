import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateUser, authenticateAdmin, authenticateAdminOrTutor } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', authenticateAdmin, userController.getUsers);
router.get('/students', authenticateAdminOrTutor, userController.getStudents);
router.get('/tutors', authenticateAdmin, userController.getTutors);
router.post('/', authenticateAdmin, userController.createUser);
router.patch('/:id', authenticateAdmin, userController.updateUser);
router.delete('/:id', authenticateAdmin, userController.deleteUser);

export default router;
