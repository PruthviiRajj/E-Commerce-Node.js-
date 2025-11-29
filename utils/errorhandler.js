class ErrorHandler extends Error{
    constructor(message, statuscode){        
      super(message)// Super stands for the parent class constructor
      this.statuscode = statuscode
      //it will create a stack property on this object
      Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHandler