import mongoose from "mongoose";

const chapterAISchema = new mongoose.Schema({
    chapterName: {
        type: String,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    currentTask: {
        type: Number,
        default: -1,
        required: true
    },
    subtopicNames: {
        type: [String],
        required: true
    },
    tasks: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Taskai"
            }
        ], required: true
    }
}, {timestamps: true});

export const Chapterai = mongoose.model("Chapterai", chapterAISchema);