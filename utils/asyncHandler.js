
const asyncHandler = (requestHandler) => {
    return function(req, res, next){
            Promise
            .resolve(requestHandler(req, res, next))
            .catch(error => res.status(error.statusCode || 400).json({...error, message : error.message}))
    }
}

export {asyncHandler}