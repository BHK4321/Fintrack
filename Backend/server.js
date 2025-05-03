//----------------------------------------------------------Backend Server----------------------------------------------------------

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { configDotenv } = require("dotenv");
const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;
//---------------------------------------------------------------------

app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://my-backend-api-erp6.onrender.com/auth/google/callback", // Update this based on your setup
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create the user in your database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    return;
                }

                // Generate JWT token
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "7d",
                });

                return done(null, { user, token });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

//---------------------------------------------------------------------

//connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB Connected"))
    .catch(err => console.error(" MongoDB Connection Error:", err.message));

//schema
const userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: String,
    userage: Number,
    Married: Boolean,
    Spousename: String,
    Spouseage: Number,
    Spousemonthlyincome: String,
    Children: Number,
    monthlyincome: String,
    Primaryfinancialgoal: String,
    phone: String,
    Bankname: String,
    AccountNumber: String,
    IFSCCode: String,
    LinkedCard: String,
    rememberMe: Boolean,
    recievepermission: Boolean,
    UPIID: String,
});

//---------------------------------------------------------------------

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
const IV_LENGTH = 16;
//console.log(ENCRYPTION_KEY.toString("hex"));
// Encrypt Function
function encrypt(text) {
    try {
        if (!text) text = "";
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        return JSON.stringify({
            iv: iv.toString("hex"),
            data: encrypted,
        });
    } catch (err) {
        console.error("Encryption error:", err);
        return "";
    }
}

// Decrypt Function
function decrypt(encryptedStr) {
    try {
        if (!encryptedStr) return "";

        // Parse stored string
        const encryptedObj = JSON.parse(encryptedStr);
        const iv = Buffer.from(encryptedObj.iv, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

        let decrypted = decipher.update(encryptedObj.data, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        console.error("Decryption error:", err);
        return "";
    }
}
const encryptedText = encrypt("50000"); // Encrypting salary
console.log("Encrypted:", encryptedText);

const decryptedText = decrypt(encryptedText);
console.log("Decrypted:", decryptedText);

//---------------------------------------------------------------------

const User = mongoose.models.User || mongoose.model("User", userSchema);

// JWT Authentication Endpoint
app.post("/api/jwt-auth", async (req, res) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            return res.status(400).json({ valid: 2, message: "Token and email are required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("JWT token verified:", decoded);
        } catch (error) {
            return res.status(401).json({ valid: 2, message: "Invalid or expired JWT token" });
        }

        if (decoded.email !== email) {
            return res.status(403).json({ valid: 2, message: "Unauthorized access" });
        }

        const user = await User.findOne({ email }).select("-password");
        if (!user) {
            return res.json({ valid: 0, message: "User not found" });
        }

        return res.status(200).json({ valid: 3, user });
    } catch (error) {
        console.error("JWT Authentication Error:", error);
        return res.status(500).json({ valid: 5, message: "Server error" });
    }
});


app.get("/api/auth/check/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ valid: 2, message: "Unauthorized: No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user by email
            const user = await User.findOne({ email }).select("-password");

            if (!user) {
                return res.status(404).json({ valid: 0, message: "User not found!" });
            }

            // Ensure the token belongs to the requested user
            if (decoded.id !== user._id.toString()) {
                return res.status(403).json({ valid: 4, message: "Unauthorized access" });
            }

            return res.status(200).json({ valid: 3, message: "User is authorized", user });
        } catch (err) {
            return res.status(403).json({ valid: 5, message: "Invalid or expired token" });
        }
    } catch (error) {
        console.error("Error checking authorization:", error);
        return res.status(500).json({ valid: 6, message: "Server error" });
    }
});

app.put("/api/update/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const updateData = req.body;

        // Check if username already exists
        if (updateData.username) {
            const up = await User.findOne({ username: updateData.username });
            if (up) {
                return res.json({ valid: 0 });
            }
        }

        // Prevent updating restricted fields
        delete updateData.email;
        delete updateData.password;
        delete updateData.recievepermission;
        delete updateData.rememberMe;

        // Encrypt sensitive fields if present in updateData
        if (updateData.monthlyincome) {
            updateData.monthlyincome = encrypt(updateData.monthlyincome);
        }
        if (updateData.Spousemonthlyincome) {
            updateData.Spousemonthlyincome = encrypt(updateData.Spousemonthlyincome);
        }
        if (updateData.Bankname) {
            updateData.Bankname = encrypt(updateData.Bankname);
        }
        if (updateData.AccountNumber) {
            updateData.AccountNumber = encrypt(updateData.AccountNumber);
        }
        if (updateData.IFSCCode) {
            updateData.IFSCCode = encrypt(updateData.IFSCCode);
        }
        if (updateData.LinkedCard) {
            updateData.LinkedCard = encrypt(updateData.LinkedCard);
        }
        if (updateData.UPIID) {
            updateData.UPIID = encrypt(updateData.UPIID);
        }

        // Find and update user
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ valid: 2, error: "User not found" });
        }

        res.json({ valid: 3, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ valid: 1, error: "Error updating user info", details: error.message });
    }
});

