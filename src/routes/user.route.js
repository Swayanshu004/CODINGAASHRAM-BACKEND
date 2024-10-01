import express from "express"
import { User } from "../models/user.model.js"
import { Book } from "../models/book.model.js"
import { Chapterai } from "../models/chapterai.model.js"
import {generateIndexPage, generateSubtopics, generateTask} from "../utils/gemini.js"
import jwt from "jsonwebtoken";
import { Taskai } from "../models/taskai.model.js"

const router = express.Router();
router
    .post('/login', async(req, res)=>{
        // console.log(req.body);
        // console.log("- - - - - - - - - - - - - - - - - - - - - - ");

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
        const existedUser = await User.findOne({
            $or: [{ email }]
        })
        if(existedUser){
            res.status(401).send("Mail id is already associated with an account. Use a different one ! !");
        } else {
            const user = await User.create({
                name,
                email,
                password,
            })
            const token = jwt.sign({ 
                userId: user.id,
            }, process.env.JWT_SECRET_USER)
            res.status(201).json({token});
        }
    })
router
    .post('/personalinfo', async(req, res)=>{
        // console.log(req.body);
        // console.log("- - - - - - - - - - - - - - - - - - - - - - ");

        const userId = "66f9b12c4d80656ea2c06cdd"; // shold not be hard coded
        const existedUser = await User.findOne({
            $or: [{ _id: userId }]
        })
        const {duration, roles, companies, priorKnowledges} = req.body;
        if(!duration && !roles && !companies && !priorKnowledges){
            res.status(401).send("some input values are missing ! !");
        }
        if(!existedUser){
            res.status(401).send("No user found with this userId ! !");
        }
        const book = await Book.create({
            duration,
            roles,
            companies,
            priorKnowledges,
        })
        // console.log("book :- ", book._id);
        const newUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { roadmaps: book } 
            }
        );
        // console.log("user updated :- ", newUser);
        const result = await generateIndexPage(duration, roles, companies, priorKnowledges);
        // console.log("result - ",typeof result);
        const chapters = JSON.parse(result).roadmap.books[0].chapters;
        // console.log("chapters - ",typeof chapters);
        let updatedBook;
        for (let index = 0; index < chapters.length; index++) {
            const item = chapters[index];
            const chapterai = await Chapterai.create({
                chapterName: item.topicToCover,
                totalDays: item.day
            })
            updatedBook = await Book.findByIdAndUpdate(
                book._id,
                {
                    $push: { chapters: chapterai._id } 
                }
            );
            if (index ===  0){
                const chapterName = item.topicToCover;
                const totalDays = item.day;
                let subtopic = await generateSubtopics(chapterName, totalDays);
                const chapterList = JSON.parse(subtopic).chapter.subtopics;
                for (let j = 0; j < chapterList.length; j++) {
                    const chapter = await Chapterai.findByIdAndUpdate(
                        chapterai._id,
                        {
                            $push: { subtopicNames: chapterList[j].subtopicName } 
                        }
                    );
                    if (j === 0){
                        const subtopic = chapterList[j].subtopicName;
                        let taskai = await generateTask(subtopic);
                        const exercises = JSON.parse(taskai).exercises;
                        const questions = JSON.parse(taskai).questions;
                        const resources = JSON.parse(taskai).resources;
                        const subtopicName = JSON.parse(taskai).subtopic;
                        
                        const task = await Taskai.create({
                            exercises,
                            questions,
                            resources,
                            subtopicName,
                            locked: false
                        });
                        await Chapterai.findByIdAndUpdate(
                            chapterai._id,
                            {
                                $push: { tasks: task._id } 
                            }
                        )
                    }
                }
            }
        }
        res.status(201).json({updatedBook});
    })

// To be tested --
router
    .post('/submitTask/:chapterId/:taskId', async(req, res)=>{
        // console.log(req.body);
        // console.log("- - - - - - - - - - - - - - - - - - - - - - ");
        const {allQuestionCheck, allExerciseChecK} = req.body;
        const taskId = req.params.taskId; 
        const chapterId = req.params.chapterId; 
        if(allQuestionCheck && allExerciseChecK){
            const task = await Taskai.findByIdAndUpdate(
                taskId,
                {
                    $set: { completed: true } 
                }
            );
            const chapter = await Chapterai.findOne({
                $or: [{ _id: chapterId }]
            });
            const latestTaskId = chapter.tasks[(chapter.tasks.length)-1];
            const latestTask = await Taskai.findByIdAndUpdate(
                latestTaskId,
                {
                    $set: { locked: false } 
                }
            );
            res.status(201).json({message : "Answer Submitted - Next Task Unlocked", nextTask: latestTask});
        } else {
            res.status(401).send("Wrong Answer - Check Your Answers Thoroughly Before Submitting");
        }
    })
router
    .post('/generateNextTask', async(req, res)=>{
        console.log(req.body);
        console.log("- - - - - - - - - - - - - - - - - - - - - - ");

    })

export default router;