const User = require('../models/user')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const sendToken = require('../utils/jwttoken')
const sendEmail = require('../utils/sendemail')
const crypto = require('crypto')

//register a user api/v1/register[post
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body
    console.log(name)

    const data = {
        name,
        email,
        password,
        avatar:{
            public_id: 'ID',
            url: 'URL'
        }
    }
    const user = await User.create(data)

    sendToken(user, 201, res)
    
})

//login a user api/v1/Login[post]
exports.loginUser = catchAsyncError(
    async (req, res, next) => {
        const { email,password } = req.body

        //check if email and password is enterd by user
        if(!email || !password){
            return next(new ErrorHandler('Please enter email & password', 400))
        }

        // Finding user in database
        const user = await User.findOne({email}).select('+password')

        //if user is not existing in the database
        if(!user){
            return next(new ErrorHandler('Invalid email or password',401))
        }

        //check if password is correct or not
        const isPasswordMatched = await user.comparePassword(password)

        if(!isPasswordMatched){
            return next(new ErrorHandler('Invalid email or password',401))
        }

        sendToken(user, 201, res)
    }
)

//Logout user => api/v1/logout[GET]
exports.logoutUser =catchAsyncError(
    async (req, res, next) => {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        res.status(200).json({
            success: true,
            message: 'Logged Out'
        })
    }
) 

//Get currently logged in user details => api/v1/me [get]
exports.getUserProfile = catchAsyncError(
    async(req, res, next) => {
        const user = await User.findById(req.user.id)

        res.status(200).json({
            success: true,
            user
        })
    }
)

// update change password => api/v1/password/update[PUT]
exports.UpdatePassword = catchAsyncError(
    async(req, res, next) => {
        const user = await User.findById(req.user.id).select('+password')
        
        //check previous user password
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

        if(!isPasswordMatched){
            return next(new ErrorHandler('Old Password is not correct',400))
        }

        user.password = req.body.password

        await user.save()

        sendToken(user, 200, res)
    }
)

//Update user profile => api/v1/me/update [PUT]
exports.UpdateProfile = catchAsyncError(
    async(req, res, next) =>{
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        //update avatar : TODO
        // console.log(req.user.id)

        const user = await User.findByIdAndUpdate(req.user.id, newUserData)

        res.status(200).json({
            success: true,
            user
        })

    }
)

// admin Routes

// Get all  users => api/v1/admin/users
exports.allUsers = catchAsyncError(
    async(req, res, next) => {
        const user = await User.find()

        res.status(200).json({
            success: true,
            user
        })
    }
)

// Get user => api/v1/admin/user/:id
exports.getUser = catchAsyncError(
    async(req, res, next) => {
        const user = await User.findById(req.params.id)

        if(!user){
            return next(new ErrorHandler('User does not found',404))
        }

        res.status(200).json({  
            success: true,
            user
        })
    }
)

// Update user profile by admin => api/v1/admin/update/:id
exports.updateUser = catchAsyncError(
    async(req,res,next) => {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        const user = await User.findByIdAndUpdate(req.params.id, newUserData)

        res.status(200).json({
            success: true,
            user
        })
    }
)

// Delete user => api/v1/   
exports.deleteUser = catchAsyncError(
    async(req, res, next) => {
        const user = await User.findById(req.params.id)

        if(!user){
            return next(new ErrorHandler('User does not found',404))
        }

        // remove Avatar from Cloudinary[TODO]
        
        await User.findById(req.params.id).deleteOne()

        res.status(200).json({
            success:true            
        })
    }
)

//Forget Password => /api/v1/password/forget
exports.forgotPassword = catchAsyncError(
    async(req, res, next) => {
        const { email } = req.body

        const user = await User.findOne({email})

        if(!user){
            return next(new ErrorHandler('User not found with this email',404))
        }

        //Get resetToken
        const resetToken = user.getResetPasswordToken()

        await user.save({validateBeforeSave:false})

        //creating resetpassword URL 
        const restURL = `${req.protocol}://${req.get('host')}/api/reset/${resetToken}`

        const message = `Your password token is as follow:\n\n${restURL} \n\n If you have not requested this email then ignore it`

        try {
            await sendEmail({
                email: user.email,
                subject: 'Ecommerce Password Recovery',
                message
            })

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            })
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined

            await user.save({validateBeforeSave: false})

            return next(new ErrorHandler(error.message,500))
        }
    }
)

//Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(
    async(req,res,next) => {

        const {password, confirmPassword} = req.body

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt: Date.now()}
        })

        if(!user){
            return next(new ErrorHandler('Password reset token is invalid or have been expired',400))
        }

        if(password !== confirmPassword){
            return next(new ErrorHandler('Password does not match',400))
        }

        //Setup new password

        user.password = password

        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        sendToken(user, 200, res)

    }
)