const success = function(res, status, message, data){
        return res.status(status).json({
            message,
            data
        })
    }

export {success}