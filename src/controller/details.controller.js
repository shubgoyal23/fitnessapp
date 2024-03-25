import { Detail } from "../model/basicDetails.model.js";
import { Weight } from "../model/weight.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addDetails = asyncHandler(async (req, res) => {
   const { gender, weight, height } = req.body;

   if (!(gender && weight && height)) {
      throw new ApiError(401, "All Feilds are Required");
   }

   const addWeigth = await Weight.create({
      userId: req.user?._id,
      weight: weight,
   });

   if (!addWeigth) {
      throw new ApiError(401, "Failed to add weight");
   }

   const addDetails = await Detail.create({
      userId: req.user?._id,
      gender,
      height,
      weight: [addWeigth],
   });

   if (!addDetails) {
      throw new ApiError(401, "Failed to add Details");
   }

   res.status(200).json(
      new ApiResponse(200, addDetails, "user Details Added Successfully")
   );
});

const editDetails = asyncHandler(async (req, res) => {
   const { gender, weight, height } = req.body;

   const user = await Detail.findOne({ userId: req.user?._id });

   gender ? (user.gender = gender) : "";
   height ? (user.height = height) : "";

   if (weight) {
      const addWeigth = await Weight.create({
         userId: req.user?._id,
         weight: weight,
      });

      if (!addWeigth) {
         throw new ApiError(401, "Failed to add weight");
      }

      user.weight.push(addWeigth)
   }

   await user.save()

   res.status(200).json(
      new ApiResponse(200, addDetails, "user Details updated Successfully")
   );
});

const getDetails = asyncHandler(async(req,res) => {
    const details = await Detail.findOne({userId: req.user._id})

    if(!details){
        throw new ApiError(404, "Cannot find any details for user")
    }

    return res.status(200).json(new ApiResponse(200, details, "user details fetched successfully"))
})

export {addDetails, editDetails, getDetails}
