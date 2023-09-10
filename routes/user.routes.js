const { Router } = require('express');
const { userRegisterValidator, userLoginValidator } = require('../validators/user.validator');
const { validate } = require('../validators/validate');
const { registerUser, verifyEmail, loginUser } = require('../controllers/user.controller');

const router = Router();


//un-secure routes
router.route('/register').post(userRegisterValidator(), validate, registerUser)
router.route('/login').post(userLoginValidator(), validate, loginUser)
router.route('/verify-email/:verificationToken').post(verifyEmail)






module.exports = router;