app.get("/api/users/:email", async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ valid: 2, message: "Email is required" });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.json({ valid: 0, message: "User not found" });
        }

        return res.status(200).json({ valid: 1, message: "User exists", user });
    } catch (error) {
        console.error("Error checking user:", error);
        return res.status(500).json({ valid: 5, message: "Server error" });
    }
});


app.post("/api/users", async (req, res) => {
    try {
        const { username,
            firstName, lastName, email, password, userage, Married,
            Spousename, Spouseage, Spousemonthlyincome, Children,
            monthlyincome, Primaryfinancialgoal, phone, Bankname, AccountNumber,
            IFSCCode, LinkedCard, rememberMe, recievepermission, UPIID } = req.body;
        console.log(email);
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({ valid: false, error: "Email already registered" });
        const monthlyIncomeStr = monthlyincome || '';
        const spouseIncomeStr = Spousemonthlyincome || '';
        const bankNameStr = Bankname || '';
        const accountNumberStr = AccountNumber || '';
        const ifscStr = IFSCCode || '';
        const linkedCardStr = LinkedCard || '';
        const upiStr = UPIID || '';
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashmonthlyincome = encrypt(monthlyIncomeStr);
        const hashspouseincome = encrypt(spouseIncomeStr);
        const hashbank = encrypt(bankNameStr);
        const hashaccnumber = encrypt(accountNumberStr);
        const hashifsc = encrypt(ifscStr);
        const hashlink = encrypt(linkedCardStr);
        const hashup = encrypt(upiStr);
        const newUser = new User({
            username,
            firstName, lastName, email, password: hashedPassword,
            userage, Married,
            Spousename, Spouseage, Spousemonthlyincome: hashspouseincome, Children,
            monthlyincome: hashmonthlyincome, Primaryfinancialgoal, phone, Bankname: hashbank, AccountNumber: hashaccnumber,
            IFSCCode: hashifsc, LinkedCard: hashlink, rememberMe, recievepermission, UPIID: hashup
        });
        await newUser.save();
        console.log(email);
        console.log(email);
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1m" });//if remmemberme -->7d else 1m
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true, // Use HTTPS in production
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ token, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

app.post("/api/signin", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.json({ valid: 2, error: "Invalid email or password" });
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) return res.json({ valid: 1, error: "Invalid email or password" });
        const accessToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1h" });
        console.log(accessToken);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ valid: 0, monthlyincome: user.monthlyincome, accessToken, message: "Sign-in successful" });
    } catch (error) {
        res.status(500).json({ error: "Sign-in failed" });
    }
});

//logout

app.post("/api/logout", (req, res) => {
    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "Strict" });
    res.status(200).json({ message: "Logged out successfully" });
});

