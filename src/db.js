const mongoose = require('mongoose');

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MongoURI)
        console.log("Connected to db")
    } catch (error) {
        console.log("Failed to connect to db", error)
    }
}

module.exports = { connectDB }