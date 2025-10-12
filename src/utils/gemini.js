import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateIndexPage = async(duration, roles, companies, priorKnowledges)=>{
    let priorKnowledgeString = '';
    priorKnowledges.map((item)=>{
        priorKnowledgeString += item.level+' '+item.skill+',';
    })
    const schema = {
        description: "Roadmap of study resources and exercises",
        type: SchemaType.OBJECT,
        properties: {
        roadmap: {
            type: SchemaType.OBJECT,
            properties: {
            books: {
                type: SchemaType.ARRAY,
                description: "there should be only one chapters array in book array",
                items: {
                type: SchemaType.OBJECT,
                properties: {
                    chapters: {
                    type: SchemaType.ARRAY,
                    description: "List of chapters in the book. all chapters day combined should be less than or equal to total month i have",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                        day: {
                            type: SchemaType.INTEGER,
                            description: "Total Days to cover this chapter",
                        },
                        topicToCover: {
                            type: SchemaType.STRING,
                            description: "Topic covered in the chapter",
                        }
                        },
                        required: ["day", "topicToCover"],
                    },
                    },
                },
                required: ["chapters"],
                },
            },
            },
            required: ["books"],
        },
        },
    };     
    const prompt = `I am a computer science enthusiast with prior knowledge ${priorKnowledgeString === '' ? 'of nothing' : 'in '+priorKnowledgeString}. My goal is to secure '${roles.toString()}' position 'at ${companies.toString()}' in next ${duration} month Maximum. Analizing how much month do I have could you suggest a personalized roadmap to help me achieve this.calculate sum of totaldays. Roadmap should contain total chapters less than or equal to totalDaysSum/30. avoid giving me options in the topicToCover section.`; 
    const model = genAI.getGenerativeModel(
        { 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }
    );
    let completion = '';
    try {
        completion = await model.generateContent(prompt);
    } catch (error) {
        console.error('Error:- ', error);
    }
    // console.log(completion.response.text());
    return completion.response.text();
};

const generateSubtopics = async(chapterName, totalDays)=>{
    const days = Math.round((totalDays/100)*75) ;
    const schema = {
        description: "Chapter to day-wise subtopics",
        type: SchemaType.OBJECT,
        properties: {
        chapter: {
            type: SchemaType.OBJECT,
            description: "Information related to a specific chapter",
            properties: {
            chapterName: {
                type: SchemaType.STRING,
                description: "The name of the chapter",
                nullable: false,
            },
            totalDays: {
                type: SchemaType.INTEGER,
                description: "Total number of days allocated to cover the chapter",
                nullable: false,
            },
            subtopics: {
                type: SchemaType.ARRAY,
                description: "Array of subtopics to be covered each day",
                items: {
                type: SchemaType.OBJECT,
                properties: {
                    day: {
                    type: SchemaType.INTEGER,
                    description: "The day number for this subtopic",
                    nullable: false,
                    },
                    subtopicName: {
                    type: SchemaType.STRING,
                    description: "Name of the subtopic to cover on this day",
                    nullable: false,
                    },
                },
                required: ["day", "subtopicName"],
                },
            },
            },
            required: ["chapterName", "totalDays", "subtopics"],
        },
        },
        required: ["chapter"],
    };    
    const prompt = `For the chapter '${chapterName}', I have allocated ${days} days to cover the topic. Please divide the chapter into day-by-day subtopics and assign one subtopic per day. Each subtopic should be a logical part of the chapter content and help in building towards mastering the chapter by the end of the allocated days.`;
    const model = genAI.getGenerativeModel(
        { 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }
    );
    let completion = '';
    try {
        completion = await model.generateContent(prompt);
    } catch (error) {
        console.error('Error:- ', error);
    }
    // console.log(completion.response.text());
    return completion.response.text();
};

const generateTask = async(subtopic)=>{
    const schema = {
        description: "Questions, exercises, and resources for a specific subtopic",
        type: SchemaType.OBJECT,
        properties: {
          subtopic: {
            type: SchemaType.STRING,
            description: "The name of the subtopic",
            nullable: false,
          },
          questions: {
            type: SchemaType.ARRAY,
            description: "Array of MCQ-based questions to test understanding of the subtopic",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: {
                  type: SchemaType.STRING,
                  description: "The question text",
                  nullable: false,
                },
                options: {
                  type: SchemaType.ARRAY,
                  description: "List of answer options",
                  items: {
                    type: SchemaType.STRING,
                    nullable: false,
                  },
                },
                correctOption: {
                  type: SchemaType.INTEGER,
                  description: "Index of the correct option (0-based index). Recheck the correct option before providing",
                  nullable: false,
                },
              },
              required: ["question", "options", "correctOption"],
            },
          },
          exercises: {
            type: SchemaType.ARRAY,
            description: "Array of single-line code related to the subtopic",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                task: {
                  type: SchemaType.STRING,
                  description: "Question of the code task ",
                  nullable: false,
                },
                answer: {
                  type: SchemaType.STRING,
                  description: "Correct code of the code task",
                  nullable: false,
                },
              },
              required: ["task", "answer"],
            },
          },
          resources: {
            type: SchemaType.ARRAY,
            description: "Array of resources to learn more about the subtopic",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                link: {
                  type: SchemaType.STRING,
                  description: "URL of the resource",
                  nullable: false,
                },
                type: {
                  type: SchemaType.STRING,
                  description: "Type of resource (e.g., 'YouTube', 'Blog', 'Documentation')",
                  nullable: false,
                },
              },
              required: ["link", "type"],
            },
          },
        },
        required: ["subtopic", "questions", "exercises", "resources"],
    };
    const prompt = `For the subtopic '${subtopic}' that I am covering today, please generate the following in JSON format: 1.Multiple key MCQ-based questions with options that test my understanding of the subtopic.That should be standard,Moderate to Difficult Level,Mostly asked in interview (Min 10 to Max 20 question). 2.Multiple tasks with single-line code solutions (no alternatives and avoid questions with similar answers) that reinforce the subtopic with correct answers provided(Min 3 to Max 7 excercise). 3.Best resources to learn this subtopic, including a YouTube video, blogs, and official documentation.`;
    const model = genAI.getGenerativeModel(
        { 
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }
    );
    let completion = '';
    try {
        completion = await model.generateContent(prompt);
    } catch (error) {
        console.error('Error:- ', error);
    }
    // console.log(completion.response.text());
    return completion.response.text();
    
};


export {
    generateIndexPage,
    generateSubtopics,
    generateTask
}