import express from "express"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";

const router = express.Router();
router
    .post('/login', async(req, res)=>{
        const {email, password} = req.body;
        const existedUser = await User.findOne({
            $or: [{ email }]
        })
        if(existedUser){
            const checkpassword = await existedUser.isPasswordCorrect(password);
            if(!checkpassword) {
                res.status(401).send("Incorrect Password ! !")
            }
            const token = jwt.sign({ 
                userId: existedUser.id,
            }, process.env.JWT_SECRET_USER)
            res.status(201).json({token});
        } else {
            res.send("Mail id is not associated with an account. Create a account first ! !");
        }
    })
router
    .post('/signup', async(req, res)=>{
        const {name, email, password} = req.body;
        const existedUser = await User.findOne({
            $or: [{ email }]
        })
        if(existedUser){
            res.send("Mail id is already associated with an account. Use a different one ! !");
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

export default router;