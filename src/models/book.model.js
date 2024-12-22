import mongoose from "mongoose"

const bookSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: [true, 'Duration is required.']
    },
    roles: {
        type: [String],
        enum: ['Frontend Engineer', 'Backend Engineer', 'Full-Stack Engineer', 'Data Scientist', 'AI Developer'],
        required: [true, 'You must choose at least one option.']
    },
    companies: {
        type: [String],
        enum: ['Microsoft', 'Google', 'Apple', 'Adobe', 'Medium', 'Samsung'],
        required: [true, 'You must choose at least one option.']
    },
    priorKnowledges: {
        type: [
            {
                skill: {
                    type: String,
                    enum: ['JavaScript', 'Python', 'Java', 'C++', 'Go'],
                    required: true
                },
                level: {
                    type: String,
                    enum: ['Beginner', 'Intermediate', 'Advanced'],
                    required: true
                },
            }
        ],
        required: true
    },    
    currentChapter: {
        type: Number,
        default: -1,
    },
    chapters: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chapterai"
            }
        ], 
        required: true
    }
}, {timestamps: true});

export const Book = mongoose.model("Book", bookSchema);