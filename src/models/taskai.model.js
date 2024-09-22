import mongoose from "mongoose";

const taskAISchema = new mongoose.Schema({
    subtopicName: {
        type: String,
        required: true
    },
    questions: {
        type: Object,
        required: true
    },
    exercises: {
        type: Object,
        required: true
    },
    resources: {
        type: Object,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

export const Taskai = mongoose.model("Taskai", taskAISchema);