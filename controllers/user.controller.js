import {z} from "zod"
import {success} from "../utils/response.js"
import User from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { destroyOnCloudinary, replaceOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
const cookieOptions = {
    httpOnly : true,
    secure : true,
}
const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        await user.save()
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(501, "Something went wrong while generating token")
    }
}

//validation methods
const validateName = (name) =>{
    return z.string().min(1, {message: "Name can't be empty"}).regex(/^[a-zA-Z\s]+$/, "Not a valid Name").parse(name)
}
const validateEmail = (email) => {
    return z
    .string()
    .min(1, { message: "Email can't be empty" })
    .email("Enter valid email")
    .parse(email)
}
const validatePassword = (password) => {
    return z
        .string()
        .min(8, 'The password must be at least 8 characters long')
        .max(32, 'The password must be a maximun 32 characters')
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, `Password should contain at least 1 number, both lower and uppercase letters, at least one special characters from [#,?,!,@,$,%,^,&,*,-]`)
        .parse(password)
}


//controllers
const register = asyncHandler(async (req, res)=>{
    let {email, name, password } = req.body
    email=email.trim()
    name = name.trim()
    password=password.trim()
    // data validation
    try{
        validateName(name)
        validateEmail(email)
        validatePassword(password)
    }catch(error){
        let  errMsg = ""
        for(let err of error.errors)
            errMsg += err.message+", "
        // return failure(res, 400, errMsg)
        throw new ApiError(400, errMsg)
    }
    // check whether email Already exists in db
    const existingUser = await User.findOne({email})
    console.log(existingUser)
    if(existingUser){
        throw new ApiError(400, "User Already exists")
    }

    
    //create user
    let user = await User.create({email, name, password})
    //send success
    console.log("going")
    return success(res, 200, "User Registered", {id: user._id})
})
const verifyEmail = asyncHandler(async (req, res) =>{
    let {email, token } = req.params
    const user = await User.findOne({email})
    if(!user)
        throw new ApiError(400, "Invalid Attempt")
    if(user.isEmailVerified)
        throw new ApiError(400, "User Already Verified")
    if(user.emailVerificationToken !== token)
        throw new ApiError(400, "Invalid Token")
    if(user.emailVerificationTokenExpiresTime<Date.now() ){
        throw new ApiError(400, "Verification Link Expired, Click on Resend Verification Link")
    }
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpiresTime = undefined
    user.isEmailVerified = true
    await user.save()
    return success(res, 200, "Verification Successfull")
})

const login = asyncHandler(async (req, res)=>{
    let {email, password} = req.body
    //email password should not be empty
    if(!email || !password)
        throw new ApiError(400, "Wrong Credentials")
    // finding user
    const user = await User.findOne({email})
    if(!user || ! await user.isPasswordCorrect(password))
        throw new ApiError(400, "Wrong Credentials")
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly : true,
        secure : true,
    }
    res.cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions)
    return success(res, 200, "Login Successfull", {id:user._id, accessToken, refreshToken})
})

