const express = require('express')
const router =  express.Router()

const { registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    UpdatePassword,
    UpdateProfile,
    allUsers,
    getUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword} = require('../controllers/authController')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.route('/me').post(isAuthenticatedUser, getUserProfile)
router.route('/password/update').put(isAuthenticatedUser, UpdatePassword)
router.route('/me/update').put(isAuthenticatedUser, UpdateProfile)
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'),allUsers)
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'),getUser)
router.route('/admin/update/:id').put(isAuthenticatedUser, authorizeRoles('admin'),updateUser).delete(isAuthenticatedUser,authorizeRoles('admin'),deleteUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').post(resetPassword)

module.exports = router