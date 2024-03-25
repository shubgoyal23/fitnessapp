import mongoose from "mongoose";

const WeightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    weight: String
    
},{timestamps: true})

export const Weight = mongoose.model("Weight", WeightSchema)