//Backend Server-------------------------------------------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { configDotenv } = require("dotenv");
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(cors({
    origin: '*', 
    credentials: true
  }));

app.use(bodyParser.json());

//connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

//schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true},
    password: String,
    userage:Number,
    Spousename:String,
    Spouseage:Number,
    Spousemonthlyincome:String,
    Children:Number,
    monthlyincome:String,
    Primaryfinancialgoal:String,
    phone: String,
    Bankname:String,
    AccountNumber: String,
    IFSCCode:String,
    LinkedCard:String,
    rememberMe:Boolean,
    recievepermission:Boolean,
    UPIID:String,
  });
  

const User = mongoose.models.User || mongoose.model("User", userSchema);

app.get("/api/users/:email", async (req, res) => {
    try {
        const {email} = req.params;
        console.log(email);
        const user = await User.findOne({ email }).select("-password");
        console.log(user);
        if (user) {
            const token = req.headers.authorization?.split(" ")[1];
            console.log(token);

            if (!token) {
                return res.json({valid:false, message: "Email already registered" });
            }
            try {
                console.log(process.env.JWT_SECRET);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decoded.email);
                if (decoded.email !== email) {
                    return res.json({ valid: false, message: "Unauthorized access" });
                }
                console.log(decoded.email);
                return res.status(200).json({ valid: true, user });
            } catch (err) {
                return res.status(404).json({ valid: false, message: "Invalid or expired token" });
            }
        } else {
            console.log("kokok");
            return res.json({ valid: false, message: "Not found!"});
        }
    } catch (error) {
        console.error("Error checking email:", error);
        return res.json({ valid:false,message: "Server error" });
    }
});

app.post("/api/users", async (req, res) => {
    try {
        const {
 firstName, lastName, email, password, userage,
  Spousename, Spouseage, Spousemonthlyincome,Children,
  monthlyincome,Primaryfinancialgoal,phone,Bankname,AccountNumber,
  IFSCCode,LinkedCard,rememberMe ,recievepermission,UPIID} = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({valid:false, error: "Email already registered" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashspouseincome = await bcrypt.hash(Spousemonthlyincome, 10);
        const hashmonthlyincome = await bcrypt.hash(monthlyincome, 10);
        const hashbank = await bcrypt.hash(Bankname, 10);
        const hashaccnumber = await bcrypt.hash(AccountNumber, 10);
        const hashifsc = await bcrypt.hash(IFSCCode, 10);
        const hashlink = await bcrypt.hash(LinkedCard , 10);
        const hashup = await bcrypt.hash(UPIID,10);
        const newUser = new User({
             firstName, lastName, email,password:hashedPassword, 
             userage,
  Spousename, Spouseage, Spousemonthlyincome : hashspouseincome,Children,
  monthlyincome : hashmonthlyincome,Primaryfinancialgoal,phone,Bankname : hashbank,AccountNumber : hashaccnumber,
  IFSCCode : hashifsc,LinkedCard : hashlink,rememberMe ,recievepermission,UPIID:hashup
            });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1m"});//if remmemberme -->7d else 1m
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true, // Use HTTPS in production
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({token, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

app.post("/api/signin", async (req, res) => {
    try {
        const { email, password ,rememberMe} = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.json({valid:false,error: "Invalid email or password" });
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) return res.json({valid:false, error: "Invalid email or password" });
        const accessToken = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1m"});
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ accessToken, message: "Sign-in successful" });
    } catch (error) {
        res.status(500).json({ error: "Sign-in failed" });
    }
});