import mongoose from "mongoose"

const bookSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: [true, 'Duration is required.']
    },
    roles: {
        type: [String],
        enum: ['Frontend', 'Backend', 'Full-Stack', 'Data scientist', 'AI Developer'],
        required: [true, 'You must choose at least one option.']
    },
    companies: {
        type: [String],
        enum: ['Microsoft', 'Google', 'Apple', 'Adobe', 'Medium', ''],
        required: [true, 'You must choose at least one option.']
    },
    priorKnowledges: {
        type: [
            {
                skill: {
                    type: [String],
                    enum: ['JavaScript', 'Python', 'Java', 'C++', 'HTML', ''],
                    level: {
                        type: String,
                        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                        required: true
                    },
                    required: true
                }
            }
        ],
        required: true
    },
    chapters: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chapterai"
            }
        ], required: true
    }
}, {timestamps: true});

export const Book = mongoose.model("Book", bookSchema);