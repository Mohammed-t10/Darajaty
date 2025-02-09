import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateUser, restrictAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', restrictAuthenticated, authController.login);
router.post('/send-new-password', restrictAuthenticated, authController.sendNewPassword);
router.post('/refresh-token', restrictAuthenticated, authController.issueAccessToken);

router.use(authenticateUser);

router.post('/logout', authController.logout);
router.get('/check-auth', authController.checkAuth);
router.post('/reset-password', authController.resetPassword);
router.post('/update-email', authController.updateEmail);

export default router;
