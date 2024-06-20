const mongoose=require('mongoose')
require("dotenv").config({
    path: '../.env'
})
const connect=async()=>{
    try {
        const conn= await mongoose.connect(process.env.MONGODB_URL)
        console.log(`connected success `);
    } catch (error) {
        console.log('wrong in database connection: ',error);
    }
   
}
module.exports={connect}
