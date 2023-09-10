const dotenv = require('dotenv')
const app = require('./app')
const connectDB = require('./db/index')


dotenv.config({ path: './.env' });

const majorNodeVersion = process.env.NODE_VERSION?.split('.')[0] || 0;
//                             '^4.18.2' => [^4 ,18, 2] 


const startServer = () => {

    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at ${process.env.PORT}`)
    })


}


// to connect to mongodb
if (majorNodeVersion >= 14) {
    try {
        await connectDB();
        startServer();
    } catch (err) {
        console.log("Mongo db connect error: ", err);
    }
} else {
    connectDB()
        .then(() => {
            startServer();
        })
        .catch((err) => {
            console.log("Mongo db connect error: ", err);
        });
}




