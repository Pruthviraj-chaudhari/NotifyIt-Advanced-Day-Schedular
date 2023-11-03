const express = require("express");
const passport = require("passport");
const { sendotp, signUp, login } = require("../controllers/Auth");
const { addTodo, getTodo, deleteTodo } = require("../controllers/crud");
const {auth} = require("../middlewares/auth");

const router = express.Router();

router.use(express.static("public"));

router.post("/sendotp", sendotp);

router.get("/register", (req, res) => {
    res.render("new1", {errorMessage: null, successMessage: null});
});

router.post("/register", signUp);

router.get("/", (req,res)=>{
    res.render("login", {errorMessage: null});
})

router.post("/", login)

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.clearCookie("token");
        res.redirect("/");
    });
});

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/todo',
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        // Successful authentication
        res.redirect("/todo");
    }
);

router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/todo',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication
        
        res.redirect('/todo');
    }
);

// Todo-related routes
router.get('/todo', auth, getTodo);

router.post('/todo', auth, addTodo);

router.post('/delete', auth, deleteTodo);


router.get("/logout", (req, res) => {

    req.logout(() => {
        res.clearCookie('token').redirect("/");
    });
});

module.exports = router;