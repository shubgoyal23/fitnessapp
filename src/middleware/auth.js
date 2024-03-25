import jwt from "jsonwebtoken";
import User from "../model/auth.js";

// check user's authenticity
export const verifyToken = async (req, res, next) => {
   try {
      const token =
         req.cookies.token ||
         req.body.token ||
         req.header("Authorization").replace("Bearer ", "");

      // in case if token not there
      if (!token) {
         return res
            .status(401)
            .json({ success: false, message: `Token Missing` });
      }

      // if found
      try {
         const decode = await jwt.verify(token, process.env.JWT_SECRET);

         const user = await User.findById(decode?._id)?.select("-password");

         if (user) {
            req.user = user;
         }
      } catch (error) {
         return res
            .status(401)
            .json({ success: false, message: "token is invalid" });
      }

      next();
   } catch (error) {
      return res.status(401).json({
         success: false,
         message: `Something Went Wrong While Validating the Token`,
      });
   }
};


