const bcrypt = require('bcryptjs/dist/bcrypt')
const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter your name'],
        maxlength:[30, 'Your name cannot exceed']
    },
    email:{
        type:String,
        required:[true, 'Please enter your Email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter email address']
    },
    password:{
        type:String,
        required:[true, 'Please enter your password'],
        minlength:[6, 'Your password must be longer than 6 characters'],
        select: false
    },
    avatar :{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    role:{
        type:String,
        default: 'user'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})

//Encypting the password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
})

//Token Generation
userSchema.methods.getjwtToken = function(){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME 
    })
}

//compare password
userSchema.methods.comparePassword = async function(enterdpassword){
    return await bcrypt.compare(enterdpassword, this.password)
}

//Generate password reset token
userSchema.methods.getResetPasswordToken = function(){
    //Generat token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //Hash and set to resetPasswordtoken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set Token Expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken
}



module.exports = mongoose.model('user',userSchema)