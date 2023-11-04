const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

exports.auth = async (req, res, next) => {

    try {

        if (!req.isAuthenticated()) {
            const token = req.cookies.token ||
                req.body.token ||
                req.header("Authorization").replace("Bearer", "");

            if (!token) {
                return res.status(401).render("login", { errorMessage: `JWT Token Missing` });
            }

            try {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
    
                req.user = decode;

                req.isAuthenticated = true;

            } catch (error) {
                return res
                    .status(401)
                    .render("login", { errorMessage: `Token is Invalid` })
            }
        }

        next();
    } catch (error) {
        return res.status(401).render("login", { errorMessage: `Something went wrong` });
    }
}