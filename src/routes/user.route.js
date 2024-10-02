import express from "express"
import { User } from "../models/user.model.js"
import { Book } from "../models/book.model.js"
import { Chapterai } from "../models/chapterai.model.js"
import {generateIndexPage, generateSubtopics, generateTask} from "../utils/gemini.js"
import {authMiddlewareUser} from "../middlewares/authorization.middleware.js"
import jwt from "jsonwebtoken";
import { Taskai } from "../models/taskai.model.js"

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
            res.status(401).send("Mail id is not associated with an account. Create a account first ! !");
        }
    })
router
    .post('/signup', async(req, res)=>{
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
            console.log(token);
            
            return res.status(201).json({token});
        }
    })
router
    .post('/personalinfo', authMiddlewareUser, async(req, res)=>{
        console.log(req.body);
        
        const userId = req.userId; // shold not be hard coded
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
        const newUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { roadmaps: book } 
            }
        );
        const result = await generateIndexPage(duration, roles, companies, priorKnowledges);
        const chapters = JSON.parse(result).roadmap.books[0].chapters;
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
                    $push: { chapters: chapterai._id },
                }
            );
            if (index ===  0){
                const chapterName = item.topicToCover;
                const totalDays = item.day;
                let subtopic = await generateSubtopics(chapterName, totalDays);
                const chapterList = JSON.parse(subtopic).chapter.subtopics;
                await Book.findByIdAndUpdate(
                    book._id,
                    {
                        $inc: { currentChapter: 1 },
                    }
                );
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
                        
                        await Chapterai.findByIdAndUpdate(
                            chapterai._id,
                            {
                                $inc: { currentTask: 1 } 
                            }
                        );
                        const task = await Taskai.create({
                            exercises,
                            questions,
                            resources,
                            subtopicName,
                            locked: false,
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
router
    .get('/openedTask/:bookId/:chapterId/:taskId', authMiddlewareUser, async(req, res)=>{
        const chapter = await Chapterai.findOne({
            $or: [{ _id: req.params.chapterId }]
        });
        const task = await Taskai.findOne({
            $or: [{ _id: req.params.taskId }]
        });
        console.log(task);
        
        if(task.opened){
            return res.status(201).json({task});
        } else {
            const nextTaskIndex = (chapter.currentTask)+1;
            if(nextTaskIndex === chapter.subtopicNames.length){
                const book = await Book.findOne({
                    $or: [{ _id: req.params.bookId }]
                });
                const nextChapterIndex = (book.currentChapter)+1;
                const chapterai = await Chapter.findOne({
                    $or: [{ _id: book.chapters[nextChapterIndex] }]
                });
                const chapterName = nextChapterIndex.topicToCover;
                const totalDays = nextChapterIndex.day;
                let subtopic = await generateSubtopics(chapterName, totalDays);
                const chapterList = JSON.parse(subtopic).chapter.subtopics;
                await Book.findByIdAndUpdate(
                    book._id,
                    {
                        $inc: { currentChapter: 1 },
                    }
                );
                for (let j = 0; j < chapterList.length; j++) {
                    await Chapterai.findByIdAndUpdate(
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
            } else {
                const subtopic = chapter.subtopicNames[nextTaskIndex];
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
                    req.params.chapterId,
                    {
                        $push: { tasks: task._id } 
                    }
                )
            }
            await Taskai.findByIdAndUpdate(
                req.params.taskId,
                {
                    $set: { opened: true } 
                }
            );
            return res.status(201).json({task});
        }
    })
router
    .post('/submitTask/:chapterId/:taskId', authMiddlewareUser, async(req, res)=>{
        const {allQuestionCheck, allExerciseChecK} = req.body;
        const taskId = req.params.taskId; 
        const chapterId = req.params.chapterId; 
        if(allQuestionCheck && allExerciseChecK){
            await Taskai.findByIdAndUpdate(
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
            await Chapterai.findByIdAndUpdate(
                chapterId,
                {
                    $inc: { currentTask: 1 } 
                }
            );
            res.status(201).json({message : "Answer Submitted - Next Task Unlocked", nextTask: latestTask});
        } else {
            res.status(401).send("Wrong Answer - Check Your Answers Thoroughly Before Submitting");
        }
    })
router
    .get('/userProfile', authMiddlewareUser, async(req, res)=>{
        const user = await User.findOne({
            $or: [{ _id: req.userId }]
        });
        return res.status(201).json(user);
    })
router
    .get('/chapterList/:bookId', authMiddlewareUser, async(req, res)=>{
        const book = await Book.findOne({
            $or: [{ _id: req.params.bookId }]
        });
        let list = [];
        for(let i=0 ; i<book.chapters.length ; i++){
            const chapter = await Chapterai.findOne({
                $or: [{ _id: book.chapters[i] }]
            });
            list[i] = chapter.chapterName;
        }
        return res.status(201).json({list,book});
    })
router
    .get('/taskList/:chapterId', authMiddlewareUser, async(req, res)=>{
        const chapter = await Chapterai.findOne({
            $or: [{ _id: req.params.chapterId }]
        });
        return res.status(201).json(chapter);
    })
export default router;