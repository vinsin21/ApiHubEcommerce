const mongoose = require('mongoose')
const DB_NAME = require('../constant')



const dbInstance = undefined;

const connectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(process.env.MONGO_URI / `${DB_NAME}`);
        dbInstance = connectionInstance;
        console.log(`\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`)

    } catch (error) {
        console.log(`Mongoodb connnection error =>`, error)
        //process.exit(1)
    }
}

module.exports = {
    connectDB,
    dbInstance
}