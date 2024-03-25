import mongoose, { mongo } from "mongoose";

const DetialsSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
      gender: {
         type: String,
         enum: ["male", "female", "other"],
      },
      weight: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Weight",
         },
      ],
      height: {
         type: String,
      },
   },
   { timestamps: true }
);

export const Detail = mongoose.model("Detail", DetialsSchema);
