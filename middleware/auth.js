const User = require('../models/user')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const jwt = require('jsonwebtoken')

//check if user is authenticate or not
exports.isAuthenticatedUser = catchAsyncError(
    async(req, res, next)=>{
        const { token } = req.cookies

        //if not token is provided
        if(!token){
            return next(new ErrorHandler('login first to access this resources', 401))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // console.log('decoded', decoded)
        // console.log('REQ: ', req)

        req.user = await User.findById(decoded.id)
        // console.log(req.user.id)

        // console.log('REQ.USER :', req)
        next()
    }
)

//Handling user routes  
exports.authorizeRoles = (...roles) => {
    console.log(roles)
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resources`, 403))
        }
        next()
    }
}