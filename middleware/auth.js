import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req?.headers?.authorization?.split(' ')[1]
    if(!token)
        throw new ApiError(401, "User Not Authorized")
    const data = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
    if(!data || !data._id)
        throw new ApiError(401, "User Not Authorized")
    req._id = data._id
    next()
})

export {verifyJWT}