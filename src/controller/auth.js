import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import mailSender from "../utils/mailSender.js";

import User from "../model/auth.js";
import OTP from "../model/otp.js";


// send OTP for email verification
export const sendEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // check wheather user exist or not
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(401).json({
                success: false,
                message: `User is Already Registered, can't move forward now`,
            })
        }

        // if it's new user then generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        const result = await otp.findOne({ otp: otp })
        console.log("otp result", result)

        // makesure otp is unique (generate new otp if last otp already exists in db)
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
        }

        // create otp entry in db
        const otpBody = await OTP.create({ email, otp });

        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        })

    } catch (error) {
        return res.status(500).json({
            sucess: false,
            error: error.message,
        })
    }
}

export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, otp } = req.body;
        // Validations

        // makesure user must filled all details
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }

        // password && confirmPassword must match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not match. Please try again.",
            })
        }

        // user's email must be unique
        const userPresent = await User.findOne({ email });

        if (userPresent) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        // hash the password for security reason
        const hashPassword = await bcrypt.hash(password, 10);

        // Find the most recent otp
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (!response) {
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            })
        } else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            })
        }

        // if otp match then create user entry in db

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
        })

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occur while registering the user",
            error: error.message,
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            })
        }

        // check password with userDb password

        // if password is match the create token and cookie
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "24h", }
            )

            user.token = token,
                user.password = undefined,

                // user contains all the details except password

                res.cookie("token", token,
                    {
                        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        httpOnly: true,
                    }
                )
        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occured while login",
            error: error.message,
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        // fetch data
        const userDetails = await User.findById(req.user.id)
        const { oldPassword, newPassword } = req.body;

        const isPassMatched = await bcrypt.compare(oldPassword, userDetails.password);

        if (!isPassMatched) {
            return res
                .status(401)
                .json({ success: false, message: "The password is incorrect" })
        }

        // if password got match then simply update password in db after hashing

        const hashNewPassword = bcrypt.hash(newPassword, 10)

        const updatePassword = await User.findByIdAndUpdate(userDetails._id, { password: hashNewPassword }, { new: true })

        // after updating password lets notify user for this account activity 

        try {
            // email, title, body
            const emailResponse = await mailSender(userDetails.email,
                "Password for your account has been updated",
                `Password updated successfully for ${userDetails.firstName} ${userDetails.lastName}`
            )
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }

        return res.status(200).json({
            success: true,
            message: "Password updated Successfully Now",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}

export const resetToken = async(req,res) => {
    try{

    } catch (error) {

    }
}