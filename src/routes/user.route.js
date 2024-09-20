import express from "express"
import { User } from "../models/user.model.js"

const router = express.Router();
router
    .post('/login', async(req, res)=>{
        const {name, email, password, educationLevel, interests, duration, priorKnowledge, futureCareerInterest } = req.body;
        const existedUser = await User.findOne({
            $or: [{ email }]
        })
        if(existedUser){
            const checkpassword = await User.isPasswordCorrect(password);
            if(!checkpassword) {
                res.status(401).send("Incorrect Password ! !")
            }
            const token = jwt.sign({ 
                userId: existedUser.id,
            }, process.env.JWT_SECRET_USER)
            res.status(201).json({token});
        } else {
            const user = await User.create({
                name,
                email,
                password,
                educationLevel,
                interests,
                duration,
                priorKnowledge,
                futureCareerInterest
            })
            const token = jwt.sign({ 
                userId: user.id,
            }, process.env.JWT_SECRET_USER)
            res.status(201).json({token});
        }
    })