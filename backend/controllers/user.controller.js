import { User } from "../models/user_model.js";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { z } from "zod"; // Import Zod for validation
import jwt from "jsonwebtoken"; // Import JWT for token generation
import dotenv from 'dotenv'; // Import dotenv for environment variables
import { item } from "../models/item_model.js";
import { Purchase } from "../models/purchase.model.js";
import nodemailer from "nodemailer";
import { Otp } from "../models/otp.model.js";
dotenv.config(); // Load environment variables from .env file

// Helper function to send OTP email
const sendOtpEmail = async (to, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app password
            // console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS);
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Email Verification OTP',
        text: `Your OTP for email verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

// Define Zod schema for validation
const userSchema = z.object({
    firstName: z.string().min(3, "First name is required & atleast of 3 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    mobile: z.number().int().positive("Mobile number must be a positive integer"),
    password: z.string().min(8, "Password must be at least 8 characters long")
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must include one uppercase letter, one lowercase letter, one digit, and one special character"),
});

// POST /signup - send OTP only
const sendEmailOtp = async (req, res) => {
    try {
        const { email, firstName, mobile } = req.body;
        if (!email || !firstName || !mobile) {
            return res.status(400).json({ error: "Email, first name, and mobile are required to send OTP." });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Generate OTP and expiry (valid for 10 minutes)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        // Upsert OTP in Otp collection
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiry },
            { upsert: true, new: true }
        );
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: "OTP sent to your email." });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /verify-email-otp - verify OTP only
const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpDoc = await Otp.findOne({ email });
        if (!otpDoc) {
            return res.status(400).json({ error: "No OTP found. Please request a new one." });
        }
        if (otpDoc.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        if (otpDoc.expiry < new Date()) {
            return res.status(400).json({ error: "OTP expired. Please request a new one." });
        }
        // OTP is valid, delete it (one-time use)
        await Otp.deleteOne({ email });
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email OTP:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /register - create user after OTP verified
const register = async (req, res) => {
    try {
        const validatedData = userSchema.parse(req.body);
        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Check if mobile number already exists
        const existingMobile = await User.findOne({ mobile: validatedData.mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "Mobile number already exists" });
        }
        // Check if OTP was verified (no OTP doc should exist for this email)
        const otpDoc = await Otp.findOne({ email: validatedData.email });
        if (otpDoc) {
            return res.status(400).json({ error: "Please verify your email before registering." });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const isSeller = req.body.isSeller === true || req.body.isSeller === "true";
        const newUser = new User({
            ...validatedData,
            password: hashedPassword,
            isSeller,
            isEmailVerified: true
        });
        await newUser.save();
        // Generate JWT and set cookie (auto-login)
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, isSeller: newUser.isSeller },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };
        res.cookie("jwt", token, cookieOptions);
        res.status(201).json({ message: "Signup successful. You are now logged in.", token, user: newUser });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            if (field === 'email') {
                return res.status(400).json({ error: "Email already exists" });
            } else if (field === 'mobile') {
                return res.status(400).json({ error: "Mobile number already exists" });
            } else {
                return res.status(400).json({ error: `${field} already exists` });
            }
        }
        
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    try {
        // Validate input
        const validatedData = userSchema.pick({ email: true, password: true }).parse(req.body);

        // Find user
        const user = await User.findOne({ email: validatedData.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!user.isEmailVerified) {
            return res.status(401).json({ error: "Email not verified. Please verify your email before signing in." });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isSeller: user.isSeller },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Set cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({ message: "Successfully signed in", token, user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const updateUser = async (req, res) => {
  const userId = req.userId;

  try {
    const { oldPassword, password, ...updateFields } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    if (!oldPassword) return res.status(400).json({ error: "Current password is required." });

    const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Incorrect current password." });

    let schema = userSchema.partial();
    if (!password) {
      schema = schema.omit({ password: true });
    }

    const validatedData = schema.parse(updateFields);

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      validatedData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: validatedData }, { new: true, runValidators: true });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
    const userId = req.userId; // Assuming user ID is stored in req.user
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        console.error("Error deleting User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        // Retrieve all non-seller users from the database
        const users = await User.find({ isSeller: false });

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No non-seller users found" });
        }

        res.status(200).json({ message: "Non-seller users retrieved successfully", users });
    } catch (error) {
        console.error("Error retrieving Users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getSellers = async (req, res) => {
    try {
        // Retrieve all seller users from the database
        const sellers = await User.find({ isSeller: true });

        if (!sellers || sellers.length === 0) {
            return res.status(404).json({ error: "No seller users found" });
        }

        res.status(200).json({ message: "Seller users retrieved successfully", sellers });
    } catch (error) {
        console.error("Error retrieving Sellers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};   


const getAllPurchases = async (req,res) => {
    const userId=req.userId;
    try {
        const purchases = await Purchase.find({ userId })
            .populate({
                path: 'itemId',
                populate: {
                    path: 'creatorId',
                    model: 'user',
                    select: 'firstName lastName' 
                }
            })
            .sort({ date: -1 });

        res.status(200).json({
            purchases: purchases || [],
        });
    } catch (error) {
        console.log("Error in Purchase", error);
        res.status(500).json({error: "Error in Purchase"})
    }
}

const signOut = (req, res) => {
    try {   
        if(!req.cookies.jwt) {
            return res.status(400).json({ error: "No active session found.Please login" });
        }
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        
        // Respond with a success message
        res.status(200).json({ message: "Successfully signed out" });
    } catch (error) {
        console.error("Error signing out User:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
}

const getDetails = async (req, res) => {
    const userId = req.userId; // Assuming user ID is stored in req.user

    try {
        // Find the user by ID
        const user = await User.findById(userId).select("-password"); // Only exclude password
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        res.status(200).json({ message: "User retrieved successfully", user });
    } catch (error) {
        console.error("Error retrieving User details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const checkLoginStatus = (req, res) => {
    if (req.userId) {
        return res.status(200).json({ loggedIn: true, user: req.user });
    }
    res.status(401).json({ loggedIn: false });
};

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        console.error("Error getting wishlist:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const toggleWishlist = async (req, res) => {
    const { itemId } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const itemIndex = user.wishlist.indexOf(itemId);
        if (itemIndex > -1) {
            // Item exists, remove it
            user.wishlist.splice(itemIndex, 1);
        } else {
            // Add new item
            user.wishlist.push(itemId);
        }

        await user.save();
        const populatedUser = await user.populate('wishlist');
        res.status(200).json({ message: "Wishlist updated", wishlist: populatedUser.wishlist });
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export {
  sendEmailOtp,
  signIn,
  updateUser,
  deleteUser,
  getUsers,
  getSellers,
  getAllPurchases,
  signOut,
  getDetails,
  checkLoginStatus,
  getWishlist,
  toggleWishlist,
  verifyEmailOtp,
  register
};
