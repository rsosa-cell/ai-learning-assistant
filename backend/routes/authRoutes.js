import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

//middleware validation
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be between 3'),
    body('email')
        .isEmail()
        .normalizeEmail('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

//routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;