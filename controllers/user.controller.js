const crypto = require("crypto")
const { UserRolesEnum, UserLoginTypes } = require("../constant");
const User = require("../models/user.models.");
const ApiResponse = require("../utils/ApiResponse");
const { ApiError } = require("../utils/apiError");
const { sendMail, emailVerificationMailgenContent } = require("../utils/mail");


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken()
        const refrehToken = user.generateRefreshToken()

        user.refreshToken = refrehToken;

        user.save({ validateBeforeSave: false })
        return { accessToken, refrehToken }

    } catch (error) {
        throw new ApiError(500, "someting went wrong cannot generate access and referesh token")
    }


}

const registerUser = async (req, res) => {


    const { username, email, password, role } = req.body;

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) throw new ApiError(409, "user with name or email already exist", []);

    const user = await User.create({
        username,
        email,
        password,
        role: role || UserRolesEnum.USER,
        isEmailVerified: false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // sending email to for verification
    sendMail({
        email: user.email,
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get('host')}//api/v1/users/verify-email/${unHashedToken}`
        )
    })

    // again check if user is saved in the DB
    const createdUser = await User.findOne({ _id: user._id }).select('-password, -regreshToken -emailVerificationToken -emailVerificationExpiry');

    if (!createdUser) throw new ApiError(500, "something went wrong while registering the user");

    res.status(201).json(new ApiResponse(201, { user: createdUser }, "Users registered successfully and verification email has been sent on your email"));



}

const loginUser = async (req, res) => {
    const { email, password, username } = req.body;
    // check email and username because in validatoe use make them optional 
    // so user can login using any one 
    if (!email || !username) throw new ApiError(400 < "email or username is rquired");

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) throw new ApiError(404, "user dont exist ")
    // We check the login method of user and allow to login using only with the same method from which he is registerd. Which makes password field redundant for the SSO
    if (user.loginType !== UserLoginTypes.EMAIL_PASSWORD) {
        throw new ApiError(400,
            `You have previoulsy registerd using ${user.loginType} method plz use the ${user.loginType} login method to login you account `
        )
    }
    // check the password because we save a hashPassword in DB no the real one 
    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials");

    // making refresh and acess token 
    const { accessToken, refrehToken } = await generateAccessAndRefreshToken(user._id)

    // 
    const logedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    // TODO: Add more options to make cookie more secure and reliable
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) // set the access token in the cookie
        .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
                "User logged in successfully"
            )
        );

}

const verifyEmail = async (req, res) => {
    // this is the unHashedToken we send during register
    const { verificationToken } = req.params;

    if (!verificationToken) throw new ApiError(400, "email verification token is missing");

    const hashedToken = crypto.createHash('sh256').update(verificationToken).digest('hex');

    // when the user login we create emailToken adn emailEpxiry(20min)
    // if user try to register at 1pm the emailExpiryis set to 1:20pm 
    // let suppose user lick verify in email at 1:15pm
    //we can se thet the verificationExpiry in db is 1:20 and user click verifyEamil (Date.now()) at 1:15pm 
    // that mean the token is not expir and we the the user
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    })

    if (!user) throw new ApiError(489, "token is invalid or expire")

    // If we found the user that means the token is valid
    // Now we can remove the associated email token and expiry date as we no  longer need them
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    // Tun the email verified flag to `true`
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, { isEmailVerified: true }, "email verified"))



}

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
}