//forgot-password
app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received email:", email); // Debugging log

        const user = await User.findOne({ email });
        if (!user) {
            console.error("User not found");
            return res.status(400).json({ message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_SERVER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink = `${process.env.FRONTEND_URL}/resetpassword?resetToken=${token}`;
        console.log("Reset Link:", resetLink); // Debugging log
        const emailTemplatePath = path.join(__dirname, 'resetpasswordemail.html');
        let emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
        emailTemplate = emailTemplate.replace('{{RESET_LINK}}', resetLink);
        const mailOptions = {
            from: process.env.EMAIL_SERVER,
            to: user.email,
            subject: "Password Reset Request For Your Fintrack account",
            text: `Click the following link to reset your password: ${resetLink}`,
            html: emailTemplate
        };
        await transporter.sendMail(mailOptions);
        return res.json({ token, message: "Password reset email sent!" });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Reset Password Endpoint
app.post("/api/reset-password", async (req, res) => {
    try {
        const { email,resetToken, newPassword } = req.body;
        // Find user by decoded token ID
        const user = await User.findOne({ email });
        console.log(email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const decoded = jwt.verify(resetToken , process.env.JWT_SECRET);
        if (decoded.id !== user._id.toString()) {
                return res.status(403).json({ valid: 4, message: "Unauthorized access" });
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log(email);
        // Update the password in the database
        user.password = hashedPassword;
        user.resetPasswordToken = undefined; // Remove the reset token
        user.resetPasswordExpires = undefined;
        await user.save();
        console.log(email);
        res.json({ success: true, message: "Password has been reset successfully!" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// chat
app.post('/api/chat', async (req, res) => {
    try{
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
  
    const data = await response.json();
    res.json(data);
    console.log(res);
    }catch(err){
        console.error("❌ Error calling Gemini API:", err.message);
    }
  });
//---------------------------------------------------------------------

// Bills and Notifications

// Bill schema
const billSchema = new mongoose.Schema({
    amount: Number,
    description: String,
    deadline: Date,
    splitAmount: Number,
    createdBy: String,
    friends: [String],
    createdAt: Date,
    reminderSent: Boolean
});

const Bill = mongoose.model('Bill', billSchema);

// API endpoint to save bill
app.post('/api/bills', async (req, res) => {
    try {
        const newBill = new Bill(req.body);
        await newBill.save();

        // Send initial notification to friends
        sendBillNotifications(newBill);

        res.status(201).json(newBill);
    } catch (error) {
        console.error('Error saving bill:', error);
        res.status(500).json({ error: 'Failed to save bill' });
    }
});

// API endpoint to schedule reminder
app.post('/api/schedule-reminder', (req, res) => {
    res.status(200).json({ message: 'Reminder scheduled' });
});

//dashboard
app.get("/api/get-upcoming-bills", async (req, res) => {
    try {
        const { userEmail } = req.query;
        if (!userEmail) {
            return res.status(400).json({ error: "User email is required" });
        }

        // Create today's date in IST
        const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        today.setHours(0, 0, 0, 0); // Reset to start of day in IST

        console.log("Searching bills for user:", userEmail);
        console.log("Today's date (IST):", today);
        const bills = await Bill.find({
            $or: [
                { createdBy: userEmail },
                { friends: { $in: [userEmail] } }
            ],
            deadline: { $gte: today }
        })
            .sort({ deadline: 1 }) // Sort by earliest due date
            .limit(3); // Limit to 3 bills

        console.log("Found Bills:", bills.length);
        res.json(bills);
    } catch (error) {
        console.error("Error fetching upcoming bills:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Function to send initial bill notifications
async function sendBillNotifications(bill) {
    const transporter = createMailTransporter();

    // Convert deadline to IST
    const deadlineIST = new Date(bill.deadline).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Send to each friend
    for (const friendEmail of bill.friends) {
        const mailOptions = {
            from: process.env.EMAIL_SERVER,
            to: friendEmail,
            subject: `New Split Bill: ${bill.description}`,
            html: `
                <h2>You've been added to a split bill</h2>
                <p><strong>${bill.createdBy}</strong> has created a new split bill and included you.</p>
                <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <p><strong>Description:</strong> ${bill.description}</p>
                    <p><strong>Your share:</strong> ₹${bill.splitAmount}</p>
                    <p><strong>Payment deadline:</strong> ${deadlineIST} (IST)</p>
                </div>
                <p>You will receive a reminder 6 hours before the deadline.</p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Initial notification sent to ${friendEmail}`);
        } catch (error) {
            console.error(`Error sending notification to ${friendEmail}:`, error);
        }
    }

    // Send email to bill creator
    const creatorMailOptions = {
        from: process.env.EMAIL_SERVER,
        to: bill.createdBy,
        subject: `New Split Bill: ${bill.description}`,
        html: `
            <h2>Your split bill has been created</h2>
            <p>You have created a new split bill and included your friends.</p>
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <p><strong>Description:</strong> ${bill.description}</p>
                <p><strong>Your share:</strong> ₹${bill.splitAmount}</p>
                <p><strong>Payment deadline:</strong> ${deadlineIST} (IST)</p>
            </div>
            <p>Your friends will receive a reminder 6 hours before the deadline.</p>
        `
    };

    try {
        await transporter.sendMail(creatorMailOptions);
        console.log(`Initial notification sent to ${bill.createdBy}`);
    } catch (error) {
        console.error(`Error sending notification to ${bill.createdBy}:`, error);
    }
}

// Function to create mail transporter
function createMailTransporter() {
    // Replace with your email service credentials
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SERVER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Schedule a cron job to run every minute to check for upcoming deadlines
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        // Convert now to IST
        const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        // Calculate the reminder window (6 hours before the deadline)
        const sixHoursFromNowIST = new Date(nowIST.getTime() + 30 * 60 * 1000);
        const sixHoursAndOneMinuteFromNowIST = new Date(sixHoursFromNowIST.getTime() + 60 * 1000);

        console.log(`Checking for reminders between: ${sixHoursFromNowIST} and ${sixHoursAndOneMinuteFromNowIST} (IST)`);

        // Find bills with deadlines exactly 6 hours from now
        const upcomingBills = await Bill.find({
            deadline: {
                $gte: sixHoursFromNowIST, 
                $lt: sixHoursAndOneMinuteFromNowIST 
            },
            reminderSent: false
        });

        for (const bill of upcomingBills) {
            // Send reminder emails
            await sendReminderEmails(bill);

            // Mark reminder as sent
            bill.reminderSent = true;
            await bill.save();
            console.log(`Reminder sent for bill: ${bill.description}`);
        }
    } catch (error) {
        console.error('Error checking for upcoming deadlines:', error);
    }
});


// Function to send reminder emails
async function sendReminderEmails(bill) {
    const transporter = createMailTransporter();

    // Convert deadline to IST for accurate display
    const deadlineIST = new Date(bill.deadline).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    // Email template function for reusability
    const generateEmailTemplate = (recipient) => `
        <h2>⏰ Payment Reminder</h2>
        <p>Your payment for the following bill is due in <strong>6 hours</strong>:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f8f8f8;">
            <p><strong>Description:</strong> ${bill.description}</p>
            <p><strong>Your share:</strong> ₹${bill.splitAmount}</p>
            <p><strong>Payment deadline:</strong> ${deadlineIST}</p>
            <p><strong>Created by:</strong> ${bill.createdBy}</p>
        </div>
        <p>Please make your payment as soon as possible to avoid missing the deadline.</p>
    `;

    // Send to each friend
    for (const friendEmail of bill.friends) {
        const mailOptions = {
            from: '"FinTrack Reminder" <noreply@bhaskarpandey787@gmail.com>',
            to: friendEmail,
            subject: `REMINDER: Payment due in 6 hours for ${bill.description}`,
            html: generateEmailTemplate(friendEmail),
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Reminder sent to ${friendEmail} for bill: ${bill.description}`);
        } catch (error) {
            console.error(`Error sending reminder to ${friendEmail}:`, error);
        }
    }

    // Send reminder to the bill creator
    const creatorMailOptions = {
        from: '"FinTrack Reminder" <noreply@bhaskarpandey787@gmail.com>',
        to: bill.createdBy,
        subject: `REMINDER: Payment due in 6 hours for ${bill.description}`,
        html: generateEmailTemplate(bill.createdBy),
    };

    try {
        await transporter.sendMail(creatorMailOptions);
        console.log(`Reminder sent to ${bill.createdBy} for bill: ${bill.description}`);
    } catch (error) {
        console.error(`Error sending reminder to ${bill.createdBy}:`, error);
    }
}

//---------------------------------------------------------------------

// Google sign-in

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const { token, user } = req.user;

        // Send token and user data to frontend
        res.json({ token, user });
    });

app.post("/api/google-signin", async (req, res) => {
    try {
        const { token } = req.body;

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email } = payload;

        // Check if user exists in your database
        let user = await User.findOne({ email }).select("-password");

        if (!user) {
            // User doesn't exist, redirect to signup
            return res.json({ status: "new_user" });
        }

        // User exists, generate JWT token
        const authToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        user.monthlyincome = decrypt(user.monthlyincome);
        res.json({ token: authToken, user });
    } catch (error) {
        console.error("Google sign-in error:", error);
        res.status(400).json({ error: "Invalid Google token" });
    }
});

//---------------------------------------------------------------------

//Transactions

// Define Schema and Model
const transSchema = new mongoose.Schema({
    date: Date,
    description: String,
    category: String,
    amount: Number,
    userEmail: { type: String, required: true }
});
const trans = mongoose.model("trans", transSchema);

// Create Transaction (POST)
app.post("/api/transactions", async (req, res) => {
    try {
        const newtrans = new trans(req.body);
        await newtrans.save();
        res.status(201).json({ id: newtrans._id });
    } catch (error) {
        console.error("Error saving transaction:", error);
        res.status(500).json({ error: "Failed to save transaction" });
    }
});

// Fetch All Transactions (GET)
app.get("/api/get-transactions", async (req, res) => {
    console.log("ok");
    const { userEmail } = req.query;
    try {
        const transactions = await trans.find({ userEmail }); // Fetch from MongoDB
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// Delete Transaction by ID (DELETE)
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTransaction = await trans.findByIdAndDelete(id); // Use correct model name
        if (!deletedTransaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
});

//---------------------------------------------------------------------

app.listen(PORT, () => console.log(`SERVER IS LIVE!!`));

//---------------------------------------------------------------------
