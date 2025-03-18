import express from "express"
import dotenv from "dotenv"
import dbConnect from "./db/db.js"
import cookieParser from "cookie-parser"
dotenv.config()
const port  = process.env.PORT || 3002
const app = express()


// connect Db
dbConnect(process.env.MONOGDB_URL)


//Routes
import userRoutes from "./routes/user.route.js"



//middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())




// handling routes
const baseUrl = process.env.BASE_URL
app.get(`${baseUrl}/`, (req, res)=>{
    res.send("welcome to Authorizer...")
})
app.use(`${baseUrl}/user`, userRoutes)



//listening
app.listen(port, ()=>{
    console.log("Server started listening on port ", port)
})


