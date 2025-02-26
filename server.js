//Backend Server-------------------------------------------------------------------------------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
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
    Married:Boolean,
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
  const encryptionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  // Updated encrypt function that returns a string representation
function encrypt(text) {
    try {
      if (!text) text = '';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return a string format that can be easily stored in MongoDB
      return JSON.stringify({
        iv: iv.toString('hex'),
        data: encrypted
      });
    } catch (err) {
      console.error('Encryption error:', err);
      return ''; // Return empty string on error
    }
  }
  
  function decrypt(encryptedObj) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      encryptionKey, 
      Buffer.from(encryptedObj.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  

const User = mongoose.models.User || mongoose.model("User", userSchema);

app.get("/api/users/:email", async (req, res) => {
    try {
        const {email} = req.params;
        console.log(email);
        const user = await User.findOne({ email }).select("-password");
        console.log(user);
        if(!user){
           return res.json({valid : 0 , message: "Not Found!"});
        }
        if (user) {
            const token = req.headers.authorization?.split(" ")[1];
            console.log(token);

            if (!token) {
                return res.json({valid:1, message: "Email already registered" });
            }
            try {
                console.log(process.env.JWT_SECRET);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(decoded.email);
                if (decoded.email !== email) {
                    return res.json({ valid: 2, message: "Unauthorized access" });
                }
                console.log(decoded.email);
                return res.status(200).json({ valid: 3, user });
            } catch (err) {
                return res.status(404).json({ valid: 4, message: "Invalid or expired token" });
            }
        }
    } catch (error) {
        console.error("Error checking email:", error);
        return res.json({ valid: 5,message: "Server error" });
    }
});

app.post("/api/users", async (req, res) => {
    try {
        const {
 firstName, lastName, email, password, userage,Married,
  Spousename, Spouseage, Spousemonthlyincome,Children,
  monthlyincome,Primaryfinancialgoal,phone,Bankname,AccountNumber,
  IFSCCode,LinkedCard,rememberMe ,recievepermission,UPIID} = req.body;
  console.log(email);
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({valid:false, error: "Email already registered" });
    const monthlyIncomeStr = monthlyincome || '';
    const spouseIncomeStr = Spousemonthlyincome || '';
    const bankNameStr = Bankname || '';
    const accountNumberStr = AccountNumber || '';
    const ifscStr = IFSCCode || '';
    const linkedCardStr = LinkedCard || '';
    const upiStr = UPIID || '';
        const hashedPassword = await bcrypt.hash(password , 10);
        const hashmonthlyincome = encrypt(monthlyIncomeStr);
      const hashspouseincome = encrypt(spouseIncomeStr);
      const hashbank = encrypt(bankNameStr);
      const hashaccnumber = encrypt(accountNumberStr);
      const hashifsc = encrypt(ifscStr);
      const hashlink = encrypt(linkedCardStr);
      const hashup = encrypt(upiStr);
        const newUser = new User({
             firstName, lastName, email,password:hashedPassword,
             userage,Married,
  Spousename, Spouseage, Spousemonthlyincome : hashspouseincome,Children,
  monthlyincome : hashmonthlyincome,Primaryfinancialgoal,phone,Bankname : hashbank,AccountNumber : hashaccnumber,
  IFSCCode : hashifsc,LinkedCard : hashlink,rememberMe ,recievepermission,UPIID : hashup
            });
        await newUser.save();
        console.log(email);
        console.log(email);
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
        if (!user) return res.json({valid:2,error: "Invalid email or password"});
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) return res.json({valid:1, error: "Invalid email or password" });
        const accessToken = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1m"});
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({valid:0, accessToken, message: "Sign-in successful" });
    } catch (error) {
        res.status(500).json({ error: "Sign-in failed" });
    }
});

//logout

app.post("/api/logout", (req, res) => {
    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "Strict" });
    res.status(200).json({ message: "Logged out successfully" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
