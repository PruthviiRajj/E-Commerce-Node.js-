const ErrorHandler = require('../utils/errorhandler')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || 'Internal Server Error'

    if(process.env.NODE_ENV === 'DEVLOPEMENT'){

        if(err.name === 'CastError'){
            const message = 'Resource not found'

            err = new ErrorHandler(message, 400)
        }

        //Handling mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message)

            err = new ErrorHandler(message, 400)
        }

        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}
    
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`

            error = new ErrorHandler(message, 400)
        }
        //Handling mongoose validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message)

            error = new ErrorHandler(message, 400)
        }

        // error.message = err.message
        res.status(err.statusCode).json({
            success: false,
            error: error.message || 'Internal Server Error'
        })
    }
}