const logout = asyncHandler(async (req, res)=>{
    res.cookie("accessToken", "", {maxAge : 0}).cookie("refreshToken", "", {maxAge : 0})
    const user = await User.findById(req._id)
    if(user){
        user.refreshToken = undefined
        await user.save()
        return success(res, 200, "Logout Successfull")
    }else
        throw new ApiError(400, "User not found")
})
const me = asyncHandler(async (req, res)=>{
    const user = await User.findById(req._id)
    if(!user)
        throw new ApiError(400, "user not exists")

    return success(res, 200, "User profile fetched", {
        name:user.name,
        email : user.email,
        isEmailVerified:  user.isEmailVerified,
        role : user.role,
        profilePicture : user.profilePicture,
    })

})
const resendEmailVerification = asyncHandler(async (req, res)=>{
    const {email} = req.body
    if(!email)
        throw new ApiError(400, "Email should be provided")
    // finding user
    const user = await User.findOne({email})
    if(!user)
        throw new ApiError(400, "Provide Registered Email only")
    user.emailVerificationToken = undefined
    user.markModified("email")
    user.save()
    return success(res, 200, "Email Re-Registered", {id: user._id})
})
const updateProfile = asyncHandler (async (req, res)=>{

    let {email, name } = req.body
    email=email.trim()
    name = name.trim()
    // data validation
    try{
        validateName(name)
        validateEmail(email)
    }catch(error){
        let  errMsg = ""
        for(let err of error.errors)
            errMsg += err.message+", "
        throw new ApiError(400, errMsg)
    }
    // check whether email Already exists in db
    const user = await User.findById(req._id)
    if(user.email !== email){
        if(await User.findOne({email})){
            throw new ApiError(400, "EmailId already in use")
        }
    }
    user.email = email
    user.name = name
    await user.save()
    return success(res, 200, "User Profile Updated", {id: user._id})
})
const changePassword = asyncHandler (async (req, res)=>{
    let {currentPassword, newPassword} = req.body
    const user = await User.findById(req._id)
    if(!await user.isPasswordCorrect(currentPassword))
        throw new ApiError(400, "Current Password is Wrong")
    
    newPassword=newPassword.trim()
    // data validation
    try{
        validatePassword(newPassword)
    }catch(error){
        let  errMsg = ""
        for(let err of error.errors)
            errMsg += err.message+", "
        // return failure(res, 400, errMsg)
        throw new ApiError(400, errMsg)
    }
    
    user.password = newPassword
    await user.save()
    return success(res, 200, "Password Changed")
})

const forgotPassword = asyncHandler (async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user)
        throw new ApiError(400, "User not Exists")
    user.sendResetPasswordToken()
    return success(res, 200, "Reset Password Link sent to your mail")
})
const resetPassword = asyncHandler (async (req, res)=>{
    let {email, token } = req.params
    let {password} = req.body
    const user = await User.findOne({email})
    if(!user)
        throw new ApiError(400, "Invalid Attempt")
    if(user.resetPasswordToken !== token)
        throw new ApiError(400, "Invalid Token")
    if(user.resetPasswordTokenExpiresTime<Date.now()){
        throw new ApiError(400, "Verification Link Expired..")
    }
    password=password.trim()
    // data validation
    try{
        validatePassword(password)
    }catch(error){
        let  errMsg = ""
        for(let err of error.errors)
            errMsg += err.message+", "
        // return failure(res, 400, errMsg)
        throw new ApiError(400, errMsg)
    }
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpiresTime = undefined
    await user.save()
    return success(res, 200, "Password Changed")
})
const deleteAccount =  asyncHandler (async (req, res)=>{
    let {email, password} = req.body
    const user = await User.findById(req._id)
    if(!user)
        throw new ApiError(400, "User Not Exists")
    if(user.email!=email || ! await user.isPasswordCorrect(password))
        throw new ApiError(400, "Wrong Credentials..")
    await User.findByIdAndDelete(req._id)
    res.cookie("accessToken", "", {maxAge : 0}).cookie("refreshToken", "", {maxAge : 0})
    return success(res, 200, "Account deleted")
})

const updateProfilePicture = asyncHandler (async(req, res)=>{
    const user = await User.findById(req._id)
    if(!user)
        throw new ApiError(400, "User not exists")
    if(!user.profilePicture){
        const cloudinaryResponse = await uploadOnCloudinary(req.file.path)
        user.profilePicture = cloudinaryResponse.secure_url
        await user.save()
    }else{
        await replaceOnCloudinary(user.profilePicture, req.file.path)
    }
    // console.log(cloudinaryResponse)
    return success(res, 200, "Profile Picture Updated", { profilePicture : user.profilePicture})
})
const deleteProfilePicture = asyncHandler (async(req, res)=>{
    const user = await User.findById(req._id)
    if(!user)
        throw new ApiError(400, "User not exists")
    if(user.profilePicture){
        const cloudinaryResponse = await destroyOnCloudinary(user.profilePicture)
        console.log(cloudinaryResponse)
        if(cloudinaryResponse.result === 'ok')
            user.profilePicture = undefined
        await user.save()
    }else{
        throw new ApiError(400, "Profile Image Doesn't exists")
    }
    // console.log(cloudinaryResponse)
    return success(res, 200, "Profile Picture Deleted")
})

export {
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
}


