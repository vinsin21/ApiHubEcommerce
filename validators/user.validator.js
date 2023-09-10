const { body, param } = require('express-validator');
const { AvailableUserRoles } = require('../constant');


const userRegisterValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .escape() // express-validator is to use a sanitizer, most specifically escape, which transforms special HTML characters with others that can be represented as text.prevent XSS attack
        ,

        body("username")
            .trim()
            .notEmpty()
            .withMessage('usernae is required')
            .isLowercase()
            .withMessage("username must be lowercase")
            .isLength({ min: 3 })
            .withMessage("usernmae must be 3 character long ")
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .escape(),
        body('role')
            .optional()
            .isIn(AvailableUserRoles)
            .withMessage("invlaid user role")
            .escape()

    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("invalid email")
            .escape(),
        body("usernmae")
            .optional()
            .escape(),
        body("password")
            .notEmpty()
            .withMessage("password is required")
            .escape(),

    ]
}


module.exports = {
    userRegisterValidator,
    userLoginValidator,

}
