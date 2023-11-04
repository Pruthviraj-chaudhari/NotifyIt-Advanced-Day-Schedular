const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailsender");
const OTP = require("../models/OTP");
const User = require("../models/user");
const passport = require("passport");
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const bodyParser = require("body-parser");

require("dotenv").config();

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
});


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://notifyit-pro.onrender.com/auth/github/todo",
    scope: ['user:email'] 
}, function (accessToken, refreshToken, profile, done) {
    
    const email = profile.emails[0] ? profile.emails[0].value : null;

    const { id, displayName } = profile;

    User.findOrCreate({ githubId: id, name: displayName, email: email }, function (err, user) {
        if (err) {
            return done(err);
        }

        return done(null, user);
    });
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://notifyit-pro.onrender.com/auth/google/todo",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: ['profile', 'email'],
}, (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;
    User.findOrCreate({ googleId: id, name: displayName, email: email }, function (err, user) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
}));


exports.sendotp = async (req, res) => {
    try {

        const email = req.body.email;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required to send OTP',
            });
        }

        const checkPresent = await User.findOne({ email });

        if (checkPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        const otpBody = await OTP.create(otpPayload);

        res.status(200).render("new2", { successMessage: "OTP Sent Successfully", emailText: email });

    } catch (error) {
        console.log(error.message);
        return res.status(500).render("new1", { errorMessage: "Error occurred while sending OTP" });
    }
};

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, otp } = req.body;

        // Check if student already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render("new1", { errorMessage: "User Already Registered !" });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (response.length === 0) {
            // OTP not found for the email
            return res.status(400).render("new1", { errorMessage: "The OTP is not valid" });

        } else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).render("new1", { errorMessage: "The OTP is not valid" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        var fullName = firstName + " " + lastName;

        const defaultItems = [
            { name: "Hey👋 " + fullName },
            { name: "Welcome to your todolist 💝" }
        ];
        const user = await User.create({
            email,
            name: fullName,
            password: hashedPassword,
            items: defaultItems,
        });


        return res.status(200).redirect('/');

    } catch (error) {
        console.error(error);
        return res.status(500).render("new1", {
            errorMessage: `Email validation failed. Please try again later`
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        // If student not found with provided email
        if (!user) {
            return res.status(401).render('login', {
                errorMessage: `No User Found`
            });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email, id: user.id, name: user.name },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                }
            )

            // Save token to student document in database
            user.token = token
            await user.save();

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).redirect("/todo");

        } else {
            return res.status(401).render("login", { errorMessage: `Incorrect Password` })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).render("login", {
            errorMessage: `Login Failure Please Try Again}`
        })
    }
}
