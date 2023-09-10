

class ApiError extends Error {

    constructor(
        statusCode,
        message = "something went wrong",
        error = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.success = false;
        this.date = null;

        if (stack) {
            this.stack = stack
        } else {
            throw Error.captureStackTrace(this, this.constructor)
        }


    }

}

module.exports = {
    ApiError
}