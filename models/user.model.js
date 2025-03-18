import mongoose from "mongoose"
import crypto from "crypto"
import mail from "../utils/mail.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const base_url = process.env.BASE_URL
const port = process.env.PORT
const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required: true,
    }, 
    isEmailVerified : {
        type : Boolean,
        default: false,
    },
    role : {
        type : String,
        enum : ["admin", "user"],
        default : "user",
        required: true
    },
    emailVerificationToken : String,
    emailVerificationTokenExpiresTime: Date,
    profilePicture : String,
    resetPasswordToken : String,
    resetPasswordTokenExpiresTime : Date,
    refreshToken : String,
}, {timestamps:true})

userSchema.pre('save', async function(next){  
    if(this.isModified('email')){
        //send verification mail
        const token = crypto.randomBytes(32).toString('hex')
        this.emailVerificationToken = token
        this.emailVerificationTokenExpiresTime = Date.now() + 24*60*60*1000
        this.isEmailVerified = false
        mail(this.email,
            'Email Verification Mail from Authorizer',
            `http://localhost:${port}${base_url}/user/verify/${this.email}-${token}`,
            `Click on the link to get Verified : <a target="_blank">http://localhost:${port}/${base_url}/user/verify/${this.email}-${token}</a>`
        )
        console.log("EMail sent")
    }
    console.log("this.isModified('password')", this.isModified('password'), this.password)
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compareSync(password, this.password);
}
userSchema.methods.sendResetPasswordToken = async function(){
    const token = await crypto.randomBytes(32).toString('hex')
    this.resetPasswordToken = token
    this.resetPasswordTokenExpiresTime = Date.now() + 15*60*1000
    mail(this.email,
        'Reset Password Mail from Authorizer',
        `http://localhost:${port}${base_url}/user/reset-password/${this.email}-${token}`,
        `Click on the link to reset Password : <a target="_blank">http://localhost:${port}${base_url}/user/reset-password/${this.email}-${token}</a>`
    )
    console.log("EMail sent")
    await this.save()
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        }, 
        process.env.JWT_REFRESH_TOKEN_SECRET, 
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME }
    )
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            role : this.role,
        }, 
        process.env.JWT_ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME }
    )
}
const User = mongoose.model("User", userSchema)
export default User