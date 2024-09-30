import express from "express"
import { Creator } from "../models/creator.model.js"
import {generateIndexPage, generateSubtopics} from "../utils/gemini.js"
import jwt from "jsonwebtoken";

const router = express.Router();
router
    .post('/login', async(req, res)=>{
        // console.log(req.body);
        // console.log("- - - - - - - - - - - - - - - - - - - - - - ");
        
        const {email, password} = req.body;
        const existedCreator = await Creator.findOne({
            $or: [{ email }]
        })
        if(existedCreator){
            const checkpassword = await existedCreator.isPasswordCorrect(password);
            if(!checkpassword) {
                res.status(401).send("Incorrect Password ! !")
            }
            const token = jwt.sign({ 
                creatorId: existedCreator.id,
            }, process.env.JWT_SECRET_CREATOR)
            res.status(201).json({token});
        } else {
            res.status(401).send("Mail id is not associated with an account. Create a account first ! !");
        }
    })
router
    .post('/signup', async(req, res)=>{
        // console.log(req.body);
        // console.log("- - - - - - - - - - - - - - - - - - - - - - ");

        const {name, email, password} = req.body;
        if(!name && !email && !password){
            res.status(401).send("some input values are missing ! !");
        }
        const existedCreator = await Creator.findOne({
            $or: [{ email }]
        })
        if(existedCreator){
            res.status(401).send("Mail id is already associated with an account. Use a different one ! !");
        } else {
            const creator = await Creator.create({
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

        const duration = '12';
        const roles = [ 'Frontend', 'Backend' ];
        const companies = [ 'Google', 'Medium' ];
        const priorKnowledges = [ { skill: 'JavaScript', level: 'Beginner' } ];
        // let result = await generateIndexPage(6, ['Frontend Engineer','Backend Engineer','Full Stack Engineer'], ['Medium','LinkedIn','GitHub'], [{skill: 'java', level: 'Basic'},{skill: 'python', level: 'Advanced'}]);
        // console.log(result);
        const chapterName = "JavaScript Fundamentals";
        const totalDays = 30;
        let subtopic = await generateSubtopics(chapterName, totalDays);
        const result = JSON.parse(subtopic).chapter.subtopics;
        // let result = await generateIndexPage(duration, roles, companies, priorKnowledges);
        // console.log("result - ",result);

        // const chapters = result.roadmap.books[0].chapters;
        // console.log("Chapters - ",chapters);
        res.send(result);
    })


export default router;