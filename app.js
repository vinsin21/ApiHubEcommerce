const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport');

//Routes imports
const userRoutes = require('./routes/user.routes')

const app = express();


//GLOBAL MIDDLEWARES

app.use(cors({
    cors: "*",
    credentials: true,
}))
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_, __, ___, options) => {
        throw new ApiError(
            options.statusCode || 500,
            `There are too many requests. You are only allowed ${options.max
            } requests per ${options.windowMs / 60000} minutes`
        );
    },
});

app.use(limiter)
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(cookieParser())
// for passport js 
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session())



//API Routes
app.use('/api/v1/users', userRoutes);



module.exports = app;
