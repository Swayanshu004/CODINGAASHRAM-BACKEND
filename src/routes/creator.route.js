import express from "express"
import { Creator } from "../models/creator.model.js"
import {generateIndexPage} from "../utils/gemini.js"

const router = express.Router();
router
    .post('/login', async(req, res)=>{
        const {name, email, password} = req.body;
        const existedCreator = await Creator.findOne({
            $or: [{ email }]
        })
        if(existedCreator){
            const checkpassword = await Creator.isPasswordCorrect(password);
            if(!checkpassword) {
                res.status(401).send("Incorrect Password ! !")
            }
            const token = jwt.sign({ 
                creatorId: existedCreator.id,
            }, process.env.JWT_SECRET_CREATOR)
            res.status(201).json({token});
        } else {
            const creator = await Admin.create({
                name,
                email,
                password
            })
            const token = jwt.sign({ 
                creatorId: creator.id,
            }, process.env.JWT_SECRET_CREATOR)
            res.status(201).json({token});
        }
    })
    
// TESTING :-
router
    .post('/aioutput', async(req, res)=>{

        let result = await generateIndexPage(6, ['Frontend Engineer','Backend Engineer','Full Stack Engineer'], ['Medium','LinkedIn','GitHub'], [{skill: 'java', level: 'Basic'},{skill: 'python', level: 'Advanced'}]);
        console.log(result);
        
        res.send(result);
    })


export default router;