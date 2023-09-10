const { validationResult } = require('express-validator')
// express-validtor when catcha an error it store that error inside validationResult
//So if the validation fales we can see the what is the erro from validation erro




// we create a validate middleware 
const validate = (req, res, next) => {
    const errors = validationResult(req)  // we store all the erros from validatoinResuslt which come during request
    if (errors.isEmpty()) {
        return next()
    }

    const extractedErrors = [];

    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
    // errors.array() looks like =>
    //   "errors": [
    //     {
    //       "location": "query",
    //       "msg": "Invalid value",
    //       "path": "person",
    //       "type": "field"
    //     }
    //   ]
    // 422: Unprocessable Entity
    throw new ApiError(422, "Received data is not valid", extractedErrors);

}

module.exports = {
    validate
}