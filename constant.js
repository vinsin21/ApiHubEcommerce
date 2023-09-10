const DB_NAME = 'freeApiEcomPRT';

const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER"
}

const AvailableUserRoles = Object.values(UserRolesEnum);


const UserLoginTypes = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
}
const AvailableSocialLogins = Object.values(UserLoginEnum)

const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes


module.exports = {
    DB_NAME,
    UserRolesEnum,
    AvailableUserRoles,
    UserLoginTypes,
    AvailableSocialLogins,
    USER_TEMPORARY_TOKEN_EXPIRY
}