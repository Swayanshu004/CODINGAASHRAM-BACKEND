import 'dotenv/config'
import express from "express"
import connectDB from "./db/index.js"
import creatorRoute from './routes/creator.route.js'
import userRoute from './routes/user.route.js'

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

connectDB()
.then(()=>{
    console.log("- - MongoDB Connected - -");
    app.listen(process.env.PORT,()=>{
        console.log(`- - SERVER STARTED ON PORT : ${process.env.PORT} - -`);
    })
}
).catch((err)=>{
    console.error("MongoDB connection failed :- ",err);
})

app.use("/v1/user", userRoute)
app.use("/v1/creator", creatorRoute)