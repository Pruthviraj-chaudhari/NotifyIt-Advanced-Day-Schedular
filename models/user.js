const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const itemSchema = {
    name: String,
    deadline: String, 
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true
    },
    password: String,
    googleId: String,
    githubId: String,
    token: {
        type: String,
    },
    items: [itemSchema],
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
