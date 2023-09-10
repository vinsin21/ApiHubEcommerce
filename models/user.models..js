const mongoose = require('mongoose');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const { AvailableUserRoles, UserRolesEnum, AvailableSocialLogins, UserLoginTypes, USER_TEMPORARY_TOKEN_EXPIRY, } = require('../constant');



const userSchema = new mongoose.Schema({

    avatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: "",       // image link from some cloud service 
            localPath: ""
        }
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: AvailableUserRoles,                     //["ADMIN","USER"]
        default: UserRolesEnum.USER,                // "USER"
        required: true
    },
    loginType: {
        type: String,
        enum: AvailableSocialLogins,          //["GOOGLE", "GITHUB", "EMAIL_PASSWORD"]
        default: UserLoginTypes.EMAIL_PASSWORD,
    },
    refreshToken: {
        type: String,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date
    },
    forgetPasswordToken: {
        type: String,
    },
    forgetPasswordExpiry: {
        type: Date
    },

}, { timestamps: true });


//hashing password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
});

// loosely coupled models coupling and tight coupling 
userSchema.post("save", async function (user, next) {

    const ecomProfile = await EcomProfile.findOne({ owner: user._id })
    const cart = await Cart.findOne({ owner: user._id })


    if (!ecomProfile) {
        await EcomProfile.create({ owner: user._id })
    }
    if (!cart) {
        await Cart.create({ owner: user._id })
    }


    next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function (user) {
    return jwt.sign({
        _id: user._id,
        username: user._username,
        email: user.email,
        role: user.role,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = function (user) {
    return jwt.sign({
        _id: user._id
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}

userSchema.methods.generateTemporaryToken = function () {

    // this function return three token unhashedToken,hashedToken, 

    // we will make a unhashedToken to send to user email for verification
    const unHasedToken = crypto.randomBytes(20).toString('hex');

    // we will a make a hashedToken and save it to db
    const hashedToken = crypto.createHash("sha256").update(unHasedToken).digest('hex');

    // This is the expiry time for the token (20 minutes)
    const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

    return { unHasedToken, hashedToken, tokenExpiry }

}




const User = mongoose.model("User", userSchema);

module.exports = User