import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { addDetails, editDetails, getDetails } from "../controller/details.controller.js";


const router = Router()

router.route("/").get(verifyToken, getDetails)
router.route("/").post(verifyToken, addDetails)
router.route("/").patch(verifyToken, editDetails)


export default router