import express from "express"
import {
    register,
    login,
    verifyEmail,
    logout,
    resendEmailVerification,
    updateProfile,
    updateProfilePicture,
    changePassword,
    forgotPassword,
    resetPassword,
    deleteAccount,
    deleteProfilePicture,
    me,
    refreshAccessToken,
} from "../controllers/user.controller.js"

import multer from "multer"
const upload = multer({ dest: 'uploads/' })

import { verifyJWT } from "../middleware/auth.js"
const router = express.Router()

// router.route('/register').post(()=>res.send("hello"))
router.route('/register').post(register)
router.get('/verify/:email-:token', verifyEmail)
router.post('/login', login)
router.post('/resend-email', resendEmailVerification)
router.post('/refresh-access-token', refreshAccessToken)
//secured routes
router.use(verifyJWT)
router.get('/me', me)
router.post('/logout', logout)
router.post('/update-profile', updateProfile)
router.post('/update-profile-picture', upload.single('profilePicture'), updateProfilePicture)
router.post('/delete-profile-picture', deleteProfilePicture)
router.post('/change-password', changePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:email-:token', resetPassword)
router.post('/delete-account', deleteAccount)
export default router