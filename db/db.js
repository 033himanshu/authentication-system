import mongoose from "mongoose"

mongoose.set("strictQuery", false)

const dbConnect = (url)=>{
    
    mongoose.connect(url)
    .then((val)=>{
        console.log("Database Connection Successful")
    })
    .catch((err)=>{
        console.error("Database Connection UnSuccessful", Error)
    })

}


export default dbConnect;
// mongoose.connect()